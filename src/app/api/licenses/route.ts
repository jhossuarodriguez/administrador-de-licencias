import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
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
        const body = await request.json()
        console.log('Datos recibidos en API:', body);

        const { sede, provider, startDate, expiration, assigned, departmentId, model, plan, unitCost, installmentCost, totalLicense, billingCycle, active, penaltyCost, usedLicense } = body

        const newLicense = await prisma.license.create({
            data: {
                sede: sede || null,
                provider: provider,
                startDate: startDate ? new Date(startDate) : null,
                expiration: expiration ? new Date(expiration) : null,
                assigned: assigned || null,
                departmentId: departmentId || null,
                model: model || null,
                plan: plan || null,
                unitCost: parseFloat(unitCost) || 0,
                installmentCost: parseFloat(installmentCost) || 0,
                penaltyCost: parseFloat(penaltyCost) || 0,  // Era string vacío, debe ser número
                billingCycle: billingCycle || 'MONTHLY',
                totalLicense: parseInt(totalLicense) || 0,
                usedLicense: parseInt(usedLicense) || 0,
                active: active ?? true,
                updatedAt: new Date(), // Agregar este campo requerido
            }
        })


        return NextResponse.json({
            success: true,
            message: 'Licencia guardada exitosamente',
            report: newLicense
        });
    }
    catch (err: any) {
        console.error("Error al crear la licencia:", err)

        if (err.code === 'P2002') {
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
        const { searchParams } = new URL(request.url)
        const licenseId = searchParams.get('id')
        const data = await request.json()

        if (!licenseId) {
            return NextResponse.json(
                { erorr: 'ID de licencia es requerido' },
                { status: 400 }
            )
        }

        const updateLicense = await prisma.license.update({
            where: {
                id: parseInt(licenseId)
            },
            data: {
                sede: data.sede,
                provider: data.provider,
                model: data.model,
                billingCycle: data.billingCycle,
                startDate: data.startDate ? new Date(data.startDate) : null,
                expiration: data.expiration ? new Date(data.expiration) : null,
                assigned: data.assigned,
                departmentId: data.departmentId,
                unitCost: parseFloat(data.unitCost) || 0,
                totalLicense: parseInt(data.totalLicense) || 0,
                plan: data.plan,
                installmentCost: parseFloat(data.installmentCost) || 0,
                active: data.active,
                updatedAt: new Date(),
            }
        })

        return NextResponse.json({
            sucess: true,
            message: 'Licencia actualizada correctamente',
            license: updateLicense
        })

    } catch (err) {
        console.log('Error al actualizar la licencia', err)
        return NextResponse.json({
            Error: 'Error al actualizar la licencia',
            sucess: false
        },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const licenseId = searchParams.get('id');


        if (!licenseId) {
            return NextResponse.json(
                { error: 'ID del usuario es requerido' },
                { status: 400 }
            );
        }

        await prisma.license.delete({
            where: {
                id: parseInt(licenseId)
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