'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PriceChart from './PriceChart';
import SentimentGauge from './SentimentGauge';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100
        }
    }
};

export default function Dashboard() {
    return (
        <motion.div
            className="min-h-screen bg-slate-950 text-white p-4 md:p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="mb-8">
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        BTC Market Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2">Real-time price tracking & social sentiment analysis</p>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Price Chart - Takes up 2 columns on large screens */}
                <motion.div
                    className="lg:col-span-2 h-[400px] lg:h-[500px]"
                    variants={itemVariants}
                >
                    <PriceChart />
                </motion.div>

                {/* Sidebar / Secondary Stats */}
                <div className="flex flex-col gap-6">
                    <motion.div className="flex-1" variants={itemVariants}>
                        <SentimentGauge />
                    </motion.div>

                    {/* Additional Info / Stats */}
                    <motion.div
                        className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800 shadow-xl"
                        variants={itemVariants}
                    >
                        <h3 className="text-white font-semibold mb-4">Market Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                <span className="text-slate-400">24h Volatility</span>
                                <span className="text-emerald-400 font-mono">Low</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                <span className="text-slate-400">Dominance</span>
                                <span className="text-white font-mono">54.2%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Next Halving</span>
                                <span className="text-white font-mono">1,240 blocks</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
