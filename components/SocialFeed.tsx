'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialPost, getMockSocialPosts } from '@/lib/api';

export default function SocialFeed() {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [filter, setFilter] = useState<'all' | 'Twitter' | 'Reddit'>('all');

    useEffect(() => {
        // Initial load
        setPosts(getMockSocialPosts(15));

        // Simulate new posts coming in
        const interval = setInterval(() => {
            const newPosts = getMockSocialPosts(1);
            setPosts(prev => [newPosts[0], ...prev.slice(0, 14)]);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const filteredPosts = filter === 'all'
        ? posts
        : posts.filter(p => p.platform === filter);

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-400 bg-green-400/10';
            case 'negative': return 'text-red-400 bg-red-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    const getPlatformIcon = (platform: string) => {
        if (platform === 'Twitter') {
            return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        }
        return (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
        );
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="w-full h-full bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-800 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Social Feed</h3>
                <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                    {(['all', 'Twitter', 'Reddit'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${filter === f
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {f === 'all' ? 'All' : f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <AnimatePresence mode="popLayout">
                    {filteredPosts.map((post, index) => (
                        <motion.div
                            key={post.post_id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${post.platform === 'Twitter' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                    {getPlatformIcon(post.platform)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-medium text-sm truncate">
                                            @{post.author}
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {formatTime(post.posted_at)}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-2">
                                        {post.text}
                                    </p>
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(post.sentiment_label)}`}>
                                        {post.sentiment_label} ({(post.sentiment_score * 100).toFixed(0)}%)
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
