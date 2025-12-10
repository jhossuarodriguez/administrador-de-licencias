import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                status: true,
                departmentId: true,
                department: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                // NO incluir password por seguridad
                Assignment: {
                    select: {
                        id: true,
                        license: {
                            select: {
                                id: true,
                                provider: true,
                                model: true
                            }
                        }
                    }
                }
            }
        })
        return NextResponse.json(users)
    } catch (err) {
        console.error("Error al obtener usuarios:", err)
        return NextResponse.json(
            { error: "Error al obtener los usuarios" },
            { status: 500 }
        )
    }

}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('Datos recibidos en API:', data);

        // Validar campos requeridos
        const { name, username, departmentId, status, startDate } = data;

        if (!name || !username) {
            return NextResponse.json(
                { error: 'Nombre y nombre de usuario son requeridos' },
                { status: 400 }
            );
        }

        // Crear usuario en la base de datos
        const newUser = await prisma.user.create({
            data: {
                name: name,
                username: username,
                email: `${username}@example.com`, // Email generado automáticamente
                status: status || 'active',
                departmentId: departmentId || null,
                startDate: startDate ? new Date(startDate) : null,
            },
        });

        return NextResponse.json({ user: newUser }, { status: 201 });
    }
    catch (err: any) {
        console.error("Error al crear usuario:", err)

        // Manejar errores específicos de Prisma
        if (err.code === 'P2002') {
            return NextResponse.json(
                { error: "El nombre de usuario ya existe" },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: "Error al crear usuario" },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');
        const data = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'ID del usuario es requerido' },
                { status: 400 }
            );
        }

        // Actualizar usuario en la base de datos
        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(userId)
            },
            data: {
                name: data.name,
                username: data.username,
                status: data.status,
                departmentId: data.departmentId,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return NextResponse.json(
            {
                error: 'Error al actualizar el usuario',
                success: false
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json(
                { error: 'ID del usuario es requerido' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: {
                id: parseInt(userId)
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return NextResponse.json(
            {
                error: 'Error al eliminar el usuario',
                success: false
            },
            { status: 500 }
        );
    }
}