'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { motion } from 'framer-motion';
import { PricePrediction, getMockPredictions } from '@/lib/api';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function PredictionChart() {
    const [data, setData] = useState<PricePrediction[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setData(getMockPredictions());
    }, []);

    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'line',
            height: 300,
            background: 'transparent',
            foreColor: '#94a3b8',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        stroke: {
            width: [3, 3, 1, 1],
            curve: 'smooth',
            dashArray: [0, 5, 0, 0]
        },
        colors: ['#22c55e', '#f59e0b', '#3b82f6', '#3b82f6'],
        fill: {
            type: ['solid', 'solid', 'gradient', 'gradient'],
            opacity: [1, 1, 0.1, 0.1],
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            labels: { colors: '#94a3b8' }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: { colors: '#64748b' },
                datetimeFormatter: {
                    day: 'dd MMM'
                }
            },
            axisBorder: { show: false }
        },
        yaxis: {
            labels: {
                style: { colors: '#64748b' },
                formatter: (val) => ' ' + val.toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
        },
        grid: {
            borderColor: '#1e293b',
            strokeDashArray: 3
        },
        tooltip: {
            theme: 'dark',
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => val ? ' ' + val.toLocaleString() : 'N/A'
            }
        },
        annotations: {
            xaxis: [{
                x: new Date().getTime(),
                borderColor: '#f59e0b',
                label: {
                    text: 'Today',
                    style: {
                        color: '#fff',
                        background: '#f59e0b'
                    }
                }
            }]
        }
    }), []);

    const series = useMemo(() => {
        const actualData = data
            .filter(d => d.actual_price !== null)
            .map(d => ({ x: new Date(d.date), y: d.actual_price }));

        const predictedData = data.map(d => ({ x: new Date(d.date), y: d.predicted_price }));
        const upperBound = data.map(d => ({ x: new Date(d.date), y: d.upper_bound }));
        const lowerBound = data.map(d => ({ x: new Date(d.date), y: d.lower_bound }));

        return [
            { name: 'Actual Price', data: actualData },
            { name: 'Predicted Price', data: predictedData },
            { name: 'Upper Bound', data: upperBound },
            { name: 'Lower Bound', data: lowerBound }
        ];
    }, [data]);

    // Calculate accuracy metrics from visible data
    const metrics = useMemo(() => {
        const pastPredictions = data.filter(d => d.actual_price !== null && d.error_diff !== undefined);
        if (pastPredictions.length === 0) return null;

        const avgError = pastPredictions.reduce((sum, d) => sum + (d.error_diff || 0), 0) / pastPredictions.length;
        const avgPrice = pastPredictions.reduce((sum, d) => sum + (d.actual_price || 0), 0) / pastPredictions.length;
        const mape = (avgError / avgPrice) * 100;

        return {
            avgError,
            mape,
            accuracy: 100 - mape
        };
    }, [data]);

    const futurePredictions = data.filter(d => d.is_future);
    const latestPrediction = futurePredictions[futurePredictions.length - 1];

    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-white font-semibold text-lg">AI Price Predictions</h3>
                    <p className="text-slate-400 text-sm">Hybrid-LSTM Model</p>
                </div>
                {metrics && (
                    <motion.div
                        className="text-right"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="text-2xl font-bold text-green-400">
                            {metrics.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">Prediction Accuracy</div>
                    </motion.div>
                )}
            </div>

            {/* Chart */}
            <div className="mb-4">
                {isClient && data.length > 0 && (
                    <Chart
                        options={options}
                        series={series}
                        type="line"
                        height={280}
                        width="100%"
                    />
                )}
            </div>

            {/* Future Predictions Summary */}
            {futurePredictions.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
                    <div className="text-center">
                        <div className="text-slate-400 text-xs mb-1">Tomorrow</div>
                        <div className="text-white font-mono font-bold">
                            {futurePredictions[0]?.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-slate-400 text-xs mb-1">3 Days</div>
                        <div className="text-white font-mono font-bold">
                            {futurePredictions[2]?.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-slate-400 text-xs mb-1">7 Days</div>
                        <div className="text-white font-mono font-bold">
                            {latestPrediction?.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-slate-400 text-xs mb-1">Trend</div>
                        <div className={`font-bold ${(latestPrediction?.predicted_price || 0) > (data.find(d => !d.is_future)?.actual_price || 0)
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                            {(latestPrediction?.predicted_price || 0) > (data.find(d => !d.is_future)?.actual_price || 0) ? '↑ Bullish' : '↓ Bearish'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
