'use client';

import { motion } from 'framer-motion';
import PriceChart from './PriceChart';
import SentimentGauge from './SentimentGauge';
import TechnicalIndicators from './TechnicalIndicators';
import SocialFeed from './SocialFeed';
import PredictionChart from './PredictionChart';
import ModelMetrics from './ModelMetrics';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
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
            className="min-h-screen bg-slate-950 text-white p-4 md:p-6 lg:p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <header className="mb-6">
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                        BTC Market Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Real-time price tracking, AI predictions & social sentiment analysis
                    </p>
                </motion.div>
            </header>

            {/* Main Grid Layout */}
            <div className="space-y-6">
                {/* Row 1: Price Chart + Sentiment */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div className="lg:col-span-2 h-[480px]" variants={itemVariants}>
                        <PriceChart />
                    </motion.div>
                    <motion.div className="h-[480px]" variants={itemVariants}>
                        <SentimentGauge />
                    </motion.div>
                </div>

                {/* Row 2: Technical Indicators */}
                <motion.div variants={itemVariants}>
                    <TechnicalIndicators />
                </motion.div>

                {/* Row 3: Predictions + Model Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div className="lg:col-span-2" variants={itemVariants}>
                        <PredictionChart />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <ModelMetrics />
                    </motion.div>
                </div>

                {/* Row 4: Social Feed */}
                <motion.div className="h-[400px]" variants={itemVariants}>
                    <SocialFeed />
                </motion.div>
            </div>

            {/* Footer */}
            <motion.footer
                className="mt-8 pt-6 border-t border-slate-800 text-center text-slate-500 text-sm"
                variants={itemVariants}
            >
                <p>Powered by WireRoot • Data refreshes every 15 seconds</p>
            </motion.footer>
        </motion.div>
    );
}
