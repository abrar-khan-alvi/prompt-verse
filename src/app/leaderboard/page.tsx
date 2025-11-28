'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, DollarSign, Users } from 'lucide-react';
import { formatAddress } from '@/utils/formatting';
import { env } from '@/lib/env';
import AIPromptNFTAbiFile from '@/lib/abis/AIPromptNFT.json';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const BESU_RPC_URL = 'http://localhost:8545';

interface CreatorStat {
    address: string;
    volume: number;
    sales: number;
}

interface TrendingPrompt {
    id: string;
    title: string; // We might not get title easily without fetching tokenURI, so maybe just ID or fetch if possible
    price: string;
    views: number; // We don't have views on-chain, so we'll use "Recent Activity" count or similar
}

export default function LeaderboardPage() {
    const [loading, setLoading] = useState(true);
    const [topCreators, setTopCreators] = useState<CreatorStat[]>([]);
    const [trendingPrompts, setTrendingPrompts] = useState<TrendingPrompt[]>([]);
    const [stats, setStats] = useState({
        topVolume: '0',
        mostSales: '0',
        activeCreators: 0
    });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                let provider;
                if (typeof window.ethereum !== 'undefined') {
                    provider = new ethers.BrowserProvider(window.ethereum);
                } else {
                    provider = new ethers.JsonRpcProvider(BESU_RPC_URL);
                }

                if (!CONTRACT_ADDRESS) return;
                const contract = new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, provider);

                // Fetch past events: PromptSold
                // Note: In a production app with many events, this should be done via an indexer (The Graph)
                // We will fetch from block 0 (or a recent block) to latest
                // For performance on testnet, we might limit the block range if needed, but for now we try all.

                // Filter for PromptSold events
                const soldFilter = contract.filters.PromptSold();
                const soldEvents = await contract.queryFilter(soldFilter);

                // Process events to calculate stats
                const creatorStats: Record<string, { volume: number; sales: number }> = {};

                soldEvents.forEach((event: any) => {
                    // args: [tokenId, seller, buyer, price]
                    const seller = event.args[1];
                    const price = parseFloat(ethers.formatEther(event.args[3]));

                    if (!creatorStats[seller]) {
                        creatorStats[seller] = { volume: 0, sales: 0 };
                    }
                    creatorStats[seller].volume += price;
                    creatorStats[seller].sales += 1;
                });

                // Convert to array and sort
                const sortedCreators = Object.entries(creatorStats)
                    .map(([address, data]) => ({
                        address,
                        volume: data.volume,
                        sales: data.sales
                    }))
                    .sort((a, b) => b.volume - a.volume) // Sort by volume descending
                    .slice(0, 10); // Top 10

                setTopCreators(sortedCreators);

                // Calculate aggregate stats
                const maxVolume = sortedCreators.length > 0 ? sortedCreators[0].volume : 0;
                const maxSales = sortedCreators.length > 0 ? Math.max(...sortedCreators.map(c => c.sales)) : 0;
                const totalCreators = Object.keys(creatorStats).length;

                setStats({
                    topVolume: maxVolume.toFixed(4),
                    mostSales: maxSales.toString(),
                    activeCreators: totalCreators
                });

                // For "Trending", since we don't have views, let's show "Recent Sales" as trending
                // We'll take the last 5 sold events
                const recentSales = soldEvents.slice(-5).reverse();

                // We need to fetch prompt details for these
                const trendingData = await Promise.all(recentSales.map(async (event: any) => {
                    const tokenId = event.args[0];
                    const price = ethers.formatEther(event.args[3]);
                    // Try to get title
                    let title = `Prompt #${tokenId}`;
                    try {
                        const promptData = await contract.getPromptData(tokenId);
                        if (promptData.title) title = promptData.title;
                    } catch (e) { }

                    return {
                        id: tokenId.toString(),
                        title,
                        price,
                        views: 1 // Placeholder
                    };
                }));

                setTrendingPrompts(trendingData);

            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-12 text-center">
                <h1 className="gradient-text mb-4 text-4xl font-bold">Leaderboards</h1>
                <p className="text-lg text-muted-foreground">
                    Discover top creators and trending prompts in the PromptVerse.
                </p>
            </div>

            <Tabs defaultValue="creators" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="creators">Top Creators</TabsTrigger>
                    <TabsTrigger value="trending">Recent Sales</TabsTrigger>
                </TabsList>

                <TabsContent value="creators" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Top Volume Card */}
                        <Card className="glass border-primary/20 bg-primary/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Top Volume</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.topVolume} ETH</div>
                                <p className="text-xs text-muted-foreground">
                                    Highest trading volume
                                </p>
                            </CardContent>
                        </Card>

                        {/* Most Sales Card */}
                        <Card className="glass border-purple-500/20 bg-purple-500/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Most Sales</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.mostSales} Sales</div>
                                <p className="text-xs text-muted-foreground">
                                    Most active creator
                                </p>
                            </CardContent>
                        </Card>

                        {/* Active Users */}
                        <Card className="glass border-blue-500/20 bg-blue-500/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.activeCreators}</div>
                                <p className="text-xs text-muted-foreground">
                                    Creators with sales
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Top Creators by Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="py-8 text-center text-muted-foreground">Loading blockchain data...</div>
                                ) : topCreators.length > 0 ? (
                                    topCreators.map((creator, index) => (
                                        <div
                                            key={creator.address}
                                            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{formatAddress(creator.address)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {creator.sales} Sales
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-bold">{creator.volume.toFixed(4)} ETH</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">No sales data found yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="trending" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Sold Prompts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="py-8 text-center text-muted-foreground">Loading blockchain data...</div>
                                ) : trendingPrompts.length > 0 ? (
                                    trendingPrompts.map((prompt, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 font-bold text-purple-500">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{prompt.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Sold recently
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-bold">{prompt.price} ETH</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">No recent sales found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
