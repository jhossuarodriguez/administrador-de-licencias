import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { idQuerySchema } from "@/lib/validations/common";
import { savedReportCreateSchema, savedReportUpdateSchema } from "@/lib/validations/savedReports";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { requireAdminRequest, requireApiSession } from "@/lib/apiAuth";

// Obtener todos los reportes guardados
export async function GET() {
    try {
        const { response } = await requireApiSession();
        if (response) return response;

        const savedReports = await prisma.savedReport.findMany({
            orderBy: {
                lastUsed: 'desc'
            }
        });

        return NextResponse.json({
            reports: savedReports,
            total: savedReports.length,
            success: true
        });

    } catch (error) {
        console.error('Error al obtener reportes guardados:', error);
        return NextResponse.json(
            {
                error: 'Error al obtener reportes guardados',
                reports: [],
                total: 0,
                success: false
            },
            { status: 500 }
        );
    }
}

// Guardar un nuevo reporte
export async function POST(request: NextRequest) {
    try {
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const body = await request.json();

        const validation = savedReportCreateSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos invalidos", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400}
            )
        }

        const { name, description, config } = validation.data

        const savedReport = await prisma.savedReport.create({
            data: {
                name,
                description: description ?? null,
                config: config as Prisma.InputJsonValue,
                lastUsed: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Reporte guardado exitosamente',
            report: savedReport
        });

    } catch (error) {
        console.error('Error al guardar reporte:', error);
        return NextResponse.json(
            {
                error: 'Error al guardar el reporte',
                success: false
            },
            { status: 500 }
        );
    }
}

// Actualizar un reporte guardado
export async function PUT(request: NextRequest) {
    try {
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const { searchParams } = new URL(request.url);

        const idValidation = idQuerySchema.safeParse({
            id: searchParams.get("id")
        })

        if (!idValidation.success) {
            return NextResponse.json(
                { error: "ID de reporte inválido", issues:  z.flattenError(idValidation.error).fieldErrors },
                { status: 400 }
            )
        }

        const body = await request.json();

        const bodyValidation = savedReportUpdateSchema.safeParse({
            id: idValidation.data?.id,
            ...body
        })

        if (!bodyValidation.success) {
            return NextResponse.json(
                { error: "Datos invalidos", issues: z.flattenError(bodyValidation.error).fieldErrors },
                { status: 400 }
            )
        }


        const { id, name, description, config } = bodyValidation.data

        const updateData: Prisma.SavedReportUpdateInput = {
            lastUsed: new Date()
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (config !== undefined) updateData.config = config as Prisma.InputJsonValue;

        const updatedReport = await prisma.savedReport.update({
            where: {
                id
            },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: 'Reporte actualizado exitosamente',
            report: updatedReport
        });

    } catch (error) {
        console.error('Error al actualizar reporte:', error);
        return NextResponse.json(
            {
                error: 'Error al actualizar el reporte',
                success: false
            },
            { status: 500 }
        );
    }
}

// Eliminar un reporte guardado
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
                { error: "ID de reporte invalido", issues: z.flattenError(validation.error).fieldErrors },
                { status: 400 }
            )
        }

        await prisma.savedReport.delete({
            where: {
                id: validation.data.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Reporte eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar reporte:', error);
        return NextResponse.json(
            {
                error: 'Error al eliminar el reporte',
                success: false
            },
            { status: 500 }
        );
    }
}