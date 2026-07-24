import { z } from 'zod';
import { promises as dns } from 'dns';
import net from 'net';

const lettersSpaceRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
const nameMin = 2;
const nameMax = 100;

export const nameSchema = z
  .string()
  .trim()
  .min(nameMin, `El nombre debe tener al menos ${nameMin} caracteres`)
  .max(nameMax, `El nombre debe tener máximo ${nameMax} caracteres`)
  .regex(lettersSpaceRegex, 'El nombre solo puede contener letras y espacios');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'El correo es obligatorio')
  .email('Correo electrónico no válido')
  .refine((val) => {
    const domain = val.split('@')[1];
    return domain && domain.includes('.') && domain.split('.').pop()!.length >= 2;
  }, 'El correo debe tener un dominio válido (ej: usuario@empresa.com)');

async function smtpVerify(email: string): Promise<boolean | null> {
  const domain = email.split('@')[1];
  if (!domain) return null;

  let mxRecords;
  try {
    mxRecords = await dns.resolveMx(domain);
  } catch {
    return null;
  }
  if (!mxRecords || mxRecords.length === 0) return null;

  mxRecords.sort((a, b) => a.priority - b.priority);
  const host = mxRecords[0].exchange;

  return new Promise((resolve) => {
    const socket = new net.Socket();
    let step = 0;
    let timeout: NodeJS.Timeout;

    const cleanup = () => {
      clearTimeout(timeout);
      socket.destroy();
    };

    timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 8000);

    socket.setEncoding('utf8');
    let buffer = '';

    socket.on('data', (data: string) => {
      buffer += data;
      if (!buffer.includes('\r\n')) return;
      const lines = buffer.split('\r\n').filter(Boolean);
      buffer = '';
      const code = parseInt(lines[0]?.substring(0, 3) || '0', 10);

      if (step === 0) {
        if (code === 220) {
          step = 1;
          socket.write(`HELO onboardflow.local\r\n`);
        } else {
          cleanup();
          resolve(null);
        }
      } else if (step === 1) {
        if (code === 250) {
          step = 2;
          socket.write(`MAIL FROM:<verify@onboardflow.local>\r\n`);
        } else {
          cleanup();
          resolve(null);
        }
      } else if (step === 2) {
        if (code === 250) {
          step = 3;
          socket.write(`RCPT TO:<${email}>\r\n`);
        } else {
          cleanup();
          resolve(null);
        }
      } else if (step === 3) {
        cleanup();
        // 250 = accepted (likely exists), 550 = rejected (doesn't exist)
        // Some providers always return 250, others properly reject
        resolve(code === 250);
      }
    });

    socket.on('error', () => {
      cleanup();
      resolve(null);
    });

    socket.on('close', () => {
      cleanup();
      resolve(null);
    });

    socket.connect(25, host);
  });
}

export async function validateEmailExists(email: string): Promise<true | string> {
  const domain = email.split('@')[1];
  if (!domain) return 'Correo electrónico no válido';

  // 1. DNS MX check
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return `El dominio "${domain}" no está configurado para recibir correos`;
    }
  } catch {
    return `El dominio "${domain}" no existe`;
  }

  // 2. SMTP verification
  const smtpResult = await smtpVerify(email);
  if (smtpResult === false) {
    return `"${email}" no parece ser un correo válido. Verifica la dirección e inténtalo de nuevo`;
  }

  return true;
}

export const processNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre debe tener máximo 100 caracteres')
  .regex(lettersSpaceRegex, 'El nombre solo puede contener letras y espacios');

export const stepTitleSchema = z
  .string()
  .trim()
  .min(2, 'El título debe tener al menos 2 caracteres')
  .max(200, 'El título debe tener máximo 200 caracteres')
  .regex(lettersSpaceRegex, 'El título solo puede contener letras y espacios');

export const loginSchema = z.object({
  email: emailSchema,
});

export const verifySchema = z.object({
  adminId: z.string().min(1, 'adminId es requerido'),
});

export const processCreateSchema = z.object({
  adminId: z.string().min(1, 'adminId es requerido'),
  name: processNameSchema,
  description: z.string().optional().default(''),
  durationWeeks: z.number().int().min(1).max(52).optional().default(4),
  steps: z.array(
    z.object({
      title: stepTitleSchema,
      description: z.string().optional().default(''),
      week: z.number().int().min(1),
      type: z.enum(['task', 'reading', 'meeting']).optional().default('task'),
      materialUrl: z.string().optional().default(''),
      order: z.number().int().optional().default(0),
    })
  ).optional(),
});

export const processUpdateSchema = z.object({
  name: processNameSchema.optional(),
  description: z.string().optional(),
  durationWeeks: z.number().int().min(1).max(52).optional(),
});

export const createEmployeeSchema = z.object({
  adminId: z.string().min(1),
  name: nameSchema,
  email: emailSchema,
});

export const inviteSchema = z.object({
  employeeName: nameSchema,
  employeeEmail: emailSchema,
});

export const stepCreateSchema = z.object({
  processId: z.string().min(1),
  title: stepTitleSchema,
  description: z.string().optional().default(''),
  week: z.number().int().min(1).optional().default(1),
  type: z.enum(['task', 'reading', 'meeting']).optional().default('task'),
  materialUrl: z.string().optional().default(''),
  order: z.number().int().optional().default(0),
});

export const stepBatchUpdateSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string().min(1),
      title: stepTitleSchema.optional(),
      description: z.string().optional(),
      week: z.number().int().min(1).optional(),
      type: z.enum(['task', 'reading', 'meeting']).optional(),
      materialUrl: z.string().optional(),
      order: z.number().int().optional(),
    })
  ).min(1),
});

export const stepUpdateSchema = z.object({
  title: stepTitleSchema.optional(),
  description: z.string().optional(),
  week: z.number().int().min(1).optional(),
  type: z.enum(['task', 'reading', 'meeting']).optional(),
  materialUrl: z.string().optional(),
  order: z.number().int().optional(),
});

export const progressCreateSchema = z.object({
  inviteId: z.string().min(1),
  stepId: z.string().min(1),
  evidence: z.string().optional().default(''),
  evidenceUrl: z.string().optional().default(''),
});

export const progressDeleteSchema = z.object({
  inviteId: z.string().min(1),
  stepId: z.string().min(1),
});
