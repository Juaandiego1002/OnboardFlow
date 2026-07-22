'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminLogin() {
  const { setView, setAdmin, setProcesses, setLoading, isLoading } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [magicLinkGenerated, setMagicLinkGenerated] = useState(false);
  const [adminId, setAdminId] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: 'Correo inválido',
        description: 'Por favor, introduce un correo electrónico válido.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }

      setAdminId(data.adminId);
      setMagicLinkGenerated(true);
      toast({
        title: 'Magic link generado',
        description: 'En producción recibirías un correo. Haz clic en el botón para continuar.',
      });
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar al servidor.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }

      setAdmin(data.admin);
      setProcesses(data.processes);
      setView('admin-panel');
      toast({ title: 'Bienvenido', description: `Has accedido como ${data.admin.email}` });
    } catch {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo verificar el token.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
          </div>
          <CardTitle className="text-xl">Acceso de Administrador</CardTitle>
          <CardDescription>
            {magicLinkGenerated
              ? 'Tu magic link está listo (simulado)'
              : 'Introduce tu correo para recibir un magic link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!magicLinkGenerated ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@startup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando magic link...
                  </>
                ) : (
                  'Enviar magic link'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <Mail className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-800">
                  Magic link generado para:
                </p>
                <p className="text-sm text-emerald-700">{email}</p>
                <p className="mt-2 text-xs text-emerald-600">
                  En producción, recibirías este enlace por correo.
                </p>
              </div>
              <Button onClick={handleMagicLinkClick} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Hacer clic en magic link (continuar)'
                )}
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => {
              setView('landing');
              setMagicLinkGenerated(false);
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
