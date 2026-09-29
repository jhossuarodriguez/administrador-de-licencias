import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { z } from "zod"
import { licenseCreateSchema, licenseUpdateSchema } from "@/lib/validations/license";
import { idQuerySchema } from "@/lib/validations/common";
import { requireAdminRequest, requireApiSession } from "@/lib/apiAuth";

export async function GET() {
    try {
        const { response } = await requireApiSession();
        if (response) return response;

        const licenses = await prisma.license.findMany({
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(licenses)
    } catch (err) {
        console.error("Error al obtener las licencias:", err)
        return NextResponse.json(
            { error: "Error al obtener las licencias" },
            { status: 500 }
        )
    }

}

export async function POST(request: Request) {
    try {
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const body = await request.json()
        const validation = licenseCreateSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                {error: "Datos invalidos", issues: z.flattenError(validation.error).fieldErrors},
                {status: 400}
            )
        }

        const data = validation.data



        const newLicense = await prisma.license.create({
            data: {
                sede: data.sede,
                provider: data.provider,
                startDate: data.startDate ?? null,
                expiration: data.expiration ?? null,
                assigned: data.assigned ?? null,
                departmentId: data.departmentId ?? null,
                model: data.model ?? null,
                plan: data.plan ?? null,
                unitCost: data.unitCost,
                installmentCost: data.installmentCost,
                penaltyCost: data.penaltyCost,  // Era string vacío, debe ser número
                currency: data.currency,
                billingCycle: data.billingCycle,
                totalLicense: data.totalLicense,
                usedLicense: data.usedLicense,
                active: data.active,
                updatedAt: new Date(), // Agregar este campo requerido
            }
        })


        return NextResponse.json({
            success: true,
            message: 'Licencia guardada exitosamente',
            report: newLicense
        });
    }
    catch (err) {
        console.error("Error al crear la licencia:", err)

        if (err === 'P2002') {
            return NextResponse.json(
                { error: 'La licencia ya existe ' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { err: "Error al crear la licencia" },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { response } = await requireAdminRequest(request)
        if (response) return response

        const { searchParams } = new URL(request.url)

        const idValidation = idQuerySchema.safeParse({
            id: searchParams.get("id")
        })

        if (!idValidation.success){
            return NextResponse.json(
                { error: "ID licencia invalido", issues: z.flattenError(idValidation.error).fieldErrors},
                { status: 400 }
            )
        }

        const bodyValidation = licenseUpdateSchema.safeParse(await request.json())
                

        if (!bodyValidation.success) {
            return NextResponse.json(
                { error: 'Datos invalidos', issues: z.flattenError(bodyValidation.error).fieldErrors },
                { status: 400 }
            )
        }

        const data = bodyValidation.data

        const updateLicense = await prisma.license.update({
            where: {
                id: idValidation.data.id
            },
            data: {
                sede: data.sede,
                provider: data.provider,
                model: data.model,
                currency: data.currency,
                billingCycle: data.billingCycle,
                startDate: data.startDate ?? null,
                expiration: data.expiration ?? null,
                assigned: data.assigned,
                departmentId: data.departmentId ?? null,
                unitCost: data.unitCost,
                totalLicense: data.totalLicense,
                plan: data.plan,
                installmentCost: data.installmentCost,
                active: data.active,
                updatedAt: new Date(),
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Licencia actualizada correctamente',
            license: updateLicense,
        })

    } catch (err) {
        console.log('Error al actualizar la licencia', err)
        return NextResponse.json({
            Error: 'Error al actualizar la licencia',
            success: false
        },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { response } = await requireAdminRequest(request);
        if (response) return response;

        const { searchParams } = new URL(request.url);

        const validation =  idQuerySchema.safeParse({
            id: searchParams.get("id")
        })

        if (!validation.success){
            return NextResponse.json(
                {error: "ID de licencia invalido", issues: z.flattenError(validation.error).fieldErrors},
                {status: 400}
            )
        }

        await prisma.license.delete({
            where: {
                id: validation.data.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Licencia eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar licencia:', error);
        return NextResponse.json(
            {
                error: 'Error al eliminar licencia',
                success: false
            },
            { status: 500 }
        );

    }
} 