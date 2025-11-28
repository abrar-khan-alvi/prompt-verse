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

## 📁 Project Structure

```
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
