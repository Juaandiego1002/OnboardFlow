'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  LogIn,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Sparkles,
  Rocket,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmployeeAccess() {
  const { setView, setLoading, isLoading, setEmployeeData, pendingEmployeeToken, setPendingEmployeeToken } = useAppStore();
  const { toast } = useToast();

  const [token, setToken] = useState(pendingEmployeeToken || '');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (pendingEmployeeToken) {
      setPendingEmployeeToken(null);
    }
  }, [pendingEmployeeToken, setPendingEmployeeToken]);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError('');
    if (!token.trim()) {
      setTokenError('Introduce tu enlace de acceso.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/invite/${encodeURIComponent(token.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Enlace no válido',
          description: data.error || 'Este enlace no es válido o ha expirado. Pide a tu administrador que te envíe uno nuevo.',
          variant: 'destructive',
        });
        return;
      }

      setEmployeeData(data);
      setView('employee-onboarding');
      toast({
        title: `Bienvenido, ${data.employeeName}`,
        description: `Proceso: ${data.process.name}`,
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gradient-to-br from-teal-200/20 to-emerald-200/10 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-tr from-emerald-200/20 to-teal-200/10 blur-3xl animate-float-delayed" />
      </div>

      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 shadow-inner">
            <LogIn className="h-6 w-6 text-teal-700" />
          </div>
          <CardTitle className="text-xl">Acceso de Empleado</CardTitle>
          <CardDescription>
            Introduce el enlace de acceso que recibiste de tu administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Enlace de acceso</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="token"
                  placeholder="Pega tu enlace de acceso aquí..."
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setTokenError(''); }}
                  className={`pl-10 ${tokenError ? 'border-red-400' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {tokenError && <p className="text-xs text-red-500">{tokenError}</p>}
            </div>

            <div className="rounded-lg bg-gradient-to-b from-muted/50 to-muted/30 p-3 border text-xs text-muted-foreground space-y-1.5">
              <p className="flex items-center gap-1.5 font-medium text-foreground/80">
                <Sparkles className="h-3 w-3 text-teal-600" />
                Modo demostración
              </p>
              <p>
                En producción accederías automáticamente desde el enlace del correo.
                Para esta demo, pega el token que te dio tu administrador.
              </p>
            </div>

            <Button type="submit" className="w-full shadow-lg shadow-teal-500/10" disabled={isLoading || !token.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accediendo...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Acceder a mi onboarding
                </>
              )}
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setView('landing')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
