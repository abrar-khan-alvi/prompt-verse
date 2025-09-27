"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ethers } from "ethers";
import AIPromptNFTAbiFile from "@/lib/abis/AIPromptNFT.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const MY_PINATA_GATEWAY =
  "https://blush-causal-felidae-159.mypinata.cloud/ipfs/";
const BESU_RPC_URL = "http://localhost:8545";

function resolveIpfsUrl(ipfsUri: string | null | undefined): string | null {
  if (
    !ipfsUri ||
    typeof ipfsUri !== "string" ||
    !ipfsUri.startsWith("ipfs://")
  ) {
    if (
      ipfsUri &&
      (ipfsUri.startsWith("http://") || ipfsUri.startsWith("https://"))
    ) {
      return ipfsUri;
    }
    return null;
  }
  const cid = ipfsUri.substring(7);
  return `${MY_PINATA_GATEWAY}${cid}`;
}

export default function PromptDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const tokenId = typeof params.id === "string" ? params.id : undefined;
  const [nftDetails, setNftDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    "description" | "prompt" | "activity"
  >("description");
  const [activityEvents, setActivityEvents] = useState<any[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [listPrice, setListPrice] = useState(""); // price in ETH as string
  const [isListing, setIsListing] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const initProviderAndSigner = async () => {
      if (typeof window.ethereum !== "undefined") {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethProvider);
        try {
          const accounts = await window.ethereum.request?.({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            setConnectedAccount(accounts[0]);
            const ethSigner = await ethProvider.getSigner();
            setSigner(ethSigner);
          }
          window.ethereum.on(
            "accountsChanged",
            async (newAccounts: string[]) => {
              if (newAccounts.length > 0) {
                setConnectedAccount(newAccounts[0]);
                const newSigner = await ethProvider.getSigner();
                setSigner(newSigner);
              } else {
                setConnectedAccount(null);
                setSigner(null);
              }
            }
          );
        } catch (e) {}
      } else {
        try {
          setProvider(new ethers.JsonRpcProvider(BESU_RPC_URL));
        } catch (e) {
          setError("Could not connect to blockchain.");
        }
      }
    };
    initProviderAndSigner();
  }, []);

  const CONTRACT_DEPLOY_BLOCK = 0; // Or your actual contract deployment block
  const EVENT_QUERY_BATCH_SIZE = 2000; // Try a smaller batch size for event queries

  // Modified helper to fetch events in chunks for a specific filter
  async function fetchEventsInChunks(
    contract: ethers.Contract,
    filter: ethers.TopicFilter | ethers.ContractEventName, // Can be a pre-made filter or just event name
    fromBlock: number,
    toBlockNumber: number, // Renamed from toBlock to avoid conflict with keyword
    chunkSize: number = EVENT_QUERY_BATCH_SIZE
  ): Promise<ethers.EventLog[]> {
    let allChunkEvents: ethers.EventLog[] = [];
    for (
      let currentFrom = fromBlock;
      currentFrom <= toBlockNumber;
      currentFrom += chunkSize
    ) {
      let currentTo = Math.min(currentFrom + chunkSize - 1, toBlockNumber);
      try {
        const chunkEvents = (await contract.queryFilter(
          filter,
          currentFrom,
          currentTo
        )) as ethers.EventLog[];
        allChunkEvents.push(...chunkEvents);
      } catch (e: any) {
        console.error(
          `Error fetching event chunk (${String(
            typeof filter === "string" ? filter : filter.topics
          )}) from ${currentFrom} to ${currentTo}:`,
          e.message
        );
        // Optionally, re-throw or handle (e.g., try smaller chunk if it's a range error)
        if (
          e.data?.message?.includes("exceeds maximum RPC range limit") ||
          e.message?.includes("exceeds maximum RPC range limit")
        ) {
          // If even a smaller chunk fails with range limit, the limit is very small.
          // This indicates a potential node configuration issue or a very busy block range.
          setError(
            (prev) => `${prev} Event query range limit hit for a batch. `
          );
        }
      }
    }
    return allChunkEvents;
  }

  const fetchActivityEvents = useCallback(async () => {
    if (!tokenId || !provider || !CONTRACT_ADDRESS) {
      console.warn("[ActivityLog] Missing dependencies for fetching activity.");
      setActivityEvents([]); // Clear previous logs
      setLoadingActivity(false); // Ensure loading stops
      return;
    }

    setLoadingActivity(true);
    setError(""); // Clear previous page-level errors
    // console.log(`[ActivityLog] Fetching events for Token ID: ${tokenId}`);

    let allProcessedEvents: ActivityEvent[] = [];

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        AIPromptNFTAbiFile.abi as ContractInterface,
        provider
      );
      const numericTokenId = ethers.getBigInt(tokenId);
      const latestBlock = await provider.getBlockNumber();
      const startBlock = CONTRACT_DEPLOY_BLOCK;

      // Define filters for each event type, including the indexed tokenId
      const mintedFilter = contract.filters.PromptMinted(numericTokenId);
      const listedFilter = contract.filters.PromptListed(numericTokenId);
      const soldFilter = contract.filters.PromptSold(numericTokenId);
      const delistedFilter = contract.filters.PromptDelisted(numericTokenId);
      // For Transfer, tokenId is the 3rd indexed topic. from and to are first two.
      const transferFilter = contract.filters.Transfer(
        null,
        null,
        numericTokenId
      );

      const [
        mintedEvents,
        listedEvents,
        soldEvents,
        delistedEvents,
        transferEvents, // For direct transfers
      ] = await Promise.all([
        fetchEventsInChunks(contract, mintedFilter, startBlock, latestBlock),
        fetchEventsInChunks(contract, listedFilter, startBlock, latestBlock),
        fetchEventsInChunks(contract, soldFilter, startBlock, latestBlock),
        fetchEventsInChunks(contract, delistedFilter, startBlock, latestBlock),
        fetchEventsInChunks(contract, transferFilter, startBlock, latestBlock),
      ]);

      // console.log(
      //   `[ActivityLog] Raw events - Minted: ${mintedEvents.length}, Listed: ${listedEvents.length}, Sold: ${soldEvents.length}, Delisted: ${delistedEvents.length}, Transfers: ${transferEvents.length}`
      // );

      // Process Minted Events
      for (const event of mintedEvents as any[]) {
        const block = await provider.getBlock(event.blockNumber);
        if (event.args && block) {
          allProcessedEvents.push({
            id: `${event.transactionHash}-${event.logIndex}-minted`,
            type: "Minted",
            from: ethers.ZeroAddress,
            to: event.args.creator,
            price:
              event.args.price > 0
                ? `${ethers.formatEther(event.args.price)} ETH (Initial List)`
                : "-",
            date: new Date(block.timestamp * 1000).toLocaleDateString(),
            timestamp: block.timestamp,
            txHash: event.transactionHash,
          });
        }
      }
      // Process Listed Events
      for (const event of listedEvents as any[]) {
        const block = await provider.getBlock(event.blockNumber);
        if (event.args && block) {
          allProcessedEvents.push({
            id: `${event.transactionHash}-${event.logIndex}-listed`,
            type: "Listed/Price Update",
            from: event.args.seller,
            to: null,
            price: `${ethers.formatEther(event.args.price)} ETH`,
            date: new Date(block.timestamp * 1000).toLocaleDateString(),
            timestamp: block.timestamp,
            txHash: event.transactionHash,
          });
        }
      }
      // Process Sold Events
      for (const event of soldEvents as any[]) {
        const block = await provider.getBlock(event.blockNumber);
        if (event.args && block) {
          allProcessedEvents.push({
            id: `${event.transactionHash}-${event.logIndex}-sold`,
            type: "Sold",
            from: event.args.seller,
            to: event.args.buyer,
            price: `${ethers.formatEther(event.args.price)} ETH`,
            date: new Date(block.timestamp * 1000).toLocaleDateString(),
            timestamp: block.timestamp,
            txHash: event.transactionHash,
          });
        }
      }
      // Process Delisted Events
      for (const event of delistedEvents as any[]) {
        const block = await provider.getBlock(event.blockNumber);
        if (event.args && block) {
          allProcessedEvents.push({
            id: `${event.transactionHash}-${event.logIndex}-delisted`,
            type: "Delisted",
            from: event.args.seller,
            to: null,
            price: "-",
            date: new Date(block.timestamp * 1000).toLocaleDateString(),
            timestamp: block.timestamp,
            txHash: event.transactionHash,
          });
        }
      }
      // Process Transfer Events (filtering out mints and sales already covered)
      for (const event of transferEvents as any[]) {
        const block = await provider.getBlock(event.blockNumber);
        if (event.args && block) {
          const isMintEvent = event.args.from === ethers.ZeroAddress;
          const isRedundantSaleTransfer = soldEvents.some(
            (soldEvent) =>
              soldEvent.transactionHash === event.transactionHash &&
              soldEvent.args.seller === event.args.from &&
              soldEvent.args.buyer === event.args.to
          );

          if (!isMintEvent && !isRedundantSaleTransfer) {
            allProcessedEvents.push({
              id: `${event.transactionHash}-${event.logIndex}-transfer`,
              type: "Transferred",
              from: event.args.from,
              to: event.args.to,
              price: "-",
              date: new Date(block.timestamp * 1000).toLocaleDateString(),
              timestamp: block.timestamp,
              txHash: event.transactionHash,
            });
          }
        }
      }

      allProcessedEvents.sort((a, b) => b.timestamp - a.timestamp); // Sort newest first
      setActivityEvents(allProcessedEvents);
    } catch (e: any) {
      console.error(
        `[ActivityLog] Main error fetching activity for token ${tokenId}:`,
        e
      );
      setError((prev) => `${prev}Failed to fetch activity log: ${e.message}. `);
      setActivityEvents([]); // Clear on error
    } finally {
      setLoadingActivity(false);
    }
  }, [tokenId, provider]);

  const fetchNftDetails = useCallback(async () => {
    if (!tokenId || !provider || !CONTRACT_ADDRESS) {
      if (isClient && !provider && tokenId)
        setError("Blockchain provider not available.");
      if (isClient && !tokenId) setError("Token ID not found in URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        AIPromptNFTAbiFile.abi,
        provider
      );
      const numericTokenId = tokenId.toString(); // Instead of ethers.getBigInt(tokenId)

      const [
        promptDataChain,
        saleDataChain,
        tokenURIFromContract,
        currentOwner,
      ] = await Promise.all([
        contract.getPromptData(numericTokenId),
        contract.getSaleData(numericTokenId),
        contract.tokenURI(numericTokenId),
        contract.ownerOf(numericTokenId),
      ]);

      let details: any = {
        tokenId,
        title_onchain: promptDataChain.title,
        platform_onchain: promptDataChain.platform,
        description_onchain: promptDataChain.description,
        promptText_onchain: promptDataChain.promptText,
        creator_onchain: promptDataChain.creator,
        createdAt_onchain: new Date(
          Number(promptDataChain.createdAt) * 1000
        ).toISOString(),
        includeMedia_onchain: promptDataChain.includeMedia,
        includeOutputSample_onchain: promptDataChain.includeOutputSample,
        price_onchain:
          saleDataChain.price > 0
            ? ethers.formatEther(saleDataChain.price)
            : "Not for sale",
        isForSale_onchain: saleDataChain.isForSale,
        seller_onchain: saleDataChain.seller,
        currentOwner_onchain: currentOwner,
        tokenURI: tokenURIFromContract?.toString(),
      };

      if (details.tokenURI && details.tokenURI.startsWith("ipfs://")) {
        const metadataHttpUrl = resolveIpfsUrl(details.tokenURI);
        if (metadataHttpUrl) {
          const metadataResponse = await fetch(metadataHttpUrl);
          if (metadataResponse.ok) {
            const fetchedMetadata = await metadataResponse.json();
            details.metadataTitle =
              fetchedMetadata.name || details.title_onchain;
            details.metadataDescription =
              fetchedMetadata.description || details.description_onchain;
            if (fetchedMetadata.image) {
              details.metadataImage = resolveIpfsUrl(fetchedMetadata.image);
            }
            details.metadataPromptText =
              fetchedMetadata.prompt_text || details.promptText_onchain;
            details.metadataInputMediaURIs = fetchedMetadata.input_media_uris
              ?.map(resolveIpfsUrl)
              .filter((url: any) => url !== null);
            details.metadataOutputSampleURIs =
              fetchedMetadata.output_sample_uris
                ?.map(resolveIpfsUrl)
                .filter((url: any) => url !== null);
            details.metadataAttributes = fetchedMetadata.attributes;
          } else {
            details.fetchError = `Metadata fetch failed (Status: ${metadataResponse.status})`;
          }
        } else {
          details.fetchError = "Could not resolve IPFS URI for metadata.";
        }
      } else {
        details.fetchError = "Invalid or non-IPFS Token URI from contract.";
      }
      setNftDetails(details);
    } catch (e: any) {
      setError(`Failed to fetch details: ${e.message || "Unknown error"}`);
      setNftDetails(null);
    } finally {
      setLoading(false);
    }
  }, [tokenId, provider, isClient]);

  useEffect(() => {
    if (isClient && provider && tokenId) {
      fetchNftDetails();
      fetchActivityEvents();
    }
  }, [isClient, provider, tokenId, fetchNftDetails, fetchActivityEvents]);

  const handleBuy = async () => {
    if (
      !nftDetails ||
      !nftDetails.isForSale_onchain ||
      !signer ||
      !connectedAccount
    ) {
      toast({
        title: "Cannot Buy",
        description: "NFT not for sale or wallet not connected.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessingTx(true);
    setStatusMessage("Preparing buy transaction...");
    try {
      const contractWithSigner = new ethers.Contract(
        CONTRACT_ADDRESS,
        AIPromptNFTAbiFile.abi,
        signer
      );
      const priceInWei = ethers.parseEther(nftDetails.price_onchain);

      setStatusMessage("Please approve the transaction in MetaMask...");
      const tx = await contractWithSigner.buyPrompt(
        ethers.getBigInt(nftDetails.tokenId),
        {
          value: priceInWei,
        }
      );
      setStatusMessage("Processing transaction on blockchain...");
      await tx.wait();

      toast({
        title: "Purchase Successful!",
        description: `You now own NFT #${nftDetails.tokenId}.`,
      });
      setIsProcessingTx(false);
      setStatusMessage("");
      await fetchNftDetails();
      await fetchActivityEvents();
      router.push("/profile");
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error?.data?.message || error?.reason || error.message,
        variant: "destructive",
      });
      setIsProcessingTx(false);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  function shortAddr(addr: string) {
    return addr
      ? `${addr.substring(0, 8)}...${addr.substring(addr.length - 5)}`
      : "";
  }
  const isOwner =
    !!connectedAccount &&
    !!nftDetails?.currentOwner_onchain &&
    connectedAccount.toLowerCase() ===
      nftDetails?.currentOwner_onchain?.toLowerCase();

  // --- UI ---
  if (!isClient || loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-muted-foreground">
        Loading NFT details...
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-destructive">
        {error}
      </div>
    );
  }
  if (!nftDetails) {
    return (
      <div className="container mx-auto py-8 px-4 text-center text-muted-foreground">
        NFT details not found. It might not exist or there was an error.
      </div>
    );
  }

  return (
    <main className="pt-24 pb-16 px-4 min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1">
            {/* Image Card */}
            <div className="rounded-lg overflow-hidden border border-border bg-card">
              {nftDetails.metadataImage ? (
                <img
                  src={nftDetails.metadataImage}
                  alt={nftDetails.metadataTitle || nftDetails.title_onchain}
                  className="w-full object-cover aspect-square"
                />
              ) : (
                <div className="rounded-lg bg-muted flex items-center justify-center aspect-square">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
            </div>
            {/* Token Info */}
            <div className="mt-4 glass p-4 rounded-lg bg-card border border-border">
              <h3 className="font-medium mb-2 text-foreground">
                Token Information
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Token ID:</span>
                  <span className="text-foreground">{nftDetails.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span>IPFS Hash:</span>
                  {isOwner ? (
                    <a
                      href={resolveIpfsUrl(nftDetails.tokenURI)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate max-w-[150px]"
                    >
                      {nftDetails.tokenURI
                        ? nftDetails.tokenURI.substring(7, 17)
                        : "N/A"}
                      ...
                    </a>
                  ) : (
                    <span className="italic text-muted-foreground">
                      Only owner can view
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2 gradient-text text-foreground">
              {nftDetails.metadataTitle ||
                nftDetails.title_onchain ||
                `Prompt NFT #${nftDetails.tokenId}`}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="text-muted-foreground text-sm">
                Created by{" "}
                <span className="text-purple-400">
                  {shortAddr(nftDetails.creator_onchain)}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="text-muted-foreground text-sm">
                Owned by{" "}
                <span className="text-purple-400">
                  {shortAddr(nftDetails.currentOwner_onchain)}
                </span>
              </div>
            </div>
            <Card className="glass mb-6 bg-card border border-border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Current Price
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {nftDetails.price_onchain !== "Not for sale"
                        ? `${nftDetails.price_onchain} ETH`
                        : "Not Listed"}
                    </p>
                    {isOwner && nftDetails.price_onchain === "Not for sale" && (
                      <Button
                        onClick={() => setShowListModal(true)}
                        className="bg-gradient-to-r from-green-500 to-blue-600 mt-2"
                      >
                        List For Sale
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handleBuy}
                    disabled={
                      isProcessingTx || !nftDetails.isForSale_onchain || isOwner
                    }
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isProcessingTx
                      ? "Processing..."
                      : isOwner
                      ? "You Own This NFT"
                      : nftDetails.isForSale_onchain
                      ? "Purchase Now"
                      : "Not For Sale"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  By purchasing this NFT, you acquire full rights to use this
                  prompt for commercial purposes. Original creator earns royalty
                  on secondary sales.
                </p>
                {statusMessage && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {statusMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TABS */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full bg-muted border-border">
                <TabsTrigger value="description" className="flex-1">
                  Description
                </TabsTrigger>
                <TabsTrigger value="prompt" className="flex-1">
                  Prompt Text
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* ---- DESCRIPTION TAB ---- */}
              <TabsContent value="description" className="mt-4">
                <Card className="glass bg-card border border-border">
                  <CardContent className="p-4">
                    <p className="text-gray-300 whitespace-pre-line">
                      {nftDetails.metadataDescription ||
                        nftDetails.description_onchain ||
                        "No description provided."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ---- PROMPT TAB ---- */}
              <TabsContent value="prompt" className="mt-4">
                <Card className="glass bg-card border border-border">
                  <CardContent className="p-4">
                    {/* Only owner can see prompt text */}
                    {isOwner ? (
                      <>
                        <div className="bg-muted rounded-md p-4 text-gray-300 whitespace-pre-line">
                          {nftDetails.metadataPromptText ||
                            nftDetails.promptText_onchain ||
                            "Prompt text not available."}
                        </div>
                        {/* Only owner can see input media */}
                        {nftDetails.metadataInputMediaURIs &&
                          nftDetails.metadataInputMediaURIs.length > 0 && (
                            <div className="space-y-2 mt-6">
                              <h4 className="font-semibold text-lg text-foreground">
                                Input Media
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {nftDetails.metadataInputMediaURIs.map(
                                  (uri: string, idx: number) =>
                                    uri ? (
                                      <a
                                        key={idx}
                                        href={uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block aspect-square bg-muted rounded overflow-hidden hover:opacity-80"
                                      >
                                        <img
                                          src={uri}
                                          alt={`Input media ${idx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </a>
                                    ) : null
                                )}
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="bg-muted rounded-md p-4 text-gray-400 italic">
                        Only the owner can view the prompt text and input media.
                      </div>
                    )}

                    {/* Output Samples: visible to everyone */}
                    {nftDetails.metadataOutputSampleURIs &&
                      nftDetails.metadataOutputSampleURIs.length > 0 && (
                        <div className="space-y-2 mt-6">
                          <h4 className="font-semibold text-lg text-foreground">
                            Output Samples
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {nftDetails.metadataOutputSampleURIs.map(
                              (uri: string, idx: number) =>
                                uri ? (
                                  <a
                                    key={idx}
                                    href={uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block aspect-square bg-muted rounded overflow-hidden hover:opacity-80"
                                  >
                                    <img
                                      src={uri}
                                      alt={`Output sample ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ) : null
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </TabsContent>
              {/* ---- ACTIVITY TAB ---- */}
              <TabsContent value="activity" className="mt-4">
                <Card className="glass bg-card border border-border">
                  <CardContent className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium">
                              Event
                            </th>
                            <th className="text-left py-3 px-4 font-medium">
                              From
                            </th>
                            <th className="text-left py-3 px-4 font-medium">
                              To
                            </th>
                            <th className="text-left py-3 px-4 font-medium">
                              Price
                            </th>
                            <th className="text-left py-3 px-4 font-medium">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activityEvents.length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-3 px-4 text-center text-muted-foreground"
                              >
                                No activity found.
                              </td>
                            </tr>
                          )}
                          {activityEvents.map((item, index) => {
                            // Construct a more robust key, ensuring parts are defined.
                            // Using index as a last resort if item.id is somehow still problematic.
                            const rowKey =
                              item.id ||
                              `${item.type}-${index}-${
                                item.timestamp || Date.now()
                              }`;

                            let from = "-";
                            let to = "-";
                            let price = "-";

                            // Use optional chaining and nullish coalescing for safer access
                            const fromAddress = item.from;
                            const toAddress = item.to;

                            if (item.type === "Minted") {
                              from = "Null Address (Mint)"; // Mint event.args.from is usually address(0)
                              to = shortAddr(item.to); // event.args.creator
                            } else if (item.type === "Listed/Price Update") {
                              from = shortAddr(item.from); // event.args.seller
                              // to is not applicable
                              price = item.price || "-";
                            } else if (item.type === "Sold") {
                              from = shortAddr(item.from); // event.args.seller
                              to = shortAddr(item.to); // event.args.buyer
                              price = item.price || "-";
                            } else if (item.type === "Delisted") {
                              from = shortAddr(item.from); // event.args.seller
                              // to is not applicable
                            } else if (item.type === "Transferred") {
                              from = shortAddr(item.from);
                              to = shortAddr(item.to);
                            }

                            return (
                              <tr
                                key={rowKey}
                                className="border-b border-border hover:bg-muted/30"
                              >
                                <td className="px-3 sm:px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                  {item.type}
                                </td>
                                <td
                                  className="px-3 sm:px-6 py-4 font-mono text-xs hidden sm:table-cell truncate max-w-[100px]"
                                  title={fromAddress || undefined}
                                >
                                  {from}
                                </td>
                                <td
                                  className="px-3 sm:px-6 py-4 font-mono text-xs truncate max-w-[100px]"
                                  title={toAddress || undefined}
                                >
                                  {to}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  {price}
                                </td>
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                  <span suppressHydrationWarning>
                                    {" "}
                                    {/* For date, which can have SSR/client mismatch */}
                                    {item.date}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {showListModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-card p-8 rounded-lg border max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-foreground">
              List NFT For Sale
            </h2>
            <label className="block mb-2 text-sm text-muted-foreground">
              Price (ETH):
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              placeholder="Enter price in ETH"
              className="w-full mb-4 p-2 border rounded text-black"
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              disabled={isListing}
            />
            <div className="flex gap-4">
              <Button
                onClick={async () => {
                  setIsListing(true);
                  try {
                    if (!signer) throw new Error("Wallet not connected.");
                    if (!listPrice || Number(listPrice) <= 0)
                      throw new Error("Enter a valid price.");
                    const contract = new ethers.Contract(
                      CONTRACT_ADDRESS,
                      AIPromptNFTAbiFile.abi,
                      signer
                    );
                    const tx = await contract.listForSale(
                      ethers.getBigInt(nftDetails.tokenId),
                      ethers.parseEther(listPrice)
                    );
                    await tx.wait();
                    toast({
                      title: "NFT Listed!",
                      description: "Your NFT is now for sale.",
                    });
                    setShowListModal(false);
                    setListPrice("");
                    await fetchNftDetails(); // refresh UI
                    await fetchActivityEvents(); // update activity tab
                  } catch (error: any) {
                    toast({
                      title: "List Failed",
                      description:
                        error?.data?.message || error?.reason || error.message,
                      variant: "destructive",
                    });
                  }
                  setIsListing(false);
                }}
                disabled={isListing}
              >
                {isListing ? "Listing..." : "Confirm"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowListModal(false)}
                disabled={isListing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
