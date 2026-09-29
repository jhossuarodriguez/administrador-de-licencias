import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z }  from "zod";
import {  departmentCreateSchema, departmentUpdateSchema, departmentQuerySchema } from "@/lib/validations/departments";
import { idQuerySchema } from "@/lib/validations/common";
import { requireAdminRequest, requireApiSession } from "@/lib/apiAuth";

// GET - Listar todos los departamentos
export async function GET(request: NextRequest) {
    try {
        const { response } = await requireApiSession();
        if (response) return response;

        const { searchParams } = new URL(request.url);

        const validation = departmentQuerySchema.safeParse({
            active: searchParams.get("active") ?? undefined,
        })

        if (!validation.success) {
            return NextResponse.json(
                { error: "Parámetros inválidos", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400 }
            )
        }

        const activeOnly = validation.data?.active === "true"

        const where = activeOnly ? { active: true } : {}

        const departments = await prisma.department.findMany({
            where,
            include: {
                _count: {
                    select: {
                        users: true,
                        licenses: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(departments);
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        return NextResponse.json(
            { error: 'Error al obtener departamentos' },
            { status: 500 }
        );
    }
}

// POST - Crear nuevo departamento
export async function POST(request: NextRequest) {
    try {
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const body = await request.json();

        const validation =  departmentCreateSchema.safeParse(body)

        if  (!validation.success) {
            return NextResponse.json(
                { error: "El nombre del departamento es requerido", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400 }
            )
        }

        const data = validation.data

        // Verificar si ya existe un departamento con ese nombre
        const existingDept = await prisma.department.findUnique({
            where: { name: data.name }
        });

        if (existingDept) {
            return NextResponse.json(
                { error: 'Ya existe un departamento con ese nombre' },
                { status: 409 }
            );
        }

        const department = await prisma.department.create({
            data: {
                name: data.name,
                description: data.description ?? null,
                active: true
            }
        });

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        console.error('Error al crear departamento:', error);
        return NextResponse.json(
            { error: 'Error al crear departamento' },
            { status: 500 }
        );
    }
}

// PATCH - Actualizar departamento
export async function PATCH(request: NextRequest) {
    try {
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const body = await request.json();

        const validation = departmentUpdateSchema.safeParse(body)

        if (!validation.success){
            return NextResponse.json(
                { error: "ID del departamento es requerido ", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400 }
            )
        }

        const { id, name, description, active } = validation.data
        

        // Verificar si existe
        const existingDept = await prisma.department.findUnique({
            where: { id }
        });

        if (!existingDept) {
            return NextResponse.json(
                { error: 'Departamento no encontrado' },
                { status: 404 }
            );
        }

        // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
        if (name && name.trim() !== existingDept.name) {
            const duplicateDept = await prisma.department.findUnique({
                where: { name: name.trim() }
            });

            if (duplicateDept) {
                return NextResponse.json(
                    { error: 'Ya existe un departamento con ese nombre' },
                    { status: 409 }
                );
            }
        }

        const updateData: {
            name?: string;
            description?: string | null;
            active?: boolean;
            updatedAt: Date;
        } = {
            updatedAt: new Date()
        };

        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (active !== undefined) updateData.active = active;

        const department = await prisma.department.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        users: true,
                        licenses: true
                    }
                }
            }
        });

        return NextResponse.json(department);
    } catch (error) {
        console.error('Error al actualizar departamento:', error);
        return NextResponse.json(
            { error: 'Error al actualizar departamento' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar departamento
export async function DELETE(request: NextRequest) {
    try {
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const { searchParams } = new URL(request.url);

        const validation = idQuerySchema.safeParse({
            id: searchParams.get("id")
        })

        if (!validation.success) {
            return NextResponse.json(
                { error: "ID del departamento requerido", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400}   
            )
        }

        const departmentId = validation.data.id

        // Verificar si existe
        const existingDept = await prisma.department.findUnique({
            where: { id: departmentId },
            include: {
                _count: {
                    select: {
                        users: true,
                        licenses: true
                    }
                }
            }
        });

        if (!existingDept) {
            return NextResponse.json(
                { error: 'Departamento no encontrado' },
                { status: 404 }
            );
        }

        // Verificar si tiene usuarios o licencias asociadas
        if (existingDept._count.users > 0 || existingDept._count.licenses > 0) {
            return NextResponse.json(
                {
                    error: `No se puede eliminar el departamento porque tiene ${existingDept._count.users} usuario(s) y ${existingDept._count.licenses} licencia(s) asociadas. Desactívalo en su lugar.`
                },
                { status: 409 }
            );
        }

        await prisma.department.delete({
            where: { id: departmentId }
        });

        return NextResponse.json({
            message: 'Departamento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar departamento:', error);
        return NextResponse.json(
            { error: 'Error al eliminar departamento' },
            { status: 500 }
        );
    }
}
