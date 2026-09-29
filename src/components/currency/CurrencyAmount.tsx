'use client';

import { useUsdDopRate } from '@/hooks/useExchangeRate';
import { cn, dopToUsd, formatDopCurrency, formatUsdCurrency, usdToDop } from '@/lib/utils';

type CurrencyAmountProps = {
    amount: number | null | undefined;
    /** Moneda en la que está expresado `amount`. Define cuál se muestra primero. */
    currency?: 'USD' | 'DOP';
    className?: string;
    primaryClassName?: string;
    secondaryClassName?: string;
    layout?: 'inline' | 'stacked';
};

const CURRENCY_META = {
    USD: { flag: '/usa-flag.svg', ariaLabel: 'Estados Unidos', format: formatUsdCurrency },
    DOP: { flag: '/rd-flag.svg', ariaLabel: 'Republica Dominicana', format: formatDopCurrency },
} as const;

function CurrencyLine({
    code,
    label,
    className,
}: {
    code: 'USD' | 'DOP';
    label: string;
    className?: string;
}) {
    const meta = CURRENCY_META[code];
    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            <span role="img" aria-label={meta.ariaLabel} title={code} className="text-xs leading-none inline-flex">
                <img src={meta.flag} alt={code} className="size-6 object-contain mr-2" />
            </span>
            {label}
        </span>
    );
}

export function CurrencyAmount({
    amount,
    currency = 'USD',
    className,
    primaryClassName,
    secondaryClassName,
    layout = 'inline',
}: CurrencyAmountProps) {
    const { rate, date, isLoading } = useUsdDopRate();
    const primaryAmount = Number(amount ?? 0);
    const secondaryCurrency = currency === 'DOP' ? 'USD' : 'DOP';
    const secondaryAmount = rate
        ? currency === 'DOP'
            ? dopToUsd(primaryAmount, rate)
            : usdToDop(primaryAmount, rate)
        : null;
    const secondaryLabel = isLoading
        ? `${secondaryCurrency} cargando...`
        : secondaryAmount === null
            ? `${secondaryCurrency} no disponible`
            : CURRENCY_META[secondaryCurrency].format(secondaryAmount);

    return (
        <span
            className={cn(
                layout === 'stacked'
                    ? 'inline-flex flex-col gap-0.5'
                    : 'inline-flex flex-wrap items-center gap-x-2 gap-y-1',
                className
            )}
            title={rate ? `Tasa USD/DOP ${rate} (${date})` : undefined}
        >
            <CurrencyLine
                code={currency}
                label={CURRENCY_META[currency].format(primaryAmount)}
                className={primaryClassName}
            />
            <CurrencyLine
                code={secondaryCurrency}
                label={secondaryLabel}
                className={cn('text-xs text-muted-foreground', secondaryClassName)}
            />
        </span>
    );
}
