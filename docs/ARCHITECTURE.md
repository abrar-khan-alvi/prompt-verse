# PromptVerse Architecture

## System Overview

PromptVerse is a decentralized NFT marketplace for AI prompts built on Ethereum. The application follows a modern web3 architecture with Next.js frontend and smart contract backend.

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        RQ[React Query Cache]
        WC[Wallet Connector]
    end

    subgraph "API Layer"
        API[Next.js API Routes]
        IPFS_API[IPFS Upload API]
    end

    subgraph "Blockchain Layer"
        ETH[Ethers.js]
        SC[Smart Contract]
    end

    subgraph "Storage"
        IPFS[IPFS/Pinata]
    end

    UI --> RQ
    UI --> WC
    UI --> API
    WC --> ETH
    ETH --> SC
    API --> IPFS_API
    IPFS_API --> IPFS
    SC -.reads.-> IPFS

    style UI fill:#e1f5ff
    style SC fill:#ffe1e1
    style IPFS fill:#e1ffe1
```

## Component Architecture

```mermaid
graph LR
    subgraph "Pages"
        Home[Home Page]
        Market[Marketplace]
        Create[Create Prompt]
        Profile[Profile]
        Detail[Prompt Detail]
    end

    subgraph "Shared Components"
        Nav[Navbar]
        Footer[Footer]
        Card[PromptCard]
        Wallet[WalletButton]
    end

    subgraph "UI Components"
        Button[Button]
        Input[Input]
        Dialog[Dialog]
        Toast[Toast]
    end

    subgraph "Utilities"
        Contract[Contract Utils]
        IPFS_U[IPFS Utils]
        Format[Formatting]
        Valid[Validation]
    end

    Home --> Nav
    Home --> Card
    Market --> Card
    Create --> Wallet
    Profile --> Card

    Card --> Button
    Wallet --> Dialog

    Create --> Contract
    Market --> Contract
    Contract --> IPFS_U

    style Home fill:#e1f5ff
    style Contract fill:#ffe1e1
```

## Data Flow

### Minting Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI Form
    participant API as API Route
    participant IPFS as IPFS/Pinata
    participant W as Wallet
    participant SC as Smart Contract

    U->>UI: Fill form & upload files
    UI->>API: POST /api/uploadFile
    API->>IPFS: Upload media files
    IPFS-->>API: Return CIDs
    API-->>UI: Return CIDs

    UI->>API: POST /api/uploadMetadata
    API->>IPFS: Upload metadata JSON
    IPFS-->>API: Return metadata CID
    API-->>UI: Return tokenURI

    UI->>W: Request signature
    W->>SC: mintPrompt(data, tokenURI)
    SC-->>W: Transaction hash
    W-->>UI: Confirmation
    UI->>U: Success message
```

### Purchase Flow

```mermaid
sequenceDiagram
    participant B as Buyer
    participant UI as UI
    participant W as Wallet
    participant SC as Smart Contract
    participant S as Seller
    participant C as Creator
    participant P as Platform

    B->>UI: Click "Buy"
    UI->>W: Request payment
    W->>SC: buyPrompt(tokenId) + ETH

    SC->>SC: Calculate fees
    SC->>C: Transfer royalty
    SC->>P: Transfer platform fee
    SC->>S: Transfer seller amount
    SC->>B: Transfer NFT ownership

    SC-->>W: Transaction receipt
    W-->>UI: Success
    UI->>B: Show confirmation
```

## Smart Contract Architecture

```mermaid
classDiagram
    class AIPromptNFT {
        +uint256 platformFeePercent
        +address feeRecipient
        +mapping prompts
        +mapping sales
        +mintPrompt()
        +listForSale()
        +buyPrompt()
        +delistFromSale()
    }

    class ERC721 {
        +balanceOf()
        +ownerOf()
        +transferFrom()
    }

    class ERC721URIStorage {
        +tokenURI()
        +_setTokenURI()
    }

    class ERC721Royalty {
        +royaltyInfo()
        +_setTokenRoyalty()
    }

    class Ownable {
        +owner()
        +transferOwnership()
    }

    class ReentrancyGuard {
        +nonReentrant()
    }

    class Pausable {
        +pause()
        +unpause()
    }

    AIPromptNFT --|> ERC721
    AIPromptNFT --|> ERC721URIStorage
    AIPromptNFT --|> ERC721Royalty
    AIPromptNFT --|> Ownable
    AIPromptNFT --|> ReentrancyGuard
    AIPromptNFT --|> Pausable
```

## State Management

```mermaid
graph TB
    subgraph "React Query Cache"
        NFT[NFT Details]
        Market[Marketplace NFTs]
        User[User NFTs]
        Stats[Hero Stats]
        Tx[Transactions]
    end

    subgraph "Local State"
        Wallet[Wallet State]
        Form[Form State]
        UI_State[UI State]
    end

    subgraph "Blockchain State"
        Contract[Contract Data]
        Events[Contract Events]
    end

    Contract --> NFT
    Contract --> Market
    Events --> Tx

    NFT --> UI_State
    Market --> UI_State
    Wallet --> UI_State

    style NFT fill:#e1f5ff
    style Contract fill:#ffe1e1
```

## Security Layers

```mermaid
graph TB
    Request[Incoming Request]

    Request --> RateLimit{Rate Limit}
    RateLimit -->|Exceeded| Reject[429 Response]
    RateLimit -->|OK| CORS{CORS Check}

    CORS -->|Invalid| Reject2[403 Response]
    CORS -->|Valid| Method{Method Check}

    Method -->|Invalid| Reject3[405 Response]
    Method -->|Valid| Validate{Input Validation}

    Validate -->|Invalid| Reject4[400 Response]
    Validate -->|Valid| Sanitize[Sanitize Input]

    Sanitize --> Process[Process Request]
    Process --> Headers[Add Security Headers]
    Headers --> Response[Send Response]

    style Request fill:#e1f5ff
    style Process fill:#e1ffe1
    style Reject fill:#ffe1e1
    style Reject2 fill:#ffe1e1
    style Reject3 fill:#ffe1e1
    style Reject4 fill:#ffe1e1
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production"
        Vercel[Vercel Edge Network]
        API_Routes[API Routes]
    end

    subgraph "Blockchain"
        Sepolia[Sepolia Testnet]
        Contract[Deployed Contract]
    end

    subgraph "Storage"
        Pinata[Pinata IPFS]
    end

    subgraph "Services"
        Alchemy[Alchemy RPC]
    end

    User[Users] --> Vercel
    Vercel --> API_Routes
    API_Routes --> Pinata

    Vercel --> Alchemy
    Alchemy --> Sepolia
    Sepolia --> Contract

    Contract -.metadata.-> Pinata

    style Vercel fill:#e1f5ff
    style Contract fill:#ffe1e1
    style Pinata fill:#e1ffe1
```

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Query
- **Web3**: Ethers.js v6

### Backend

- **API**: Next.js API Routes
- **Smart Contracts**: Solidity 0.8.20
- **Development**: Hardhat
- **Storage**: IPFS via Pinata

### Infrastructure

- **Hosting**: Vercel
- **Blockchain**: Ethereum (Sepolia Testnet)
- **RPC Provider**: Alchemy
- **IPFS Gateway**: Pinata

## Key Design Decisions

### 1. React Query for Caching

- Reduces blockchain RPC calls
- Automatic background refetching
- Optimistic updates for better UX

### 2. IPFS for Metadata

- Decentralized storage
- Permanent content addressing
- Reduced on-chain storage costs

### 3. ERC-721 with Extensions

- Standard NFT compatibility
- Built-in royalty support (ERC-2981)
- URI storage for metadata

### 4. Pausable Contract

- Emergency stop mechanism
- Owner can pause trading
- Security best practice

### 5. ReentrancyGuard

- Prevents reentrancy attacks
- Protects payment distribution
- Critical for financial operations

## Performance Optimizations

1. **React Query Caching**: Reduces redundant blockchain calls
2. **Lazy Loading**: Components load on demand
3. **Image Optimization**: Next.js Image component
4. **Code Splitting**: Automatic route-based splitting
5. **Batch Event Queries**: Reduces RPC calls for historical data

## Security Measures

1. **Input Validation**: Zod schemas for all forms
2. **XSS Prevention**: Input sanitization
3. **Rate Limiting**: API route protection
4. **CORS**: Origin validation
5. **CSP Headers**: Content Security Policy
6. **Smart Contract Auditing**: OpenZeppelin libraries

## Scalability Considerations

### Current Limitations

- Event queries scale linearly with token count
- In-memory rate limiting (not distributed)
- Client-side caching only

### Future Improvements

- Implement subgraph for event indexing
- Use Redis for distributed rate limiting
- Add server-side caching layer
- Implement pagination for large collections
