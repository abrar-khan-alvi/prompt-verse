import { ethers } from 'ethers';
import AIPromptNFTAbiFile from '@/lib/abis/AIPromptNFT.json';
import { getCurrentAccount } from './web3';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// Helper to get contract instance
export const getContract = async (withSigner = false) => {
  if (!window.ethereum) throw new Error('No crypto wallet found');

  const provider = new ethers.BrowserProvider(window.ethereum);

  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, signer);
  }

  return new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, provider);
};

// Mint a new Prompt NFT
export const mintPromptNFT = async (
  title: string,
  platform: string,
  description: string,
  promptText: string,
  tokenURI: string,
  priceEth: string,
  royaltyPercent: number,
  includeMedia: boolean,
  includeOutputSample: boolean
) => {
  try {
    const contract = await getContract(true);
    const priceWei = ethers.parseEther(priceEth || '0');
    const royaltyBasisPoints = Math.floor(royaltyPercent * 100);

    console.log('Minting with:', { title, platform, priceWei, royaltyBasisPoints });

    const tx = await contract.mintPrompt(
      title,
      platform,
      description,
      promptText,
      tokenURI,
      priceWei,
      royaltyBasisPoints,
      includeMedia,
      includeOutputSample
    );

    console.log('Mint tx sent:', tx.hash);
    const receipt = await tx.wait();

    // Find Token ID from events
    let tokenId = null;
    if (receipt.logs) {
      const iface = new ethers.Interface(AIPromptNFTAbiFile.abi);
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === 'PromptMinted') {
            tokenId = parsed.args.tokenId.toString();
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId,
    };
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    throw error;
  }
};

// List NFT for sale
export const listNFTForSale = async (tokenId: string, priceEth: string) => {
  try {
    const contract = await getContract(true);
    const priceWei = ethers.parseEther(priceEth);

    const tx = await contract.listForSale(tokenId, priceWei);
    await tx.wait();

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error('Error listing NFT:', error);
    throw error;
  }
};

// Buy NFT
export const buyNFT = async (tokenId: string, priceEth: string) => {
  try {
    const contract = await getContract(true);
    const priceWei = ethers.parseEther(priceEth);

    const tx = await contract.buyPrompt(tokenId, { value: priceWei });
    await tx.wait();

    return { success: true, transactionHash: tx.hash };
  } catch (error) {
    console.error('Error buying NFT:', error);
    throw error;
  }
};

// Get single NFT details
export const getNFTDetails = async (tokenId: string) => {
  try {
    const contract = await getContract(false);

    const [promptData, saleData, tokenURI, owner] = await Promise.all([
      contract.getPromptData(tokenId),
      contract.getSaleData(tokenId),
      contract.tokenURI(tokenId),
      contract.ownerOf(tokenId),
    ]);

    let metadata = {};
    try {
      if (tokenURI) {
        // Handle IPFS gateway
        const gatewayUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        const response = await fetch(gatewayUrl);
        metadata = await response.json();
      }
    } catch (e) {
      console.error('Error fetching metadata:', e);
    }

    return {
      tokenId,
      title_onchain: promptData.title,
      platform: promptData.platform,
      description_onchain: promptData.description,
      promptText_onchain: promptData.promptText,
      creator_onchain: promptData.creator,
      currentOwner_onchain: owner,
      createdAt: Number(promptData.createdAt) * 1000, // Convert to ms
      price_onchain: saleData.isForSale ? ethers.formatEther(saleData.price) : null,
      isForSale_onchain: saleData.isForSale,
      seller: saleData.seller,
      tokenURI,
      includeMedia: promptData.includeMedia,
      includeOutputSample: promptData.includeOutputSample,
      // Metadata fields
      metadataTitle: (metadata as any).title,
      metadataDescription: (metadata as any).description,
      metadataImage: (metadata as any).image?.replace(
        'ipfs://',
        'https://gateway.pinata.cloud/ipfs/'
      ),
      metadataPromptText: (metadata as any).promptText,
      metadataInputMediaURIs: (metadata as any).inputMediaURIs?.map((uri: string) =>
        uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
      ),
      metadataOutputSampleURIs: (metadata as any).outputSampleURIs?.map((uri: string) =>
        uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
      ),
    };
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    throw error;
  }
};

// Get NFTs for a specific user (created and owned)
export const getUserNFTs = async (address: string) => {
  try {
    const contract = await getContract(false);

    // Get Created
    const createdIds = await contract.getTokensByCreator(address);
    // Get Owned
    const ownedIds = await contract.getTokensByOwner(address);

    // Combine and deduplicate
    const allIds = Array.from(new Set([...createdIds, ...ownedIds].map((id) => id.toString())));

    // Fetch details for all
    const nfts = await Promise.all(allIds.map((id) => getNFTDetails(id)));

    return nfts;
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    return [];
  }
};

// Get Marketplace NFTs (all for sale)
export const getMarketplaceNFTs = async () => {
  try {
    const contract = await getContract(false);
    const idsForSale = await contract.getTokensForSale();

    const nfts = await Promise.all(idsForSale.map((id: any) => getNFTDetails(id.toString())));
    return nfts;
  } catch (error) {
    console.error('Error fetching marketplace NFTs:', error);
    return [];
  }
};

export default {
  mintPromptNFT,
  listNFTForSale,
  buyNFT,
  getNFTDetails,
  getUserNFTs,
  getMarketplaceNFTs,
};
