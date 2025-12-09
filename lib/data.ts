export interface PricePoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface SentimentData {
    value: number; // 0-100, where 0 is extreme fear, 100 is extreme greed
    label: string;
    sources: {
        twitter: number;
        reddit: number;
        news: number;
        instagram: number;
    };
}

// Generate some initial historical data
const generateInitialData = (count: number): PricePoint[] => {
    const data: PricePoint[] = [];
    let price = 98000;
    const now = Date.now();

    for (let i = count; i > 0; i--) {
        // 15-minute intervals going back from now (15 * 60 * 1000 = 900000ms)
        const time = now - i * 15 * 60 * 1000;
        const volatility = price * 0.002;
        const change = (Math.random() - 0.5) * volatility;

        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;

        data.push({
            time,
            open,
            high,
            low,
            close
        });

        price = close;
    }
    return data;
};

export const getInitialPriceData = () => generateInitialData(100);

export const getSentimentData = (): SentimentData => {
    // Simulate sentiment calculation
    const value = Math.floor(Math.random() * 40) + 40; // Random between 40-80

    let label = 'Neutral';
    if (value < 25) label = 'Extreme Fear';
    else if (value < 45) label = 'Fear';
    else if (value < 55) label = 'Neutral';
    else if (value < 75) label = 'Greed';
    else label = 'Extreme Greed';

    return {
        value,
        label,
        sources: {
            twitter: Math.floor(Math.random() * 1000) + 500,
            reddit: Math.floor(Math.random() * 800) + 200,
            news: Math.floor(Math.random() * 100) + 20,
            instagram: Math.floor(Math.random() * 100) + 20,
        }
    };
};
