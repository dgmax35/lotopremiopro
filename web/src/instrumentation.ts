
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { lotteryWatcher } = await import('@/lib/services/LotteryWatcher');
        lotteryWatcher.start();
    }
}
