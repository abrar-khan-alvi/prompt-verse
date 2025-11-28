'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ethers, Provider } from 'ethers';
import { Button } from '@/components/ui/button';
import { Layers, Users, Zap, Brain, ArrowRight } from 'lucide-react';
import { useHeroStats } from '../hooks/useHeroStats'; // <-- your new hook!

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const BESU_RPC_URL = process.env.NEXT_PUBLIC_BESU_RPC_URL;

const initialStats = {
  promptsCreated: '...',
  activeCreators: '...',
  totalTrades: '...',
  volumeTraded: '...',
};

const naStats = {
  promptsCreated: 'N/A',
  activeCreators: 'N/A',
  totalTrades: 'N/A',
  volumeTraded: 'N/A',
};

const Hero = () => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [initError, setInitError] = useState(''); // For provider/config errors

  // --- Provider Initialization (same as before) ---
  useEffect(() => {
    setIsClient(true);

    if (!CONTRACT_ADDRESS) {
      setInitError('Application configuration error (Contract address missing).');
      return;
    }

    if (typeof window.ethereum !== 'undefined') {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
    } else {
      try {
        const jsonRpcProvider = new ethers.JsonRpcProvider(BESU_RPC_URL);
        setProvider(jsonRpcProvider);
      } catch (e) {
        setInitError('Failed to connect to blockchain for stats. RPC might be down.');
      }
    }
  }, []);

  // --- Use your hook for stats ---
  const { stats, isLoading, fetchStats } = useHeroStats(provider);

  // --- Example: You can expose fetchStats via context or prop to child components ---

  const statItems = [
    {
      icon: <Layers size={28} className="mb-2 text-primary" />,
      label: 'Prompts Created',
      valueKey: 'promptsCreated' as const,
    },
    {
      icon: <Users size={28} className="mb-2 text-primary" />,
      label: 'Unique Creators',
      valueKey: 'activeCreators' as const,
    },
    {
      icon: <Zap size={28} className="mb-2 text-primary" />,
      label: 'Total Trades',
      valueKey: 'totalTrades' as const,
    },
    {
      icon: <Brain size={28} className="mb-2 text-primary" />,
      label: 'Volume Traded',
      valueKey: 'volumeTraded' as const,
    },
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-var(--navbar-height,80px))] flex-col items-center justify-center overflow-hidden px-4 py-10 text-center md:py-20">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-20">
        <div className="animate-blob_1 absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-purple-600/10 opacity-70 blur-3xl md:h-96 md:w-96"></div>
        <div className="animate-blob_2 absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-blue-600/10 opacity-70 blur-3xl md:h-96 md:w-96"></div>
        <div className="animate-blob_3 absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-pink-500/10 opacity-50 blur-3xl md:h-80 md:w-80"></div>
      </div>

      <div className="relative z-10">
        <h1
          className="gradient-text animate-fadeInUp mb-6 text-4xl font-extrabold sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ animationDelay: '0.2s' }}
        >
          Own, Trade & Monetize <br className="hidden sm:block" /> Your AI Prompts
        </h1>
        <p
          className="animate-fadeInUp mx-auto mb-10 max-w-3xl text-lg text-muted-foreground md:text-xl"
          style={{ animationDelay: '0.4s' }}
        >
          Welcome to AI Prompt NFTs – the decentralized marketplace for tokenizing, verifying, and
          trading unique AI-generated prompts. Secure your intellectual property and unlock its true
          value on our private Besu blockchain.
        </p>
        <div
          className="animate-fadeInUp flex flex-col justify-center gap-4 sm:flex-row"
          style={{ animationDelay: '0.6s' }}
        >
          <Link href="/create" passHref>
            <Button
              size="lg"
              className="bg-gradient-button hover:bg-gradient-button-hover transform px-8 py-3 text-lg font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary/40"
            >
              Create & Mint Prompt <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
          <Link href="/marketplace" passHref>
            <Button
              size="lg"
              variant="outline"
              className="transform border-primary px-8 py-3 text-lg font-semibold text-primary shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:text-primary-foreground hover:shadow-accent/30"
            >
              Explore Marketplace
            </Button>
          </Link>
        </div>

        <div
          className="glass animate-fadeInUp mt-16 grid grid-cols-2 gap-4 rounded-xl p-6 md:mt-24 md:grid-cols-4 md:gap-8 md:p-8"
          style={{ animationDelay: '0.8s' }}
        >
          {initError && <p className="col-span-full py-2 text-sm text-destructive">{initError}</p>}
          {statItems.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-2">
              {stat.icon}
              <p className="gradient-text text-2xl font-bold md:text-3xl">
                {isLoading ? '...' : stats[stat.valueKey]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
