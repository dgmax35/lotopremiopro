import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useLotteryUpdate() {
    const { data, error, isLoading } = useSWR('/api/status', fetcher, {
        refreshInterval: 10000,
        dedupingInterval: 5000,
    });

    return {
        status: data?.status,
        isLoading,
        isError: error
    };
}
