'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmployeeAccess() {
  const { setView, setLoading, isLoading, setEmployeeData } = useAppStore();
  const { toast } = useToast();

  const [token, setToken] = useState('');

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({ title: 'Token requerido', description: 'Introduce tu enlace de acceso.', variant: 'destructive' });
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100">
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
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                En producción, accederías directamente desde el enlace del correo.
                Para esta demo, pega el token que te dio tu administrador.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !token.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accediendo...
                </>
              ) : (
                'Acceder a mi onboarding'
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
