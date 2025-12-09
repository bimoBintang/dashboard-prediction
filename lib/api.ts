// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ============ TYPE DEFINITIONS ============

// Technical Indicators
export interface TechnicalIndicator {
    date_only: string;
    sma_50: number;
    rsi_14: number;
    macd: number;
    macd_signal: number;
    bollinger_upper: number;
    bollinger_lower: number;
}

// Sentiment Data
export interface DailySentiment {
    date_only: string;
    total_posts: number;
    net_sentiment_score: number; // -1.0 to 1.0
    fear_index: number;
    greed_index: number;
    positive_percentage: number;
    negative_percentage: number;
    neutral_percentage: number;
}

export interface SocialPost {
    post_id: number;
    platform: 'Twitter' | 'Reddit';
    author: string;
    text: string;
    posted_at: string;
    sentiment_label: 'positive' | 'negative' | 'neutral';
    sentiment_score: number;
}

// Predictions
export interface PricePrediction {
    date: string;
    actual_price: number | null;
    predicted_price: number;
    lower_bound: number;
    upper_bound: number;
    error_diff?: number;
    is_future: boolean;
}

export interface ModelMetrics {
    model_name: string;
    evaluation_date: string;
    metrics: {
        mae: number;
        rmse: number;
        mape_percentage: number;
        r2_score: number;
    };
    improvement_vs_benchmark: {
        mae_reduction_percentage: number;
        status: 'SUCCESS' | 'PENDING' | 'FAILED';
    };
}

// Health Check
export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    timestamp: string;
}

// ============ API CLIENT ============

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error(`API fetch error for ${endpoint}:`, error);
            throw error;
        }
    }

    // Technical Indicators
    async getIndicators(
        symbol: string,
        startDate?: string,
        endDate?: string
    ): Promise<TechnicalIndicator[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.fetch<TechnicalIndicator[]>(`/market/indicators/${symbol}${query}`);
    }

    // Daily Sentiment
    async getDailySentiment(
        symbol: string,
        startDate?: string,
        endDate?: string
    ): Promise<DailySentiment[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.fetch<DailySentiment[]>(`/sentiment/daily/${symbol}${query}`);
    }

    // Social Posts
    async getSocialPosts(
        symbol: string,
        limit: number = 10,
        platform?: 'Twitter' | 'Reddit'
    ): Promise<SocialPost[]> {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        if (platform) params.append('platform', platform);
        return this.fetch<SocialPost[]>(`/sentiment/posts/${symbol}?${params.toString()}`);
    }

    // Predictions
    async getPredictions(
        symbol: string,
        modelName: string = 'Hybrid-LSTM',
        daysAhead: number = 7
    ): Promise<PricePrediction[]> {
        const params = new URLSearchParams();
        params.append('model_name', modelName);
        params.append('days_ahead', daysAhead.toString());
        return this.fetch<PricePrediction[]>(`/predictions/${symbol}?${params.toString()}`);
    }

    // Model Metrics
    async getModelMetrics(
        symbol: string,
        modelName: string = 'Hybrid-LSTM'
    ): Promise<ModelMetrics> {
        const params = new URLSearchParams();
        params.append('symbol', symbol);
        params.append('model_name', modelName);
        return this.fetch<ModelMetrics>(`/predictions/metrics?${params.toString()}`);
    }

    // Health Check
    async getHealth(): Promise<HealthStatus> {
        return this.fetch<HealthStatus>('/health');
    }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// ============ MOCK DATA GENERATORS ============

export function getMockIndicators(): TechnicalIndicator[] {
    const data: TechnicalIndicator[] = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        data.push({
            date_only: date.toISOString().split('T')[0],
            sma_50: 95000 + Math.random() * 5000,
            rsi_14: 30 + Math.random() * 40,
            macd: -200 + Math.random() * 400,
            macd_signal: -150 + Math.random() * 300,
            bollinger_upper: 100000 + Math.random() * 5000,
            bollinger_lower: 90000 + Math.random() * 5000,
        });
    }

    return data;
}

export function getMockDailySentiment(): DailySentiment[] {
    const data: DailySentiment[] = [];
    const now = new Date();

    for (let i = 14; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const positive = 40 + Math.random() * 30;
        const negative = 10 + Math.random() * 25;
        const neutral = 100 - positive - negative;

        data.push({
            date_only: date.toISOString().split('T')[0],
            total_posts: Math.floor(3000 + Math.random() * 5000),
            net_sentiment_score: (Math.random() - 0.3) * 1.5,
            fear_index: Math.random() * 0.5,
            greed_index: 0.5 + Math.random() * 0.5,
            positive_percentage: positive,
            negative_percentage: negative,
            neutral_percentage: neutral,
        });
    }

    return data;
}

// Counter for unique post IDs
let postIdCounter = Date.now();

export function getMockSocialPosts(limit: number = 10): SocialPost[] {
    const platforms: ('Twitter' | 'Reddit')[] = ['Twitter', 'Reddit'];
    const sampleTexts = [
        { text: 'Bitcoin looking bullish above 95k! 🚀 #BTC', sentiment: 'positive' as const },
        { text: 'BTC consolidating, expecting breakout soon', sentiment: 'neutral' as const },
        { text: 'Warning: RSI overbought, possible correction incoming', sentiment: 'negative' as const },
        { text: 'Just bought more BTC, this is the way! 💎🙌', sentiment: 'positive' as const },
        { text: 'Market looks uncertain, staying on sidelines', sentiment: 'neutral' as const },
        { text: 'Bearish divergence on 4H chart, be careful', sentiment: 'negative' as const },
        { text: 'Institutional adoption increasing! Bullish long-term', sentiment: 'positive' as const },
        { text: 'Volume decreasing, waiting for confirmation', sentiment: 'neutral' as const },
        { text: 'Support at 90k holding strong 💪', sentiment: 'positive' as const },
        { text: 'Fear & Greed index still in greed territory', sentiment: 'neutral' as const },
    ];

    const posts: SocialPost[] = [];
    const now = new Date();

    for (let i = 0; i < limit; i++) {
        const sample = sampleTexts[i % sampleTexts.length];
        const postedAt = new Date(now.getTime() - i * 15 * 60 * 1000); // 15 min intervals
        postIdCounter++; // Increment counter for unique ID

        posts.push({
            post_id: postIdCounter,
            platform: platforms[Math.floor(Math.random() * platforms.length)],
            author: `CryptoUser${Math.floor(Math.random() * 1000)}`,
            text: sample.text,
            posted_at: postedAt.toISOString(),
            sentiment_label: sample.sentiment,
            sentiment_score: sample.sentiment === 'positive' ? 0.7 + Math.random() * 0.3
                : sample.sentiment === 'negative' ? -(0.7 + Math.random() * 0.3)
                    : -0.2 + Math.random() * 0.4,
        });
    }

    return posts;
}


export function getMockPredictions(): PricePrediction[] {
    const predictions: PricePrediction[] = [];
    const now = new Date();
    let price = 97000;

    // Past predictions (with actual prices)
    for (let i = 7; i >= 1; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const actual = price + (Math.random() - 0.5) * 2000;
        const predicted = actual + (Math.random() - 0.5) * 500;

        predictions.push({
            date: date.toISOString().split('T')[0],
            actual_price: actual,
            predicted_price: predicted,
            lower_bound: predicted - 1500,
            upper_bound: predicted + 1500,
            error_diff: Math.abs(actual - predicted),
            is_future: false,
        });

        price = actual;
    }

    // Future predictions
    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        const predicted = price + (Math.random() - 0.3) * 3000;

        predictions.push({
            date: date.toISOString().split('T')[0],
            actual_price: null,
            predicted_price: predicted,
            lower_bound: predicted - 2000,
            upper_bound: predicted + 2000,
            is_future: true,
        });

        price = predicted;
    }

    return predictions;
}

export function getMockModelMetrics(): ModelMetrics {
    return {
        model_name: 'Hybrid-LSTM',
        evaluation_date: new Date().toISOString().split('T')[0],
        metrics: {
            mae: 120.50,
            rmse: 150.75,
            mape_percentage: 3.2,
            r2_score: 0.89,
        },
        improvement_vs_benchmark: {
            mae_reduction_percentage: 6.5,
            status: 'SUCCESS',
        },
    };
}

export function getMockHealth(): HealthStatus {
    return {
        status: 'healthy',
        database: 'connected',
        redis: 'connected',
        timestamp: new Date().toISOString(),
    };
}
