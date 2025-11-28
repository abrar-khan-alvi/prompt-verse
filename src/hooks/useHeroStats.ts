import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import AIPromptNFTAbiFile from '../lib/abis/AIPromptNFT.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_DEPLOYMENT_BLOCK = 9710000; // Sepolia deployment block
const EVENT_QUERY_BATCH_SIZE = 2000;

const initialStats = {
  promptsCreated: '...',
  activeCreators: '...',
  totalTrades: '...',
  volumeTraded: '...',
};

async function fetchHeroStatistics(currentProvider) {
  if (!CONTRACT_ADDRESS || !currentProvider) {
    return initialStats;
  }
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, currentProvider);
    // Prompts Created
    let promptsCreated = '0';
    try {
      const totalSupplyBigNum = await contract.totalSupply();
      promptsCreated = totalSupplyBigNum.toString();
    } catch (e) {
      promptsCreated = 'N/A';
    }

    // Events
    const latestBlock = await currentProvider.getBlockNumber();
    const deploymentBlock = CONTRACT_DEPLOYMENT_BLOCK;
    const batchSize = EVENT_QUERY_BATCH_SIZE;
    let allMintedEvents = [];
    let allSoldEvents = [];

    // Fetch Minted Events
    for (let fromBlock = deploymentBlock; fromBlock <= latestBlock; fromBlock += batchSize) {
      const toBlock = Math.min(fromBlock + batchSize - 1, latestBlock);
      try {
        const mintedBatch = await contract.queryFilter(
          contract.filters.PromptMinted(),
          fromBlock,
          toBlock
        );
        allMintedEvents = allMintedEvents.concat(mintedBatch);
      } catch (e) {}
    }

    // Fetch Sold Events
    for (let fromBlock = deploymentBlock; fromBlock <= latestBlock; fromBlock += batchSize) {
      const toBlock = Math.min(fromBlock + batchSize - 1, latestBlock);
      try {
        const soldBatch = await contract.queryFilter(
          contract.filters.PromptSold(),
          fromBlock,
          toBlock
        );
        allSoldEvents = allSoldEvents.concat(soldBatch);
      } catch (e) {}
    }

    // Active Creators
    const uniqueCreators = new Set();
    allMintedEvents.forEach(
      (event) => event.args?.creator && uniqueCreators.add(event.args.creator.toString())
    );
    const activeCreators = uniqueCreators.size.toString();

    // Total Trades
    const totalTrades = allSoldEvents.length.toString();

    // Volume Traded
    let totalVolumeInWei = ethers.getBigInt(0);
    allSoldEvents.forEach((event) => {
      if (event.args?.price) {
        try {
          totalVolumeInWei = totalVolumeInWei + ethers.getBigInt(event.args.price);
        } catch (e) {}
      }
    });
    const volumeInEth = parseFloat(ethers.formatEther(totalVolumeInWei));
    const volumeTraded = isNaN(volumeInEth)
      ? 'N/A'
      : `${volumeInEth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ETH`;

    return {
      promptsCreated,
      activeCreators,
      totalTrades,
      volumeTraded,
    };
  } catch (error) {
    return initialStats;
  }
}

export function useHeroStats(provider) {
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    const result = await fetchHeroStatistics(provider);
    setStats(result);
    setIsLoading(false);
  }, [provider]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, fetchStats };
}
