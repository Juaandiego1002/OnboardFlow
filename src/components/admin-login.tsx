'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2, ArrowLeft, Mail, ShieldCheck, Sparkles, KeyRound, Eye, EyeOff, LogIn,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminLogin() {
  const { setView, setAdmin, setProcesses, setLoading, isLoading } = useAppStore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [magicLinkGenerated, setMagicLinkGenerated] = useState(false);
  const [adminId, setAdminId] = useState('');

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    if (!email.trim()) { setEmailError('El correo es obligatorio'); return; }
    if (!email.includes('@')) { setEmailError('Correo electrónico no válido'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }

      if (data.mode === 'password') {
        // Direct login - verify and enter
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: data.adminId }),
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
          setAdmin(verifyData.admin);
          setProcesses(verifyData.processes);
          setView('admin-panel');
          toast({ title: 'Bienvenido', description: `Has accedido como ${verifyData.admin.email}` });
        }
      } else {
        setAdminId(data.adminId);
        setMagicLinkGenerated(true);
      }
    } catch {
      toast({ title: 'Error de conexión', description: 'No se pudo conectar al servidor.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (!email.trim()) { setEmailError('El correo es obligatorio'); return; }
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
      toast({ title: 'Magic link generado', description: 'En producción recibirías un correo. Haz clic en el botón para continuar.' });
    } catch {
      toast({ title: 'Error de conexión', variant: 'destructive' });
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
      toast({ title: 'Error de conexión', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-emerald-200/20 to-teal-200/10 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-tr from-teal-200/20 to-emerald-200/10 blur-3xl animate-float-delayed" />
      </div>

      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 shadow-inner">
            <ShieldCheck className="h-6 w-6 text-emerald-700" />
          </div>
          <CardTitle className="text-xl">Acceso de Administrador</CardTitle>
          <CardDescription>
            {magicLinkGenerated
              ? 'Tu magic link está listo (simulado)'
              : 'Ingresa tu correo autorizado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!magicLinkGenerated ? (
            <>
              <form onSubmit={handleLoginWithPassword} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@startup.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      className={`pl-10 ${emailError ? 'border-red-400' : ''}`}
                      disabled={isLoading}
                    />
                    {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium">Contraseña</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-9"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full shadow-lg shadow-emerald-500/10" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Accediendo...</>
                  ) : (
                    <><LogIn className="mr-2 h-4 w-4" />Iniciar sesión</>
                  )}
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">o</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handleSendMagicLink} disabled={isLoading}>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar magic link
                </Button>
                <Button variant="link" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => setView('forgot-password')}>
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-emerald-50/50 p-5 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-emerald-800 mb-1">Magic link generado</p>
                <p className="text-sm text-emerald-700 font-semibold">{email}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-200/50 px-3 py-1 text-[11px] text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  Simulado — sin envío real
                </div>
              </div>
              <Button onClick={handleMagicLinkClick} className="w-full text-balance shadow-lg shadow-emerald-500/10" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verificando...</>
                ) : (
                  'Haz clic aquí para continuar'
                )}
              </Button>
            </div>
          )}

          <Button variant="ghost" className="w-full mt-4" onClick={() => { setView('landing'); setMagicLinkGenerated(false); }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
