# AI Prompt NFT Marketplace

A fully decentralized marketplace for tokenizing, verifying, and trading unique AI-generated prompts as NFTs. This platform is built on a private Besu blockchain, ensuring secure ownership and monetization of intellectual property.

![Project Screenshot Placeholder](https://via.placeholder.com/800x450.png?text=AI+Prompt+NFT+Marketplace)
*(Replace this with a screenshot of your application's Hero section)*

---

## ✨ Key Features

-   **Mint Prompts as NFTs**: Turn your unique AI prompts into verifiable, ownable NFTs on the blockchain.
-   **Decentralized Marketplace**: Browse, buy, and sell prompt NFTs in a peer-to-peer marketplace.
-   **Creator Royalties**: Earn a percentage from every secondary sale of your minted prompts, powered by the EIP-2981 standard.
-   **Secure Ownership**: Leverage the power of the ERC721 standard to prove ownership of your digital assets.
-   **On-Chain Data**: All prompt metadata, sale status, and ownership history are stored transparently on-chain.
-   **IPFS Integration**: Prompt metadata and associated files are stored on the InterPlanetary File System (IPFS) for decentralized persistence.
-   **User Profiles**: View your collection of owned and created prompt NFTs.
-   **Private & Performant**: Built on a private Besu (Hyperledger) network for fast, low-cost transactions.

---

## 🛠️ Tech Stack

-   **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
-   **UI Components**: shadcn/ui
-   **Blockchain Interaction**: ethers.js
-   **Smart Contract**: Solidity, OpenZeppelin Contracts (ERC721, ERC721URIStorage, ERC721Royalty)
-   **Blockchain Network**: Besu (Hyperledger)
-   **Decentralized Storage**: IPFS
-   **Wallet**: MetaMask

---

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing.

### Prerequisites

-   **Node.js**: v18.x or later
-   **npm** or **yarn**
-   **MetaMask**: Browser extension installed and configured.
-   **Besu Node**: A running local or remote Besu node instance. [Besu Quickstart](https://besu.hyperledger.org/en/stable/public-networks/get-started/install-binary/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/prompt-verse.git
    cd prompt-verse
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add the following variables.

    ```env
    # The address of your deployed AIPromptNFT smart contract
    NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

    # The RPC endpoint for your Besu node
    NEXT_PUBLIC_BESU_RPC_URL=http://127.0.0.1:8545

    # Your IPFS service API keys (e.g., Pinata)
    NEXT_PUBLIC_PINATA_API_KEY=...
    NEXT_PUBLIC_PINATA_SECRET_API_KEY=...
    NEXT_PUBLIC_PINATA_GATEWAY_URL=https://gateway.pinata.cloud
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Access the application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser. Connect MetaMask to your configured Besu network to interact with the dApp.

---

## 📜 Smart Contract (`NFT.sol`)

The `AIPromptNFT.sol` contract is the backbone of the marketplace. It's an ERC721-compliant contract with extensions for royalties, metadata storage, and marketplace logic.

### Core Functions

-   `mintPrompt()`: Creates a new NFT for an AI prompt, storing its data and setting royalties.
-   `listForSale()`: Puts an owned NFT up for sale at a specified price.
-   `buyPrompt()`: Allows a user to purchase a listed NFT. This function handles the transfer of the NFT and the distribution of funds (to the seller, creator, and platform).
-   `delistFromSale()`: Removes an NFT from the marketplace.
-   `getTokensForSale()`: A view function that returns an array of all token IDs currently listed for sale.
-   `getTokensByOwner()`: Returns all tokens owned by a specific address.

### Deployment

The contract can be deployed to your Besu network using tools like Hardhat or Truffle. After deployment, update the `NEXT_PUBLIC_CONTRACT_ADDRESS` in your `.env.local` file.

---

## 📁 Project Structure

```
/src
├── app/                # Next.js App Router pages (UI routes)
│   ├── api/            # API routes for backend logic (e.g., IPFS uploads)
│   ├── create/         # Page for minting new prompts
│   ├── marketplace/    # Page for browsing and buying prompts
│   └── profile/        # User profile page
├── components/         # Reusable React components (Navbar, PromptCard, etc.)
├── hooks/              # Custom React hooks (e.g., useHeroStats)
├── lib/                # Core utilities, ABI definitions
│   └── abis/           # Smart contract ABI JSON files
├── utils/              # Helper functions for contract interaction, IPFS, etc.
└── NFT.sol             # The main Solidity smart contract
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
