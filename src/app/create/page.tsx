"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import AIPromptNFTAbiFile from "../../lib/abis/AIPromptNFT.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

interface MediaFileWrapper {
  id: string;
  file: File;
  preview: string;
}

const AI_PLATFORMS = [
  "OpenAI", "Midjourney", "Stable Diffusion", "Google Gemini",
  "Anthropic Claude", "Cohere", "Hugging Face", "Microsoft Azure AI",
  "Amazon Bedrock", "Perplexity", "Other",
];

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: AI_PLATFORMS[0] || "",
    promptText: "",
    includeMedia: false,
    price: "0.01",
    royalty: "10",
  });

  const [inputMediaFiles, setInputMediaFiles] = useState<MediaFileWrapper[]>([]);
  const [includeOutputSample, setIncludeOutputSample] = useState(false);
  const [outputSampleFiles, setOutputSampleFiles] = useState<MediaFileWrapper[]>([]);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

  useEffect(() => {
    const initWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request?.({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setConnectedAccount(accounts[0]);
          }
          window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
            setConnectedAccount(newAccounts.length > 0 ? newAccounts[0] : null);
          });
        } catch (e) { console.error("Error initializing wallet", e); }
      }
    };
    initWallet();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncludeMediaSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, includeMedia: checked }));
    if (!checked) setInputMediaFiles([]);
  };

  const handleFileUploaderChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'input' | 'output') => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        const newMediaFile: MediaFileWrapper = {
          id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          preview,
        };
        if (type === 'input') {
          setInputMediaFiles((prev) => [...prev, newMediaFile]);
        } else {
          setOutputSampleFiles((prev) => [...prev, newMediaFile]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeFile = (id: string, type: 'input' | 'output') => {
    if (type === 'input') {
      setInputMediaFiles((prev) => prev.filter((f) => f.id !== id));
    } else {
      setOutputSampleFiles((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.promptText || !formData.platform) {
      toast({ title: "Missing Required Fields", description: "Title, Platform, and Prompt Text are required.", variant: "destructive" });
      return;
    }
    if (!connectedAccount) {
      toast({ title: "Wallet Not Connected", description: "Please connect your MetaMask wallet.", variant: "destructive" });
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request?.({ method: 'eth_requestAccounts' });
      }
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Initializing...');

    try {
      setStatusMessage('Preparing files for IPFS...');
      let finalInputMediaCIDs: string[] = [];
      if (formData.includeMedia && inputMediaFiles.length > 0) {
        setStatusMessage(`Uploading ${inputMediaFiles.length} input media file(s)...`);
        for (const mediaWrapper of inputMediaFiles) {
          const fileData = new FormData();
          fileData.append('file', mediaWrapper.file);
          const res = await fetch('/api/uploadFile', { method: 'POST', body: fileData });
          const result = await res.json();
          if (!res.ok || !result.success) throw new Error(result.error || 'Input media file upload failed');
          finalInputMediaCIDs.push(result.cid);
        }
      }

      let finalOutputSampleCIDs: string[] = [];
      if (includeOutputSample && outputSampleFiles.length > 0) {
        setStatusMessage(`Uploading ${outputSampleFiles.length} output sample file(s)...`);
        for (const mediaWrapper of outputSampleFiles) {
          const fileData = new FormData();
          fileData.append('file', mediaWrapper.file);
          const res = await fetch('/api/uploadFile', { method: 'POST', body: fileData });
          const result = await res.json();
          if (!res.ok || !result.success) throw new Error(result.error || 'Output sample file upload failed');
          finalOutputSampleCIDs.push(result.cid);
        }
      }

      setStatusMessage('Constructing metadata...');
      const metadataToUpload = {
        name: formData.title,
        description: formData.description,
        platform: formData.platform,
        prompt_text: formData.promptText,
        image: finalOutputSampleCIDs.length > 0
          ? `ipfs://${finalOutputSampleCIDs[0]}`
          : (finalInputMediaCIDs.length > 0 ? `ipfs://${finalInputMediaCIDs[0]}` : undefined),
        input_media_uris: finalInputMediaCIDs.map(cid => `ipfs://${cid}`),
        output_sample_uris: finalOutputSampleCIDs.map(cid => `ipfs://${cid}`),
        attributes: [
          { trait_type: "AI Platform", value: formData.platform },
          { trait_type: "Includes Input Media", value: formData.includeMedia.toString() },
          { trait_type: "Includes Output Sample", value: includeOutputSample.toString() },
          { trait_type: "Price (ETH)", value: formData.price },
          { trait_type: "Royalty (%)", value: formData.royalty },
        ],
      };

      setStatusMessage('Uploading metadata to IPFS...');
      const metadataRes = await fetch('/api/uploadMetadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadataToUpload),
      });
      const metadataResult = await metadataRes.json();
      if (!metadataRes.ok || !metadataResult.success) {
        throw new Error(metadataResult.error || 'Metadata IPFS upload failed');
      }
      const tokenURI = `ipfs://${metadataResult.cid}`;

      setStatusMessage('Preparing mint transaction...');
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, signer);

      const priceInWei = ethers.parseEther(formData.price || "0");
      const royaltyBasisPoints = Math.floor(parseFloat(formData.royalty || "0") * 100);

      const transaction = await contract.mintPrompt(
        formData.title,
        formData.platform,
        formData.description,
        formData.promptText,
        tokenURI,
        priceInWei,
        royaltyBasisPoints,
        formData.includeMedia,
        includeOutputSample
      );

      setStatusMessage('Minting transaction sent, awaiting confirmation...');
      const receipt = await transaction.wait();

      let mintedTokenId = "N/A";
      if (receipt?.logs) {
        const eventInterface = new ethers.Interface(AIPromptNFTAbiFile.abi);
        for (const log of receipt.logs as any[]) {
          try {
            const parsedLog = eventInterface.parseLog(log);
            if (parsedLog && parsedLog.name === "PromptMinted") {
              mintedTokenId = parsedLog.args.tokenId.toString();
              break;
            }
          } catch (err) { /* ignore */ }
        }
      }
      setStatusMessage('');
      toast({
        title: "Prompt NFT Minted!",
        description: `Token ID: ${mintedTokenId}. Your NFT "${formData.title}" is live.`,
      });
      router.push(mintedTokenId !== "N/A" ? `/prompt/${mintedTokenId}` : `/profile`);
    } catch (error: any) {
      console.error("Full handleSubmit error:", error);
      toast({
        title: "Minting Operation Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 gradient-text text-center">
        Create Your Prompt NFT
      </h1>
      <Card className="glass">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Title *</Label>
              <Input id="title" name="title" placeholder="Epic Space Battle Prompt" value={formData.title} onChange={handleChange} className="bg-card border-border text-foreground placeholder:text-muted-foreground" required />
            </div>
            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-foreground">AI Platform *</Label>
              <select id="platform" name="platform" value={formData.platform} onChange={handleChange} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                <option value="">Select AI Platform</option>
                {AI_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea id="description" name="description" placeholder="A detailed prompt for generating..." value={formData.description} onChange={handleChange} className="bg-card border-input min-h-[100px] text-foreground placeholder:text-muted-foreground" />
            </div>
            {/* Prompt Text */}
            <div className="space-y-2">
              <Label htmlFor="promptText" className="text-foreground">Prompt Text *</Label>
              <Textarea id="promptText" name="promptText" placeholder="Your actual AI prompt..." value={formData.promptText} onChange={handleChange} className="bg-card border-input min-h-[150px] text-foreground placeholder:text-muted-foreground" required/>
            </div>
            {/* Include Input Media Switch & Upload */}
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="includeMedia" name="includeMedia" checked={formData.includeMedia} onCheckedChange={handleIncludeMediaSwitchChange} />
              <Label htmlFor="includeMedia" className="text-foreground">Include Input Media File(s)</Label>
            </div>
            {formData.includeMedia && (
              <div className="space-y-4 pl-2 border-l-2 border-border/50 ml-2">
                <Label htmlFor="inputMediaFiles" className="text-muted-foreground block pt-2">Upload Input Media</Label>
                <Input id="inputMediaFiles" type="file" accept="image/*,audio/*,video/*,.pdf" onChange={(e) => handleFileUploaderChange(e, 'input')} className="bg-card border-input text-muted-foreground file:text-primary file:font-semibold" multiple />
                {inputMediaFiles.length > 0 && <div className="text-sm text-muted-foreground">Previews ({inputMediaFiles.length}):</div>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {inputMediaFiles.map(mf => (
                    <div key={mf.id} className="relative group aspect-square bg-muted rounded-md overflow-hidden border border-border/30">
                      {mf.file.type.startsWith('image/') ? <img src={mf.preview} alt={mf.file.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-xs p-2 text-center text-muted-foreground">{mf.file.name}</div> }
                      <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeFile(mf.id, 'input')}><X size={16} /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Include Output Sample Switch & Upload */}
            <div className="flex items-center space-x-2 pt-4">
              <Switch id="includeOutputSample" checked={includeOutputSample} onCheckedChange={setIncludeOutputSample} />
              <Label htmlFor="includeOutputSample" className="text-foreground">Include Output Sample(s)</Label>
            </div>
            {includeOutputSample && (
              <div className="space-y-4 pl-2 border-l-2 border-border/50 ml-2">
                <Label htmlFor="outputSampleFiles" className="text-muted-foreground block pt-2">Upload Output Samples</Label>
                <Input id="outputSampleFiles" type="file" accept="image/*,text/plain,.pdf" onChange={(e) => handleFileUploaderChange(e, 'output')} className="bg-card border-input text-muted-foreground file:text-primary file:font-semibold" multiple />
                {outputSampleFiles.length > 0 && <div className="text-sm text-muted-foreground">Previews ({outputSampleFiles.length}):</div>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {outputSampleFiles.map(mf => (
                    <div key={mf.id} className="relative group aspect-square bg-muted rounded-md overflow-hidden border border-border/30">
                      {mf.file.type.startsWith('image/') ? <img src={mf.preview} alt={mf.file.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-xs p-2 text-center text-muted-foreground">{mf.file.name}</div> }
                      <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeFile(mf.id, 'output')}><X size={16} /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Price and Royalty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground">Initial List Price (ETH)</Label>
                <Input id="price" name="price" type="number" min="0" step="0.001" placeholder="e.g., 0.01" value={formData.price} onChange={handleChange} className="bg-card border-input text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="royalty" className="text-foreground">Royalty Percentage (%)</Label>
                <Input id="royalty" name="royalty" type="number" min="0" max="20" step="0.1" placeholder="e.g., 10 for 10%" value={formData.royalty} onChange={handleChange} className="bg-card border-input text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            {/* Submit Button */}
            <div className="pt-6">
              <Button type="submit" className="w-full bg-gradient-button hover:bg-gradient-button-hover text-primary-foreground text-lg py-3 font-semibold" disabled={isSubmitting || !connectedAccount}>
                {isSubmitting ? "Processing Mint..." : (connectedAccount ? "Create & Mint NFT" : "Connect Wallet to Mint")}
              </Button>
            </div>
            {statusMessage && <p className="text-center text-sm text-muted-foreground mt-4">{statusMessage}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
