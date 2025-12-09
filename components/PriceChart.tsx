'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { PricePoint, getInitialPriceData } from '@/lib/data';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function PriceChart() {
    const [data, setData] = useState<PricePoint[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setData(getInitialPriceData());
    }, []);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setData(prev => {
                if (prev.length === 0) return prev;
                const last = prev[prev.length - 1];
                // Use real current time for new candles
                const newTime = Date.now();
                const volatility = last.close * 0.002;
                const change = (Math.random() - 0.5) * volatility;
                const price = last.close + change;

                const newPoint = {
                    time: newTime,
                    open: last.close,
                    close: price,
                    high: Math.max(last.close, price) + Math.random() * volatility * 0.2,
                    low: Math.min(last.close, price) - Math.random() * volatility * 0.2,
                };

                return [...prev.slice(1), newPoint];
            });
        }, 15000); // Update every 15 seconds

        return () => clearInterval(interval);
    }, [isPaused]);

    const handleZoom = useCallback(() => {
        setIsPaused(true);
    }, []);

    const handleReset = useCallback(() => {
        setIsPaused(false);
    }, []);

    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'candlestick',
            id: 'btc-chart',
            height: 380,
            background: 'transparent',
            foreColor: '#94a3b8',
            redrawOnParentResize: true,
            redrawOnWindowResize: true,
            toolbar: {
                show: true,
                autoSelected: 'pan',
                tools: {
                    download: false,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                }
            },
            animations: {
                enabled: !isPaused,
                dynamicAnimation: {
                    enabled: !isPaused,
                    speed: 800
                }
            },
            zoom: {
                enabled: true,
                type: 'x',
                autoScaleYaxis: true
            },
            events: {
                zoomed: handleZoom,
                scrolled: handleZoom,
                beforeResetZoom: () => {
                    handleReset();
                    return undefined;
                }
            }
        },
        theme: {
            mode: 'dark',
        },
        title: {
            text: 'BTC Real-time',
            align: 'left',
            style: {
                color: '#fff',
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: 'inherit'
            }
        },
        xaxis: {
            type: 'datetime',
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#64748b'
                },
                datetimeFormatter: {
                    year: 'yyyy',
                    month: "MMM 'yy",
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            },
            tooltip: {
                enabled: true
            }
        },
        yaxis: {
            tooltip: { enabled: true },
            forceNiceScale: true,
            labels: {
                style: {
                    colors: '#64748b'
                },
                formatter: (val) => ' ' + val.toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
        },
        grid: {
            borderColor: '#1e293b',
            strokeDashArray: 3,
            xaxis: {
                lines: { show: false }
            },
            yaxis: {
                lines: { show: true }
            }
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#22c55e',
                    downward: '#ef4444'
                },
                wick: {
                    useFillColor: true
                }
            }
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            x: {
                format: 'dd MMM HH:mm'
            },
            y: {
                formatter: (val) => ' ' + val.toLocaleString()
            }
        }
    }), [isPaused, handleZoom, handleReset]);

    const series = useMemo(() => [{
        name: 'BTC',
        data: data.map(d => ({
            x: new Date(d.time),
            y: [d.open, d.high, d.low, d.close]
        }))
    }], [data]);

    return (
        <div className="w-full h-full bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-800 shadow-xl flex flex-col">
            <div className="flex-1 min-h-[350px]">
                {isClient && data.length > 0 && (
                    <Chart
                        options={options}
                        series={series}
                        type="candlestick"
                        height={380}
                        width="100%"
                    />
                )}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800 text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></span>
                        <span className="text-slate-400">{isPaused ? 'Paused (zoom active)' : 'Live'}</span>
                    </div>
                    {isPaused && (
                        <button
                            onClick={handleReset}
                            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors"
                        >
                            Resume Live
                        </button>
                    )}
                </div>
                {data.length > 0 && (
                    <div className="text-right">
                        <span className="text-slate-400 mr-2">Current:</span>
                        <span className="text-white font-mono font-bold text-lg">
                            {data[data.length - 1]?.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
