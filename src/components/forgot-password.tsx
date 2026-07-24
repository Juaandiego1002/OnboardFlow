'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Mail, KeyRound, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ForgotPassword() {
  const { setView } = useAppStore();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    if (!email.trim()) { setEmailError('El correo es obligatorio'); return; }
    if (!email.includes('@')) { setEmailError('Correo no válido'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }
      setResetToken(data.resetToken);
      toast({ title: 'Enlace generado', description: 'En producción recibirías un correo. Usa el token para continuar.' });
    } catch {
      toast({ title: 'Error de conexión', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-amber-200/20 to-orange-200/10 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-tr from-orange-200/20 to-amber-200/10 blur-3xl animate-float-delayed" />
      </div>

      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-inner">
            <KeyRound className="h-6 w-6 text-amber-700" />
          </div>
          <CardTitle className="text-xl">Recuperar Contraseña</CardTitle>
          <CardDescription>
            {resetToken
              ? 'Tu enlace de recuperación está listo'
              : 'Ingresa tu correo para recibir un enlace de recuperación'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetToken ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@startup.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    className={`pl-10 ${emailError ? 'border-red-400' : ''}`}
                    disabled={loading}
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full shadow-lg shadow-amber-500/10" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-50/50 p-5 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-amber-800 mb-1">Token generado para:</p>
                <p className="text-sm text-amber-700 font-semibold mb-3">{email}</p>
                <div className="bg-white rounded-lg border border-amber-200 p-2 mb-2">
                  <code className="text-xs text-amber-900 break-all select-all font-mono">{resetToken}</code>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/50 px-3 py-1 text-[11px] text-amber-700">
                  <Sparkles className="h-3 w-3" />
                  Copia este token para restablecer tu contraseña
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setView('reset-password');
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Restablecer contraseña
              </Button>
            </div>
          )}

          <Button variant="ghost" className="w-full mt-4" onClick={() => setView('admin-login')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
