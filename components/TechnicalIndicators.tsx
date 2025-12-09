'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { motion } from 'framer-motion';
import { TechnicalIndicator, getMockIndicators } from '@/lib/api';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function TechnicalIndicators() {
    const [data, setData] = useState<TechnicalIndicator[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Use mock data for now, can be replaced with API call
        setData(getMockIndicators());
    }, []);

    const latestData = data[data.length - 1];

    const getRSIColor = (rsi: number) => {
        if (rsi < 30) return '#ef4444'; // Oversold - Red
        if (rsi > 70) return '#22c55e'; // Overbought - Green
        return '#eab308'; // Neutral - Yellow
    };

    const getRSILabel = (rsi: number) => {
        if (rsi < 30) return 'Oversold';
        if (rsi > 70) return 'Overbought';
        return 'Neutral';
    };

    const macdOptions: ApexOptions = useMemo(() => ({
        chart: {
            type: 'bar',
            height: 150,
            background: 'transparent',
            foreColor: '#94a3b8',
            toolbar: { show: false },
            sparkline: { enabled: false }
        },
        plotOptions: {
            bar: {
                colors: {
                    ranges: [{
                        from: -1000,
                        to: 0,
                        color: '#ef4444'
                    }, {
                        from: 0,
                        to: 1000,
                        color: '#22c55e'
                    }]
                }
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            type: 'datetime',
            labels: { show: false },
            axisBorder: { show: false }
        },
        yaxis: {
            labels: {
                formatter: (val) => val.toFixed(0)
            }
        },
        grid: {
            borderColor: '#1e293b',
            strokeDashArray: 2
        },
        tooltip: {
            theme: 'dark',
            x: { format: 'dd MMM' }
        }
    }), []);

    const macdSeries = useMemo(() => [{
        name: 'MACD Histogram',
        data: data.map(d => ({
            x: new Date(d.date_only),
            y: d.macd - d.macd_signal
        }))
    }], [data]);

    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-800 shadow-xl">
            <h3 className="text-white font-semibold text-lg mb-4">Technical Indicators</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* RSI Gauge */}
                <motion.div
                    className="bg-slate-800/50 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="text-slate-400 text-sm mb-2">RSI (14)</div>
                    {latestData && (
                        <>
                            <div
                                className="text-3xl font-bold mb-1"
                                style={{ color: getRSIColor(latestData.rsi_14) }}
                            >
                                {latestData.rsi_14.toFixed(1)}
                            </div>
                            <div
                                className="text-xs font-medium"
                                style={{ color: getRSIColor(latestData.rsi_14) }}
                            >
                                {getRSILabel(latestData.rsi_14)}
                            </div>
                            {/* RSI Bar */}
                            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: getRSIColor(latestData.rsi_14) }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${latestData.rsi_14}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>0</span>
                                <span>30</span>
                                <span>70</span>
                                <span>100</span>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* SMA 50 */}
                <motion.div
                    className="bg-slate-800/50 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-slate-400 text-sm mb-2">SMA (50)</div>
                    {latestData && (
                        <>
                            <div className="text-3xl font-bold text-blue-400 mb-1">
                                {latestData.sma_50.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-xs text-slate-500">Moving Average</div>
                        </>
                    )}
                </motion.div>

                {/* Bollinger Bands */}
                <motion.div
                    className="bg-slate-800/50 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="text-slate-400 text-sm mb-2">Bollinger Bands</div>
                    {latestData && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Upper:</span>
                                <span className="text-green-400 font-mono">
                                    {latestData.bollinger_upper.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Lower:</span>
                                <span className="text-red-400 font-mono">
                                    {latestData.bollinger_lower.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm pt-1 border-t border-slate-700">
                                <span className="text-slate-500">Width:</span>
                                <span className="text-white font-mono">
                                    {(latestData.bollinger_upper - latestData.bollinger_lower).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* MACD Chart */}
            <div className="mt-4">
                <div className="text-slate-400 text-sm mb-2">MACD Histogram</div>
                {isClient && data.length > 0 && (
                    <Chart
                        options={macdOptions}
                        series={macdSeries}
                        type="bar"
                        height={120}
                        width="100%"
                    />
                )}
            </div>
        </div>
    );
}
