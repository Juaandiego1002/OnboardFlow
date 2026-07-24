'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, ArrowRight, ClipboardCopy, CheckCircle2, Sparkles } from 'lucide-react';

export function LandingPage() {
  const { setView } = useAppStore();
  const [hoverAdmin, setHoverAdmin] = useState(false);
  const [hoverEmployee, setHoverEmployee] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/20 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-teal-200/30 to-emerald-200/20 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-emerald-100/20 blur-2xl animate-pulse-soft" />
        <div className="absolute bottom-1/3 right-1/4 h-40 w-40 rounded-full bg-teal-100/20 blur-2xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
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
        </div>

        {/* Headline */}
        <div className="mb-12 max-w-2xl text-center animate-fade-in-up-delayed">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 text-xs font-medium text-emerald-700 mb-6 shadow-sm">
            <Sparkles className="h-3 w-3" />
            Onboarding inteligente para startups en crecimiento
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 leading-tight">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg animate-fade-in-up-delayed-2">
          {/* Admin Card */}
          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 hover:shadow-emerald-500/10 group"
            onMouseEnter={() => setHoverAdmin(true)}
            onMouseLeave={() => setHoverAdmin(false)}
            onClick={() => setView('admin-login')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardCopy className="h-4 w-4 text-emerald-700" />
                </div>
                Panel Admin
              </CardTitle>
              <CardDescription>
                Crea y gestiona procesos de onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full text-balance group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-300 transition-all" variant="outline">
                Panel Admin
                <ArrowRight className={`ml-2 h-4 w-4 transition-all ${hoverAdmin ? 'translate-x-1' : ''}`} />
              </Button>
            </CardContent>
          </Card>

          {/* Employee Card */}
          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-teal-300 hover:-translate-y-1 hover:shadow-teal-500/10 group"
            onMouseEnter={() => setHoverEmployee(true)}
            onMouseLeave={() => setHoverEmployee(false)}
            onClick={() => setView('employee-access')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" />
                </div>
                Soy Empleado
              </CardTitle>
              <CardDescription>
                Accede a tu proceso de onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full text-balance group-hover:bg-teal-50 group-hover:text-teal-700 group-hover:border-teal-300 transition-all" variant="outline">
                Mi onboarding
                <ArrowRight className={`ml-2 h-4 w-4 transition-all ${hoverEmployee ? 'translate-x-1' : ''}`} />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex items-center gap-6 text-xs text-muted-foreground animate-fade-in-up-delayed-2">
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sin configuración
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Magic links
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Progreso en tiempo real
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground relative z-10">
        <p>OnboardFlow &mdash; Demo construida con Next.js + Tailwind CSS</p>
      </footer>
    </div>
  );
}
