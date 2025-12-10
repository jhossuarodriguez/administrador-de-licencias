import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPassword() {
    return (
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <Image className="absolute inset-0 opacity-5 -z-10 aspect-[1024/505] object-contain w-full h-full" src='/CAID-LOGO.webp' alt='CAID Logo' width={800} height={800} />
            <Card className="w-full max-w-sm bg-white border-gray-200 shadow-xl">
                <CardHeader className="text-center flex flex-col items-center justify-items-center">
                    <Image className='mb-4' src="/CAID-LOGO.webp" alt='Logo del CAID' width={120} height={120} />
                    <CardTitle className="text-3xl font-bold text-[#1A2E35]">Restablecer Contraseña</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form>
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-11"
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-4 pt-2">
                    <Button type="submit" className="cursor-pointer w-full text-white bg-gray-900 hover:bg-gray-800 h-11 font-medium">
                        Enviar Enlace de Restablecimiento
                    </Button>
                    <div className="text-sm text-gray-600">
                        ¿Recordaste tu contraseña?{' '}
                        <Link href="/" className="text-primary hover:text-primary/80 font-medium">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}