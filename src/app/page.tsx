"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { Suspense, useState } from "react"
import { Loader2, PlayCircle } from "lucide-react"
import { AppLogo } from "@/components/brand/AppLogo"
import { OAuthErrorAlert } from "@/components/auth/OAuthErrorAlert"
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons"
import { useAuth } from "@/hooks/useAuth"
import { DEMO_ACCOUNT, isDemoMode } from "@/lib/demo"
import { useRouter } from "next/navigation"

export default function Home() {
  const { login, socialLogin, socialRedirect, isPending, isLoading, authError } = useAuth()
  const router = useRouter()
  const [isDemoLogin, setIsDemoLogin] = useState(false)
  const isBusy = isLoading || isPending || socialRedirect !== null || isDemoLogin

  const signIn = async (username: string, password: string) => {
    const result = await login({ username, password })

    if (result?.success) {
      router.push("/dashboard")
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    await signIn(formData.get("username") as string, formData.get("password") as string)
  }

  const handleDemoLogin = async () => {
    setIsDemoLogin(true)
    const result = await signIn(DEMO_ACCOUNT.username, DEMO_ACCOUNT.password)
    // Si entró, el botón sigue en "Entrando..." hasta que cargue el dashboard
    if (!result?.success) setIsDemoLogin(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-sm bg-white border-gray-200 shadow-xl">
        <CardHeader className="text-center flex flex-col items-center justify-items-center">
          <AppLogo size="lg" className="mb-4" />
          <CardTitle className="text-3xl font-bold text-[#1A2E35]">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Accede a tu cuenta para administrar licencias
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="flex flex-col gap-5">
            {isDemoMode() && (
              <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4">
                <p className="text-sm font-semibold text-gray-900">Demo pública</p>
                <p className="mt-1 text-sm text-gray-600">
                  Entra sin registrarte con permisos de administrador. Los datos se reinician cada día.
                </p>
                <Button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isBusy}
                  className="mt-3 h-11 w-full cursor-pointer font-medium text-white"
                >
                  {isDemoLogin ? <Loader2 className="animate-spin" /> : <PlayCircle />}
                  {isDemoLogin ? "Entrando..." : "Probar demo"}
                </Button>
              </div>
            )}

            {authError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {authError}
              </div>
            ) : (
              <Suspense fallback={null}>
                <OAuthErrorAlert />
              </Suspense>
            )}

            <SocialAuthButtons
              onSelect={socialLogin}
              redirectingTo={socialRedirect}
              disabled={isBusy}
              dividerText="o con tu usuario"
            />

            <form onSubmit={handleSubmit} id="login-form" className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-base font-medium text-gray-700">Usuario o Email</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Usuario o Email"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-secondary h-11"
                  required
                  disabled={isBusy}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base font-medium text-gray-700">Contraseña</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  placeholder="Contraseña"
                  type="password"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-secondary h-11"
                  required
                  disabled={isBusy}
                />
              </div>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-2">
          <Button
            type="submit"
            form="login-form"
            className="w-full text-white bg-gray-900 hover:bg-gray-800 h-11 font-medium cursor-pointer"
            disabled={isBusy}
          >
            {isLoading && socialRedirect === null && !isDemoLogin ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
          <div className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
              Crear cuenta
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
