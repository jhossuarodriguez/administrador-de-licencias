import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { userCreateSchema, userUpdateSchema } from "@/lib/validations/users";
import { z } from "zod";
import { idQuerySchema } from "@/lib/validations/common";
import { requireAdminRequest, requireApiSession } from "@/lib/apiAuth";

export async function GET() {
    try {
        const { response } = await requireApiSession();
        if (response) return response;

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
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const body = await request.json();
        const validation = userCreateSchema.safeParse(body)

        if (!validation.success){
            return NextResponse.json(
                { error: "Datos invalidos ", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400 }
            )
        }

        // Validar campos requeridos
        const data = validation.data

        // Crear usuario en la base de datos
        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                status: data.status,
                departmentId: data.departmentId ?? null,
                startDate: data.startDate ?? null,
            }
        });

        return NextResponse.json({ user: newUser }, { status: 201 });
    }
    catch (err) {
        console.error("Error al crear usuario:", err)

        // Manejar errores específicos de Prisma
        if (err === 'P2002') {
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
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const { searchParams } = new URL(request.url);

        const idValidation = idQuerySchema.safeParse({
            id: searchParams.get("id")
        })

        if (!idValidation.success){
            return NextResponse.json(
                { error: "ID de usuario invalido", issues: z.flattenError(idValidation.error).fieldErrors },
                { status: 400 }
            )
        }

        const bodyValidation = userUpdateSchema.safeParse(await request.json())

        if (!bodyValidation.success){
            return NextResponse.json(
                { error: "Error al modificar usuario", issues: z.flattenError(bodyValidation.error).fieldErrors },
                { status: 400 }
            )
        }

        const data = bodyValidation.data

        // Actualizar usuario en la base de datos
        const updatedUser = await prisma.user.update({
            where: {
                id: idValidation.data.id
            },
            data: {
                name: data.name,
                username: data.username,
                status: data.status,
                departmentId: data.departmentId,
                startDate: data.startDate ?? null
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
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const { searchParams } = new URL(request.url);

        const validation = idQuerySchema.safeParse({
            id: searchParams.get("id")
        })

        if (!validation.success){
            return NextResponse.json(
                { error: "ID de usuario invalido", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400 }
            )
        }

        await prisma.user.delete({
            where: {
                id: validation.data.id
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