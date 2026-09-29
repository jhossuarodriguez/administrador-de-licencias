import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest, requireApiSession } from '@/lib/apiAuth';
import { getSedes } from '@/lib/data/sede';
import { prisma } from '@/lib/prisma';
import { idQuerySchema } from '@/lib/validations/common';
import {
    sedeCreateSchema,
    sedeQuerySchema,
    sedeUpdateSchema,
} from '@/lib/validations/sede';

const isUniqueConstraintError = (error: unknown) =>
    typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';

export async function GET(request: NextRequest) {
    const { response } = await requireApiSession();
    if (response) return response;

    const validation = sedeQuerySchema.safeParse({
        active: request.nextUrl.searchParams.get('active') ?? undefined,
    });

    if (!validation.success) {
        return NextResponse.json(
            { error: 'Parametros invalidos', issues: z.flattenError(validation.error).fieldErrors },
            { status: 400 },
        );
    }

    try {
        const sedes = await getSedes(validation.data.active === 'true');
        return NextResponse.json(sedes);
    } catch (error) {
        console.error('Error al obtener sedes:', error);
        return NextResponse.json({ error: 'Error al obtener sedes' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { response } = await requireAdminRequest(request);
    if (response) return response;

    const validation = sedeCreateSchema.safeParse(await request.json());
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Datos de la sede invalidos', issues: z.flattenError(validation.error).fieldErrors },
            { status: 400 },
        );
    }

    try {
        const sede = await prisma.sede.create({
            data: {
                name: validation.data.name,
                description: validation.data.description ?? null,
            },
        });

        return NextResponse.json(
            { ...sede, _count: { licenses: 0 } },
            { status: 201 },
        );
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            return NextResponse.json(
                { error: 'Ya existe una sede con ese nombre' },
                { status: 409 },
            );
        }

        console.error('Error al crear sede:', error);
        return NextResponse.json({ error: 'Error al crear sede' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const { response } = await requireAdminRequest(request);
    if (response) return response;

    const validation = sedeUpdateSchema.safeParse(await request.json());
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Datos de la sede invalidos', issues: z.flattenError(validation.error).fieldErrors },
            { status: 400 },
        );
    }

    const { id, name, description, active } = validation.data;

    try {
        const existingSede = await prisma.sede.findUnique({ where: { id } });
        if (!existingSede) {
            return NextResponse.json({ error: 'Sede no encontrada' }, { status: 404 });
        }

        const sede = await prisma.$transaction(async (tx) => {
            const updatedSede = await tx.sede.update({
                where: { id },
                data: {
                    ...(name !== undefined ? { name } : {}),
                    ...(description !== undefined ? { description } : {}),
                    ...(active !== undefined ? { active } : {}),
                },
            });

            if (name !== undefined && name !== existingSede.name) {
                await tx.license.updateMany({
                    where: { sede: existingSede.name },
                    data: { sede: name },
                });
            }

            const licenses = await tx.license.count({
                where: { sede: updatedSede.name },
            });

            return { ...updatedSede, _count: { licenses } };
        });

        return NextResponse.json(sede);
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            return NextResponse.json(
                { error: 'Ya existe una sede con ese nombre' },
                { status: 409 },
            );
        }

        console.error('Error al actualizar sede:', error);
        return NextResponse.json({ error: 'Error al actualizar sede' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { response } = await requireAdminRequest(request);
    if (response) return response;

    const validation = idQuerySchema.safeParse({
        id: request.nextUrl.searchParams.get('id'),
    });
    if (!validation.success) {
        return NextResponse.json({ error: 'ID de sede invalido' }, { status: 400 });
    }

    try {
        const sede = await prisma.sede.findUnique({ where: { id: validation.data.id } });
        if (!sede) {
            return NextResponse.json({ error: 'Sede no encontrada' }, { status: 404 });
        }

        const licenses = await prisma.license.count({ where: { sede: sede.name } });
        if (licenses > 0) {
            return NextResponse.json(
                { error: `No se puede eliminar la sede porque tiene ${licenses} licencia(s) asociada(s)` },
                { status: 409 },
            );
        }

        await prisma.sede.delete({ where: { id: sede.id } });
        return NextResponse.json({ message: 'Sede eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar sede:', error);
        return NextResponse.json({ error: 'Error al eliminar sede' }, { status: 500 });
    }
}
