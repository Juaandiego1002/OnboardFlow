import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

let resend: Resend | null = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

interface SendInviteParams {
  to: string;
  employeeName: string;
  processName: string;
  token: string;
  adminName?: string;
}

export async function sendInviteEmail({
  to,
  employeeName,
  processName,
  token,
  adminName,
}: SendInviteParams) {
  if (!resend) {
    console.warn('RESEND_API_KEY no configurada. Email no enviado.');
    return { success: false, error: 'Email no configurado' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const accessUrl = `${appUrl}?token=${encodeURIComponent(token)}`;
  const expiresInDays = 30;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc;">
      <div style="max-width: 480px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="background: #0f766e; padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">OnboardFlow</h1>
        </div>
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; color: #334155; font-size: 16px;">Hola <strong>${employeeName}</strong>,</p>
          <p style="margin: 0 0 16px; color: #334155; font-size: 16px;">
            ${adminName ? `<strong>${adminName}</strong> te ha invitado al proceso de onboarding` : 'Has sido invitado al proceso de onboarding'}
            <strong>${processName}</strong>.
          </p>
          <p style="margin: 0 0 24px; color: #334155; font-size: 16px;">
            Haz clic en el siguiente enlace para comenzar:
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${accessUrl}" style="display: inline-block; background: #0f766e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500;">
              Acceder a mi onboarding
            </a>
          </div>
          <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">
            O copia este enlace en tu navegador:
          </p>
          <div style="background: #f1f5f9; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
            <code style="font-size: 13px; color: #475569; word-break: break-all;">${accessUrl}</code>
          </div>
          <p style="margin: 0; color: #94a3b8; font-size: 13px;">
            Este enlace expirar\u00e1 en ${expiresInDays} d\u00edas.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Te han invitado a: ${processName}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: 'Error al enviar el correo' };
  }
}
