import { PrismaClient } from "@prisma/client";

async function TestConnection() {
    const prisma = new PrismaClient()
    try {
        console.log('Testeando conexion a base de datos')
        const licenses = await prisma.license.findMany()
        console.log(`✅ Conexion a base de datos exitosa: Licencias encontradas`, licenses.length)

        if (licenses.length > 0) {
            console.log('Primeras licencias', licenses.slice(0, 3))
        } else {
            console.log('No hay licencias en la base de datos')
        }
    } catch (err) {
        console.error('❌ Error de conexion', err.message)
        console.error('Detalles incompletos', err)
    } finally {
        await prisma.$disconnect()
    }
}

TestConnection()

