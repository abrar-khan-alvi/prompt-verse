'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AIPromptNFTAbiFile from '@/lib/abis/AIPromptNFT.json';
import PromptCard, { PromptCardProps } from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const MY_PINATA_GATEWAY = 'https://blush-causal-felidae-159.mypinata.cloud/ipfs/';
const BESU_RPC_URL = process.env.NEXT_PUBLIC_BESU_RPC_URL;
const MAX_FEATURED = 8;

function resolveIpfsUrl(ipfsUri: string | null | undefined): string | null {
  if (!ipfsUri || typeof ipfsUri !== 'string' || !ipfsUri.startsWith('ipfs://')) {
    if (ipfsUri && (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://'))) {
      return ipfsUri;
    }
    return null;
  }
  const cid = ipfsUri.substring(7);
  return `${MY_PINATA_GATEWAY}${cid}`;
}

interface FeaturedNftDisplayData extends PromptCardProps {
  createdAt?: number; // for sorting
}

const FeaturePrompts: React.FC = () => {
  const [nfts, setNfts] = useState<FeaturedNftDisplayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNFTs = async () => {
      setLoading(true);
      try {
        // Provider setup
        let provider: ethers.Provider;
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
        } else {
          provider = new ethers.JsonRpcProvider(BESU_RPC_URL);
        }
        const contract = new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, provider);

        // --- Fetch all NFTs currently listed for sale (just like Marketplace) ---
        const tokenIdsForSale: ethers.BigNumberish[] = await contract.getTokensForSale();
        if (!tokenIdsForSale || tokenIdsForSale.length === 0) {
          setNfts([]);
          setLoading(false);
          return;
        }

        const nftsDataPromises = tokenIdsForSale.map(async (tokenIdBigNum) => {
          const tokenIdStr = tokenIdBigNum.toString();
          const tokenIdNum = ethers.getBigInt(tokenIdBigNum);
          try {
            const saleData = await contract.getSaleData(tokenIdNum);
            const tokenURIFromContract = await contract.tokenURI(tokenIdNum);

            let nftData: FeaturedNftDisplayData = {
              id: tokenIdStr,
              title: `Prompt #${tokenIdStr}`,
              preview: 'Loading details...',
              image: undefined,
              price: saleData.price ? ethers.formatEther(saleData.price) : '0.00',
              creator: {
                address: saleData.seller.toString(),
                name: undefined,
              },
              createdAt: undefined,
            };

            if (tokenURIFromContract && tokenURIFromContract.startsWith('ipfs://')) {
              const metadataHttpUrl = resolveIpfsUrl(tokenURIFromContract);
              if (metadataHttpUrl) {
                const metadataResponse = await fetch(metadataHttpUrl);
                if (metadataResponse.ok) {
                  const meta = await metadataResponse.json();
                  nftData.title = meta.name || nftData.title;
                  nftData.preview = meta.description || 'No description available.';
                  nftData.image = meta.image ? resolveIpfsUrl(meta.image) : undefined;
                  if (meta.createdAt) {
                    nftData.createdAt = Number(meta.createdAt) || undefined;
                  }
                }
              }
            }
            return nftData;
          } catch (err) {
            return null;
          }
        });

        let fetchedNfts = (await Promise.all(nftsDataPromises)).filter(
          Boolean
        ) as FeaturedNftDisplayData[];

        // Sort by createdAt if available, else newest tokenId first
        fetchedNfts.sort((a, b) => {
          if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
          return Number(b.id) - Number(a.id);
        });

        setNfts(fetchedNfts.slice(0, MAX_FEATURED));
      } catch (err) {
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNFTs();
  }, []);

  return (
    <section className="container mx-auto px-4 pb-12 pt-8">
      <h2 className="gradient-text mb-2 text-center text-3xl font-bold md:text-4xl">
        Latest AI Prompts
      </h2>
      <p className="mb-10 text-center text-lg text-muted-foreground">
        Explore the freshest prompt NFTs minted by creators.
      </p>

      {loading && (
        <div className="my-6 text-center text-muted-foreground">Loading latest prompts...</div>
      )}
      {!loading && nfts.length === 0 && (
        <div className="my-6 text-center text-muted-foreground">
          No prompts found.{' '}
          <Button asChild>
            <a href="/create">Mint one!</a>
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-8">
        {nfts.map((nft) => (
          <PromptCard key={nft.id} {...nft} />
        ))}
      </div>
      {/* View More Button */}
      <div className="mt-12 text-center">
        <Button variant="outline" className="border-purple-500 hover:bg-purple-500/20">
          <Link href="/marketplace">View More Prompts</Link>
        </Button>
      </div>
    </section>
  );
};

export default FeaturePrompts;
