import 'server-only';
import { Prisma } from '@prisma/client';

export function serializeForClient(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'bigint') return Number(obj);

    if (typeof obj === 'object') {
        try {
            if (obj instanceof Prisma.Decimal) return obj.toNumber();
        } catch { }

        if (Array.isArray(obj)) return obj.map(item => serializeForClient(item));

        const converted: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            converted[key] = serializeForClient(value);
        }
        return converted;
    }

    return obj;
}
