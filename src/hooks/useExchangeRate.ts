import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export type ExchangeRateResponse = {
    base: 'USD';
    quote: 'DOP';
    rate: number;
    date: string;
};

export function useUsdDopRate() {
    const { data, error, isLoading } = useSWR<ExchangeRateResponse>(
        '/api/exchange-rates/usd-dop',
        fetcher,
        {
            dedupingInterval: 60 * 60 * 1000,
            revalidateOnFocus: false,
        }
    );

    return {
        rate: data?.rate ?? null,
        date: data?.date ?? null,
        isLoading,
        error,
    };
}
