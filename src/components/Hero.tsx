"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ethers, Provider } from "ethers";
import { Button } from "@/components/ui/button";
import { Layers, Users, Zap, Brain, ArrowRight } from "lucide-react";
import { useHeroStats } from "../hooks/useHeroStats"; // <-- your new hook!

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const BESU_RPC_URL = process.env.NEXT_PUBLIC_BESU_RPC_URL;

const initialStats = {
  promptsCreated: "...",
  activeCreators: "...",
  totalTrades: "...",
  volumeTraded: "..."
};

const naStats = {
  promptsCreated: "N/A",
  activeCreators: "N/A",
  totalTrades: "N/A",
  volumeTraded: "N/A"
};

const Hero = () => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [initError, setInitError] = useState(""); // For provider/config errors

  // --- Provider Initialization (same as before) ---
  useEffect(() => {
    setIsClient(true);

    if (!CONTRACT_ADDRESS) {
      setInitError("Application configuration error (Contract address missing).");
      return;
    }

    if (typeof window.ethereum !== "undefined") {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
    } else {
      try {
        const jsonRpcProvider = new ethers.JsonRpcProvider(BESU_RPC_URL);
        setProvider(jsonRpcProvider);
      } catch (e) {
        setInitError("Failed to connect to blockchain for stats. RPC might be down.");
      }
    }
  }, []);

  // --- Use your hook for stats ---
  const { stats, isLoading, fetchStats } = useHeroStats(provider);

  // --- Example: You can expose fetchStats via context or prop to child components ---

  const statItems = [
    { icon: <Layers size={28} className="text-primary mb-2" />, label: "Prompts Created", valueKey: "promptsCreated" as const },
    { icon: <Users size={28} className="text-primary mb-2" />, label: "Unique Creators", valueKey: "activeCreators" as const },
    { icon: <Zap size={28} className="text-primary mb-2" />, label: "Total Trades", valueKey: "totalTrades" as const },
    { icon: <Brain size={28} className="text-primary mb-2" />, label: "Volume Traded", valueKey: "volumeTraded" as const }
  ];

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height,80px))] flex flex-col items-center justify-center text-center px-4 py-10 md:py-20 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-purple-600/10 rounded-full blur-3xl animate-blob_1 opacity-70"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob_2 opacity-70"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 md:w-80 md:h-80 bg-pink-500/10 rounded-full blur-3xl animate-blob_3 opacity-50"></div>
      </div>

      <div className="relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 gradient-text animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          Own, Trade & Monetize <br className="hidden sm:block" /> Your AI Prompts
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          Welcome to AI Prompt NFTs – the decentralized marketplace for tokenizing, verifying, and trading unique AI-generated prompts. Secure your intellectual property and unlock its true value on our private Besu blockchain.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          <Link href="/create" passHref>
            <Button size="lg" className="bg-gradient-button hover:bg-gradient-button-hover text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105">
              Create & Mint Prompt <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
          <Link href="/marketplace" passHref>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-accent/30 transition-all duration-300 transform hover:scale-105">
              Explore Marketplace
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 md:mt-24 glass p-6 md:p-8 rounded-xl animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          {initError && <p className="col-span-full text-destructive text-sm py-2">{initError}</p>}
          {statItems.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-2">
              {stat.icon}
              <p className="text-2xl md:text-3xl font-bold gradient-text">
                {isLoading ? "..." : stats[stat.valueKey]}
              </p>
              <p className="text-muted-foreground text-xs md:text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
