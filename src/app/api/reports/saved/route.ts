import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

// Obtener todos los reportes guardados
export async function GET() {
    try {
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
        const body = await request.json();
        const { name, description, config } = body;

        if (!name || !config) {
            return NextResponse.json(
                { error: 'Nombre y configuración del reporte son requeridos' },
                { status: 400 }
            );
        }

        const savedReport = await prisma.savedReport.create({
            data: {
                name,
                description: description || '',
                config,
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
        const { searchParams } = new URL(request.url);
        const reportId = searchParams.get('id');

        if (!reportId) {
            return NextResponse.json(
                { error: 'ID del reporte es requerido' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { name, description, config } = body;

        if (!name || !config) {
            return NextResponse.json(
                { error: 'Nombre y configuración del reporte son requeridos' },
                { status: 400 }
            );
        }

        const updatedReport = await prisma.savedReport.update({
            where: {
                id: parseInt(reportId)
            },
            data: {
                name,
                description: description || '',
                config,
                lastUsed: new Date()
            }
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
        const { searchParams } = new URL(request.url);
        const reportId = searchParams.get('id');

        if (!reportId) {
            return NextResponse.json(
                { error: 'ID del reporte es requerido' },
                { status: 400 }
            );
        }

        await prisma.savedReport.delete({
            where: {
                id: parseInt(reportId)
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