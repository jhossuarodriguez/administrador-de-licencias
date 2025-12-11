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
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function Home() {
  const { login, isPending, isLoading, authError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    const result = await login({ username, password })

    if (result.success) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Image className="absolute inset-0 opacity-5 -z-10 aspect-[1024/505] object-contain w-full h-full" src='/logo.png' alt='Logo' width={800} height={800} />
      <Card className="w-full max-w-sm ">
        <CardHeader className="text-center flex flex-col items-center justify-items-center">
          <Image className='mb-4' src="/logo.png" alt='Logo' width={120} height={120} />
          <CardTitle className="text-3xl font-bold text-[#1A2E35]">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Accede a tu cuenta para administrar licencias
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <form onSubmit={handleSubmit} id="login-form">
            <div className="flex flex-col gap-5">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {authError}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="usuario"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#44ADE2] focus:ring-[#44ADE2] h-11"
                  required
                  disabled={isLoading || isPending}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#44ADE2] focus:ring-[#44ADE2] h-11"
                  required
                  disabled={isLoading || isPending}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-2">
          <Button
            type="submit"
            form="login-form"
            className="w-full text-white bg-gray-900 hover:bg-gray-800 h-11 font-medium cursor-pointer"
            disabled={isLoading || isPending}
          >
            {isLoading || isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
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