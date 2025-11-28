# API Documentation

## Overview

PromptVerse provides two main API routes for IPFS file and metadata uploads. All routes require proper authentication and are rate-limited.

## Base URL

```
Development: http://localhost:3002/api
Production: https://your-domain.com/api
```

## Authentication

Currently, API routes are public but rate-limited. Future versions will implement API key authentication.

## Rate Limiting

- **Per Minute**: 60 requests
- **Per Hour**: 1000 requests
- **Response**: `429 Too Many Requests` when exceeded

---

## Endpoints

### Upload File to IPFS

Upload a single file to IPFS via Pinata.

**Endpoint**: `POST /api/uploadFile`

**Content-Type**: `multipart/form-data`

**Request Body**:

```typescript
{
  file: File; // The file to upload
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "cid": "QmX...", // IPFS CID
  "url": "https://gateway.pinata.cloud/ipfs/QmX..."
}
```

**Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "No file provided"
}
```

**Response** (429 Too Many Requests):

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

**Example Usage**:

```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/uploadFile', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
if (result.success) {
  console.log('File CID:', result.cid);
}
```

---

### Upload Metadata to IPFS

Upload JSON metadata to IPFS via Pinata.

**Endpoint**: `POST /api/uploadMetadata`

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "name": "Epic Space Battle Prompt",
  "description": "A detailed prompt for generating...",
  "platform": "Midjourney",
  "prompt_text": "Your actual AI prompt...",
  "image": "ipfs://QmX...", // Optional
  "input_media_uris": ["ipfs://QmY..."], // Optional
  "output_sample_uris": ["ipfs://QmZ..."], // Optional
  "attributes": [
    {
      "trait_type": "AI Platform",
      "value": "Midjourney"
    }
  ]
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "cid": "QmABC...",
  "url": "https://gateway.pinata.cloud/ipfs/QmABC..."
}
```

**Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Invalid metadata format"
}
```

**Example Usage**:

```typescript
const metadata = {
  name: 'My Prompt',
  description: 'Description here',
  platform: 'OpenAI',
  prompt_text: 'Prompt text here',
  attributes: [{ trait_type: 'AI Platform', value: 'OpenAI' }],
};

const response = await fetch('/api/uploadMetadata', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(metadata),
});

const result = await response.json();
if (result.success) {
  const tokenURI = `ipfs://${result.cid}`;
}
```

---

## Smart Contract Interaction

### Contract ABI

The contract ABI is available at `src/lib/abis/AIPromptNFT.json`.

### Contract Address

Set via environment variable:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### Key Functions

#### mintPrompt

Mint a new prompt NFT.

```solidity
function mintPrompt(
    string memory title,
    string memory platform,
    string memory description,
    string memory promptText,
    string memory tokenURI_,
    uint256 price,
    uint96 royaltyPercent,
    bool includeMedia,
    bool includeOutputSample
) external payable nonReentrant whenNotPaused
```

**TypeScript Usage**:

```typescript
import { mintPromptNFT } from '@/utils/contractInteraction';

const result = await mintPromptNFT(
  'My Prompt', // title
  'OpenAI', // platform
  'Description', // description
  'Prompt text', // promptText
  'ipfs://QmX...', // tokenURI
  '0.01', // price in ETH
  10, // royalty percentage
  false, // includeMedia
  false // includeOutputSample
);

console.log('Token ID:', result.tokenId);
```

#### buyPrompt

Purchase an NFT listed for sale.

```solidity
function buyPrompt(uint256 tokenId)
    external
    payable
    nonReentrant
    whenNotPaused
```

**TypeScript Usage**:

```typescript
import { buyNFT } from '@/utils/contractInteraction';

await buyNFT(
  '123', // tokenId
  '0.01' // price in ETH
);
```

#### listForSale

List an NFT for sale.

```solidity
function listForSale(uint256 tokenId, uint256 price)
    external
    onlyTokenOwner(tokenId)
    whenNotPaused
```

**TypeScript Usage**:

```typescript
import { listNFTForSale } from '@/utils/contractInteraction';

await listNFTForSale(
  '123', // tokenId
  '0.05' // price in ETH
);
```

#### delistFromSale

Remove an NFT from sale.

```solidity
function delistFromSale(uint256 tokenId)
    external
    onlyTokenOwner(tokenId)
    whenNotPaused
```

---

## Events

### PromptMinted

Emitted when a new prompt is minted.

```solidity
event PromptMinted(
    uint256 indexed tokenId,
    address indexed creator,
    string title,
    string platform,
    uint256 price,
    string tokenURI
);
```

### PromptListed

Emitted when a prompt is listed for sale.

```solidity
event PromptListed(
    uint256 indexed tokenId,
    address indexed seller,
    uint256 price
);
```

### PromptSold

Emitted when a prompt is sold.

```solidity
event PromptSold(
    uint256 indexed tokenId,
    address indexed seller,
    address indexed buyer,
    uint256 price
);
```

### PromptDelisted

Emitted when a prompt is removed from sale.

```solidity
event PromptDelisted(
    uint256 indexed tokenId,
    address indexed seller
);
```

---

## Error Codes

| Code | Message               | Description                                  |
| ---- | --------------------- | -------------------------------------------- |
| 400  | Bad Request           | Invalid request format or missing parameters |
| 403  | Forbidden             | CORS violation or unauthorized origin        |
| 405  | Method Not Allowed    | HTTP method not supported for this endpoint  |
| 429  | Too Many Requests     | Rate limit exceeded                          |
| 500  | Internal Server Error | Server-side error occurred                   |

---

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```typescript
try {
  const result = await fetch('/api/uploadFile', {
    method: 'POST',
    body: formData,
  });

  const data = await result.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  // Handle success
} catch (error) {
  console.error('Upload failed:', error);
  // Show user-friendly error message
}
```

### 2. File Validation

Validate files before uploading:

```typescript
import { validateFiles, FILE_TYPES } from '@/utils/validation';

const validation = validateFiles(files, {
  allowedTypes: FILE_TYPES.IMAGES,
  maxSizeMB: 10,
  maxFiles: 5,
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  return;
}
```

### 3. Retry Logic

Implement retry logic for failed requests:

```typescript
import { retryWithBackoff } from '@/utils/blockchain';

const result = await retryWithBackoff(
  () => fetch('/api/uploadFile', { method: 'POST', body: formData }),
  3, // max retries
  1000 // initial delay
);
```

### 4. Progress Tracking

Show upload progress to users:

```typescript
const [progress, setProgress] = useState(0);

// Use XMLHttpRequest for progress tracking
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    setProgress((e.loaded / e.total) * 100);
  }
});
```

---

## Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

---

## Support

For API support, please:

1. Check the [troubleshooting guide](./TROUBLESHOOTING.md)
2. Open an issue on GitHub
3. Join our Discord community
