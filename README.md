<<<<<<< HEAD
# PromptVerse - AI Prompt NFT Marketplace

A decentralized marketplace for tokenizing, trading, and monetizing AI prompts as NFTs on the Ethereum blockchain.

## 🌟 Features

- **Mint AI Prompts as NFTs**: Convert your valuable AI prompts into tradeable NFTs
- **Decentralized Marketplace**: Buy and sell prompt NFTs with built-in royalties
- **IPFS Storage**: Secure, permanent storage for prompt metadata and media
- **Smart Contract Powered**: ERC-721 compliant with marketplace functionality
- **Royalty System**: Creators earn royalties on secondary sales
- **Multi-Platform Support**: Works with OpenAI, Midjourney, Stable Diffusion, and more

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or another Web3 wallet
- Pinata account for IPFS storage (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/prompt-verse.git
   cd prompt-verse
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Contract Configuration
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress

   # IPFS/Pinata Configuration
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
   NEXT_PUBLIC_PINATA_GATEWAY=https://your-gateway.mypinata.cloud/ipfs/

   # Optional: RPC URLs
   NEXT_PUBLIC_BESU_RPC_URL=http://localhost:8545
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   ALCHEMY_API_KEY=your_alchemy_api_key

   # Optional: Deployment
   PRIVATE_KEY=your_private_key_for_deployment
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3002](http://localhost:3002)
=======
# AI Prompt NFT Marketplace

A fully decentralized marketplace for tokenizing, verifying, and trading unique AI-generated prompts as NFTs. This platform is built on a private Besu blockchain, ensuring secure ownership and monetization of intellectual property.

![Project Screenshot Placeholder](https://github.com/abrar-khan-alvi/prompt-verse/blob/main/Screenshot%20(76).png)
![Project Screenshot Placeholder](https://github.com/abrar-khan-alvi/prompt-verse/blob/main/Screenshot%20(78).png)
![Project Screenshot Placeholder](https://github.com/abrar-khan-alvi/prompt-verse/blob/main/Screenshot%20(79).png)
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
>>>>>>> 715c4d957aaaefebbcc165b3b43339a9b18cad89

## 📁 Project Structure

```
<<<<<<< HEAD
prompt-verse/
├── contracts/              # Solidity smart contracts
│   └── NFT.sol            # Main AIPromptNFT contract
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/          # API routes (IPFS upload)
│   │   ├── create/       # Create prompt page
│   │   ├── marketplace/  # Marketplace page
│   │   ├── profile/      # User profile page
│   │   └── prompt/       # Individual prompt page
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSkeletons.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core utilities
│   │   ├── env.ts        # Environment validation
│   │   └── types.ts      # TypeScript types
│   └── utils/            # Utility functions
│       ├── contractInteraction.ts
│       ├── formatting.ts
│       ├── ipfs.ts
│       └── validation.ts
├── scripts/              # Deployment scripts
└── hardhat.config.cjs    # Hardhat configuration
```

## 🔧 Smart Contract Deployment

### Deploy to Sepolia Testnet

1. **Compile the contract**

   ```bash
   npx hardhat compile
   ```

2. **Deploy to Sepolia**

   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Update `.env.local`** with the deployed contract address

### Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS "PromptVerse" "PROMPT" YOUR_FEE_RECIPIENT_ADDRESS
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Format code
npx prettier --write .
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Blockchain**: Ethers.js v6, Hardhat
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin
- **Storage**: IPFS via Pinata
- **Validation**: Zod
- **State Management**: React hooks

## 📝 Environment Variables

| Variable                       | Required | Description                         |
| ------------------------------ | -------- | ----------------------------------- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | ✅       | Deployed smart contract address     |
| `NEXT_PUBLIC_PINATA_JWT`       | ✅       | Pinata JWT for IPFS uploads         |
| `NEXT_PUBLIC_PINATA_GATEWAY`   | ✅       | Your Pinata gateway URL             |
| `NEXT_PUBLIC_BESU_RPC_URL`     | ❌       | Local blockchain RPC URL            |
| `SEPOLIA_RPC_URL`              | ❌       | Sepolia testnet RPC URL             |
| `ALCHEMY_API_KEY`              | ❌       | Alchemy API key                     |
| `PRIVATE_KEY`                  | ❌       | Private key for contract deployment |

## 🎨 Key Features Explained

### Minting Prompts

Users can mint their AI prompts as NFTs with:

- Title and description
- AI platform specification
- Optional input media files
- Optional output samples
- Initial listing price
- Royalty percentage (0-20%)

### Marketplace

- Browse all listed prompts
- Filter and search (coming soon)
- Buy prompts with ETH
- Automatic royalty distribution

### Profile

- View created prompts
- View owned prompts
- Transaction history
- Wallet integration

## 🔒 Security

- Input validation and sanitization
- Error boundaries for graceful error handling
- Environment variable validation
- Smart contract security features:
  - ReentrancyGuard
  - Pausable functionality
  - Access control
  - Royalty enforcement

## 🚧 Roadmap

- [ ] Add comprehensive test coverage
- [ ] Implement search and filtering
- [ ] Add categories and tags
- [ ] User profile customization
- [ ] Batch minting
- [ ] Auction functionality
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for smart contract libraries
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Pinata](https://pinata.cloud/) for IPFS infrastructure
- [Ethers.js](https://docs.ethers.org/) for Ethereum interactions

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ for the AI and Web3 community
=======
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
>>>>>>> 715c4d957aaaefebbcc165b3b43339a9b18cad89
