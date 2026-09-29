import { NextResponse } from 'next/server';
import { requireApiSession } from "@/lib/apiAuth";

const FRANKFURTER_USD_DOP_URL = 'https://api.frankfurter.dev/v2/rate/USD/DOP';
const CACHE_SECONDS = 43200;

type FrankfurterRateResponse = {
    date: string;
    base: string;
    quote: string;
    rate: number;
};

export async function GET() {
    try {
        const { response: authResponse } = await requireApiSession();
        if (authResponse) return authResponse;

        const response = await fetch(FRANKFURTER_USD_DOP_URL, {
            next: { revalidate: CACHE_SECONDS },
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: 'No se pudo obtener la tasa USD/DOP.' },
                { status: response.status }
            );
        }

        const data = await response.json() as FrankfurterRateResponse;

        if (data.base !== 'USD' || data.quote !== 'DOP' || typeof data.rate !== 'number') {
            return NextResponse.json(
                { message: 'La respuesta de Frankfurter no contiene una tasa USD/DOP valida.' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            base: data.base,
            quote: data.quote,
            rate: data.rate,
            date: data.date,
        });
    } catch (error) {
        console.error('Error al obtener tasa USD/DOP:', error);

        return NextResponse.json(
            { message: 'Error al consultar la tasa USD/DOP.' },
            { status: 503 }
        );
    }
}
