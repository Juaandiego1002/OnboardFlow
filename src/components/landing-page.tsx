'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Rocket, ArrowRight, ClipboardCopy, CheckCircle2 } from 'lucide-react';

export function LandingPage() {
  const { setView } = useAppStore();
  const [hoverAdmin, setHoverAdmin] = useState(false);
  const [hoverEmployee, setHoverEmployee] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              OnboardFlow
            </h1>
            <p className="text-xs text-muted-foreground">
              Onboarding estructurado para startups
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-12 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Acaba con el caos del{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              onboarding
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Guía a tus nuevos empleados por un proceso estructurado durante sus primeras semanas.
            Sin improvisaciones, sin pasos olvidados.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          {/* Admin Card */}
          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5"
            onMouseEnter={() => setHoverAdmin(true)}
            onMouseLeave={() => setHoverAdmin(false)}
            onClick={() => setView('admin-login')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ClipboardCopy className="h-4 w-4 text-emerald-700" />
                </div>
                Panel Admin
              </CardTitle>
              <CardDescription>
                Crea y gestiona procesos de onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Acceder como administrador
                <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${hoverAdmin ? 'translate-x-1' : ''}`} />
              </Button>
            </CardContent>
          </Card>

          {/* Employee Card */}
          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-teal-300 hover:-translate-y-0.5"
            onMouseEnter={() => setHoverEmployee(true)}
            onMouseLeave={() => setHoverEmployee(false)}
            onClick={() => setView('employee-access')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" />
                </div>
                Soy Empleado
              </CardTitle>
              <CardDescription>
                Accede a tu proceso de onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Acceder como empleado
                <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${hoverEmployee ? 'translate-x-1' : ''}`} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>OnboardFlow &mdash; Demo construida con Next.js + Tailwind CSS</p>
      </footer>
    </div>
  );
}
