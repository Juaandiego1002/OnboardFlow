'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  Mail,
  User,
  BadgeCheck,
  Search,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Employee {
  id: string;
  name: string;
  email: string;
}

export function ManageEmployees() {
  const { admin, setView } = useAppStore();
  const { toast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const validateForm = () => {
    let valid = true;
    setNameError('');
    setEmailError('');
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!name.trim()) { setNameError('El nombre es obligatorio'); valid = false; }
    else if (name.trim().length < 2) { setNameError('El nombre debe tener al menos 2 caracteres'); valid = false; }
    else if (!nameRegex.test(name.trim())) { setNameError('El nombre solo puede contener letras y espacios'); valid = false; }
    if (!email.trim()) { setEmailError('El correo es obligatorio'); valid = false; }
    else if (!email.includes('@')) { setEmailError('Correo electrónico no válido'); valid = false; }
    else {
      const domain = email.split('@')[1];
      if (!domain || !domain.includes('.') || (domain.split('.').pop() || '').length < 2) {
        setEmailError('El correo debe tener un dominio válido (ej: usuario@empresa.com)');
        valid = false;
      }
    }
    return valid;
  };

  const fetchEmployees = async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/employees?adminId=${admin.id}`);
      const data = await res.json();
      if (res.ok) setEmployees(data.employees);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin || !validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: admin.id, name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Empleado registrado', description: `${name} ha sido agregado.` });
      setName('');
      setEmail('');
      setEmailError('');
      setNameError('');
      setShowForm(false);
      fetchEmployees();
    } catch {
      toast({ title: 'Error', description: 'No se pudo registrar.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Empleado eliminado' });
        fetchEmployees();
      } else {
        toast({ title: 'No se puede eliminar', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setView('admin-panel')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="font-semibold">Directorio de Empleados</h1>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
        {!showForm ? (
          <Button className="w-full" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar nuevo empleado
          </Button>
        ) : (
          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlusIcon className="h-5 w-5 text-emerald-600" />
                Nuevo Empleado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                    <Label className="text-xs">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className={`pl-9 ${nameError ? 'border-red-400' : ''}`}
                        placeholder="Ej: María García"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setNameError(''); }}
                      />
                    </div>
                    {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className={`pl-9 ${emailError ? 'border-red-400' : ''}`}
                        type="email"
                        placeholder="maria@startup.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      />
                    </div>
                    {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={loading || !name.trim() || !email.trim()}>
                    {loading ? <Loader2 className="mr-1.5 h-3.5 animate-spin" /> : <Plus className="mr-1.5 h-3.5" />}
                    Registrar
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {employees.length === 0 && !loading ? (
          <Card className="border-dashed bg-gradient-to-b from-muted/30 to-muted/10">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 animate-float">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-sm font-medium mb-1">Directorio vacío</p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Agrega a tu equipo para invitarlos rápidamente a los procesos de onboarding.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
          {employees.length > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
          <div className="space-y-2">
            {employees
              .filter((emp) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
              })
              .map((emp) => {
              const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const colors = [
                'from-emerald-500 to-teal-600',
                'from-blue-500 to-indigo-600',
                'from-amber-500 to-orange-600',
                'from-purple-500 to-pink-600',
                'from-rose-500 to-red-600',
                'from-cyan-500 to-blue-600',
              ];
              const colorIdx = emp.name.length % colors.length;
              return (
              <Card key={emp.id} className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center shrink-0 shadow-sm`}>
                      <span className="text-xs font-bold text-white">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{emp.name}</p>
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDelete(emp.id, emp.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              );
            })}
          </div>
          </>
        )}

        {loading && employees.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </main>
    </div>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
