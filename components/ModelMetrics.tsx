'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ModelMetrics as ModelMetricsType, getMockModelMetrics } from '@/lib/api';

export default function ModelMetrics() {
    const [metrics, setMetrics] = useState<ModelMetricsType | null>(null);

    useEffect(() => {
        setMetrics(getMockModelMetrics());
    }, []);

    if (!metrics) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'PENDING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            default: return 'text-red-400 bg-red-400/10 border-red-400/30';
        }
    };

    const getR2Color = (r2: number) => {
        if (r2 >= 0.9) return 'text-green-400';
        if (r2 >= 0.7) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-white font-semibold text-lg">Model Performance</h3>
                    <p className="text-slate-400 text-sm">{metrics.model_name}</p>
                </div>
                <motion.div
                    className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(metrics.improvement_vs_benchmark.status)}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    {metrics.improvement_vs_benchmark.status}
                </motion.div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <motion.div
                    className="bg-slate-800/50 rounded-lg p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="text-slate-400 text-xs mb-1">MAE</div>
                    <div className="text-white font-mono font-bold text-lg">
                        {metrics.metrics.mae.toFixed(2)}
                    </div>
                </motion.div>

                <motion.div
                    className="bg-slate-800/50 rounded-lg p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="text-slate-400 text-xs mb-1">RMSE</div>
                    <div className="text-white font-mono font-bold text-lg">
                        {metrics.metrics.rmse.toFixed(2)}
                    </div>
                </motion.div>

                <motion.div
                    className="bg-slate-800/50 rounded-lg p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="text-slate-400 text-xs mb-1">MAPE</div>
                    <div className={`font-mono font-bold text-lg ${metrics.metrics.mape_percentage < 5 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                        {metrics.metrics.mape_percentage.toFixed(1)}%
                    </div>
                </motion.div>

                <motion.div
                    className="bg-slate-800/50 rounded-lg p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <div className="text-slate-400 text-xs mb-1">R² Score</div>
                    <div className={`font-mono font-bold text-lg ${getR2Color(metrics.metrics.r2_score)}`}>
                        {metrics.metrics.r2_score.toFixed(2)}
                    </div>
                </motion.div>
            </div>

            {/* Benchmark Comparison */}
            <motion.div
                className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-slate-400 text-sm">Improvement vs Benchmark</div>
                        <div className="text-slate-500 text-xs mt-1">Target: MAE reduction &gt; 5%</div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${metrics.improvement_vs_benchmark.mae_reduction_percentage >= 5
                                ? 'text-green-400'
                                : 'text-yellow-400'
                            }`}>
                            {metrics.improvement_vs_benchmark.mae_reduction_percentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">MAE Reduction</div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${metrics.improvement_vs_benchmark.mae_reduction_percentage >= 5
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(metrics.improvement_vs_benchmark.mae_reduction_percentage * 10, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0%</span>
                    <span className="text-green-400">5% (Target)</span>
                    <span>10%</span>
                </div>
            </motion.div>

            <div className="mt-3 text-xs text-slate-500 text-right">
                Last evaluated: {new Date(metrics.evaluation_date).toLocaleDateString()}
            </div>
        </div>
    );
}
