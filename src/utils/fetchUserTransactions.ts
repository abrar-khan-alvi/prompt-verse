import { ethers } from 'ethers';

const CONTRACT_DEPLOY_BLOCK = 9710000;
const EVENT_QUERY_BATCH_SIZE = 2000;

// Helper to fetch events in chunks
async function fetchEventsInChunks(
  contract: ethers.Contract,
  eventFilter: any,
  fromBlock: number,
  toBlock: number
) {
  const allEvents: any[] = [];
  let currentFrom = fromBlock;

  while (currentFrom <= toBlock) {
    const currentTo = Math.min(currentFrom + EVENT_QUERY_BATCH_SIZE - 1, toBlock);
    try {
      const events = await contract.queryFilter(eventFilter, currentFrom, currentTo);
      allEvents.push(...events);
    } catch (error) {
      console.error(`Error fetching events from ${currentFrom} to ${currentTo}:`, error);
    }
    currentFrom = currentTo + 1;
  }
  return allEvents;
}

export async function fetchUserTransactions(
  contract: ethers.Contract,
  provider: ethers.Provider,
  userAddress: string
) {
  const currentBlock = await provider.getBlockNumber();
  const txList: any[] = [];

  try {
    // Fetch all relevant events
    const [mintedEvents, listedEvents, soldEvents, delistedEvents] = await Promise.all([
      fetchEventsInChunks(
        contract,
        contract.filters.PromptMinted(null, userAddress),
        CONTRACT_DEPLOY_BLOCK,
        currentBlock
      ),
      fetchEventsInChunks(
        contract,
        contract.filters.PromptListed(),
        CONTRACT_DEPLOY_BLOCK,
        currentBlock
      ),
      fetchEventsInChunks(
        contract,
        contract.filters.PromptSold(),
        CONTRACT_DEPLOY_BLOCK,
        currentBlock
      ),
      fetchEventsInChunks(
        contract,
        contract.filters.PromptDelisted(),
        CONTRACT_DEPLOY_BLOCK,
        currentBlock
      ),
    ]);

    // Process minted events
    for (const event of mintedEvents) {
      const block = await event.getBlock();
      txList.push({
        type: 'Mint',
        promptId: event.args?.tokenId?.toString(),
        promptTitle: `Prompt #${event.args?.tokenId?.toString()}`,
        from: null,
        to: userAddress,
        price: '-',
        date: new Date(block.timestamp * 1000),
        txHash: event.transactionHash,
      });
    }

    // Process listed events (filter by seller = userAddress)
    for (const event of listedEvents) {
      if (event.args?.seller?.toLowerCase() === userAddress.toLowerCase()) {
        const block = await event.getBlock();
        txList.push({
          type: 'Listed',
          promptId: event.args?.tokenId?.toString(),
          promptTitle: `Prompt #${event.args?.tokenId?.toString()}`,
          from: userAddress,
          to: null,
          price: ethers.formatEther(event.args?.price || 0),
          date: new Date(block.timestamp * 1000),
          txHash: event.transactionHash,
        });
      }
    }

    // Process sold events (filter by buyer or seller = userAddress)
    for (const event of soldEvents) {
      const isBuyer = event.args?.buyer?.toLowerCase() === userAddress.toLowerCase();
      const isSeller = event.args?.seller?.toLowerCase() === userAddress.toLowerCase();

      if (isBuyer || isSeller) {
        const block = await event.getBlock();
        txList.push({
          type: isBuyer ? 'Purchase' : 'Sale',
          promptId: event.args?.tokenId?.toString(),
          promptTitle: `Prompt #${event.args?.tokenId?.toString()}`,
          from: event.args?.seller,
          to: event.args?.buyer,
          price: ethers.formatEther(event.args?.price || 0),
          date: new Date(block.timestamp * 1000),
          txHash: event.transactionHash,
        });
      }
    }

    // Process delisted events (filter by seller = userAddress)
    for (const event of delistedEvents) {
      if (event.args?.seller?.toLowerCase() === userAddress.toLowerCase()) {
        const block = await event.getBlock();
        txList.push({
          type: 'Delisted',
          promptId: event.args?.tokenId?.toString(),
          promptTitle: `Prompt #${event.args?.tokenId?.toString()}`,
          from: userAddress,
          to: null,
          price: '-',
          date: new Date(block.timestamp * 1000),
          txHash: event.transactionHash,
        });
      }
    }

    // Sort by date descending
    txList.sort((a, b) => b.date.getTime() - a.date.getTime());
    return txList;
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
}
