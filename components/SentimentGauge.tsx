'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SentimentData, getSentimentData } from '@/lib/data';

export default function SentimentGauge() {
    const [data, setData] = useState<SentimentData | null>(null);

    useEffect(() => {
        setData(getSentimentData());
        const interval = setInterval(() => {
            setData(getSentimentData());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!data) return null;

    const getColor = (val: number) => {
        if (val < 25) return '#ef4444'; // Red
        if (val < 45) return '#f97316'; // Orange
        if (val < 55) return '#eab308'; // Yellow
        if (val < 75) return '#84cc16'; // Lime
        return '#22c55e'; // Green
    };

    const color = getColor(data.value);

    return (
        <div className="w-full h-full bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
                <h3 className="text-white font-semibold text-lg mb-2">Market Sentiment</h3>
                <p className="text-slate-400 text-sm">Real-time social media analysis</p>
            </div>

            <div className="relative flex items-center justify-center py-8">
                {/* Gauge Background */}
                <div className="w-48 h-24 overflow-hidden relative">
                    <div className="w-48 h-48 rounded-full border-[12px] border-slate-800 box-border absolute top-0 left-0"></div>
                </div>

                {/* Needle/Value Animation */}
                <motion.div
                    className="absolute bottom-8 w-48 h-24 flex items-end justify-center overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="w-48 h-48 rounded-full border-[12px] border-transparent border-t-current absolute top-0 left-0"
                        style={{
                            borderColor: `${color} transparent transparent transparent`,
                            rotate: -45 // Start offset
                        }}
                        animate={{
                            rotate: (data.value / 100) * 180 - 135
                        }}
                        transition={{ type: "spring", stiffness: 50, damping: 10 }}
                    />
                </motion.div>

                {/* Center Text */}
                <div className="absolute  flex flex-col items-center top-[60%]">
                    <motion.span
                        className="text-4xl font-bold text-white"
                        key={data.value}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {data.value}
                    </motion.span>
                    <span className="text-sm font-medium" style={{ color }}>{data.label}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs text-slate-400">
                <div className="bg-slate-800/50 rounded p-2">
                    <div className="font-bold text-white mb-1">{data.sources.twitter.toLocaleString()}</div>
                    <div>Twitter</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                    <div className="font-bold text-white mb-1">{data.sources.reddit.toLocaleString()}</div>
                    <div>Reddit</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                    <div className="font-bold text-white mb-1">{data.sources.news.toLocaleString()}</div>
                    <div>News</div>
                </div>
                <div className="bg-slate-800/50 rounded p-2">
                    <div className="font-bold text-white mb-1">{data.sources.instagram.toLocaleString()}</div>
                    <div>Instagram</div>
                </div>
            </div>
        </div>
    );
}
