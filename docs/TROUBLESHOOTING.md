# Troubleshooting Guide

## Common Issues and Solutions

### Wallet Connection Issues

#### MetaMask Not Detected

**Problem**: "No crypto wallet found" error

**Solutions**:

1. Install MetaMask browser extension
2. Refresh the page after installation
3. Check if MetaMask is enabled for the site
4. Try a different browser

#### Wrong Network

**Problem**: "Please switch to the correct network"

**Solutions**:

1. Open MetaMask
2. Click network dropdown
3. Select "Sepolia Test Network"
4. If not available, add custom network:
   - Network Name: Sepolia
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_KEY`
   - Chain ID: 11155111
   - Currency Symbol: ETH
   - Block Explorer: `https://sepolia.etherscan.io`

#### Transaction Rejected

**Problem**: Transaction fails or is rejected

**Solutions**:

1. Check you have enough ETH for gas fees
2. Increase gas limit in MetaMask
3. Wait for network congestion to clear
4. Try again with higher gas price

---

### IPFS Upload Issues

#### Upload Timeout

**Problem**: File upload takes too long or times out

**Solutions**:

1. Reduce file size (compress images/videos)
2. Upload fewer files at once
3. Check internet connection
4. Try again during off-peak hours

#### Invalid CID Error

**Problem**: "Invalid IPFS CID" error

**Solutions**:

1. Verify file uploaded successfully
2. Check Pinata dashboard for upload status
3. Retry upload if failed
4. Contact support if persistent

#### Gateway Not Responding

**Problem**: Cannot fetch metadata from IPFS

**Solutions**:

1. Try alternative gateway (Cloudflare, IPFS.io)
2. Wait a few minutes for propagation
3. Check if Pinata service is operational
4. Verify CID is correct

---

### Smart Contract Errors

#### "Not token owner"

**Problem**: Cannot list/delist NFT

**Solution**: Ensure you're connected with the wallet that owns the NFT

#### "Already listed"

**Problem**: Cannot list NFT that's already for sale

**Solution**: Delist the NFT first, then list again with new price

#### "Insufficient funds"

**Problem**: Not enough ETH for transaction

**Solutions**:

1. Get test ETH from Sepolia faucet
2. Check gas estimation
3. Reduce transaction amount

#### "Execution reverted"

**Problem**: Generic contract error

**Solutions**:

1. Check transaction parameters
2. Verify contract is not paused
3. Ensure you meet all requirements
4. Check console for detailed error

---

### Build and Development Issues

#### Build Fails

**Problem**: `npm run build` fails

**Solutions**:

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

#### Port Already in Use

**Problem**: "Port 3002 is already in use"

**Solutions**:

```bash
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3002 | xargs kill -9
```

#### TypeScript Errors

**Problem**: Type errors during development

**Solutions**:

1. Run `npm install` to ensure types are installed
2. Restart TypeScript server in VS Code
3. Check `tsconfig.json` configuration
4. Clear TypeScript cache: Delete `.next` folder

---

### Environment Configuration

#### Missing Environment Variables

**Problem**: "Missing required environment variables"

**Solution**: Create `.env.local` with required variables:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PINATA_JWT=your_jwt
NEXT_PUBLIC_PINATA_GATEWAY=https://...
```

#### Contract Address Not Set

**Problem**: Contract interactions fail

**Solution**: Verify contract address in `.env.local` matches deployed contract

---

### Performance Issues

#### Slow Page Load

**Solutions**:

1. Clear browser cache
2. Disable browser extensions
3. Check network connection
4. Use production build (`npm run build && npm start`)

#### High Gas Fees

**Solutions**:

1. Wait for lower network congestion
2. Use gas price tracker (etherscan.io/gastracker)
3. Adjust gas settings in MetaMask
4. Consider using Layer 2 solutions (future)

---

### Data Not Loading

#### NFTs Not Showing

**Solutions**:

1. Check wallet connection
2. Verify you're on correct network
3. Clear React Query cache (refresh page)
4. Check browser console for errors

#### Stats Not Updating

**Solutions**:

1. Wait for blockchain confirmation
2. Refresh the page
3. Check if contract events are indexed
4. Verify RPC provider is responding

---

### API Errors

#### Rate Limit Exceeded

**Problem**: "429 Too Many Requests"

**Solution**: Wait 1 minute before retrying

#### CORS Error

**Problem**: Cross-origin request blocked

**Solutions**:

1. Ensure using correct domain
2. Check API route configuration
3. Verify origin is allowed

#### 500 Internal Server Error

**Solutions**:

1. Check server logs
2. Verify environment variables
3. Check Pinata API status
4. Retry request

---

## Debugging Tips

### Enable Debug Logging

Add to `.env.local`:

```env
NODE_ENV=development
```

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### Verify Contract State

Use Etherscan to check:

1. Contract is deployed
2. Transaction status
3. Event logs
4. Contract state

### Test with Hardhat

```bash
# Start local node
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.cjs --network localhost

# Update .env.local with local contract address
```

---

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Check documentation
4. Try on different browser/device

### When Reporting Issues

Include:

1. Error message (full text)
2. Steps to reproduce
3. Browser and version
4. Network (Sepolia, localhost, etc.)
5. Transaction hash (if applicable)
6. Screenshots

### Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Community support
- **Documentation**: README and docs folder

---

## Preventive Measures

### Regular Maintenance

```bash
# Update dependencies
npm update

# Clear caches
rm -rf .next node_modules/.cache

# Reinstall
npm install
```

### Best Practices

1. Always test on testnet first
2. Keep private keys secure
3. Backup important data
4. Monitor gas prices
5. Use latest browser version
6. Keep MetaMask updated

---

## Emergency Procedures

### Contract Paused

If contract is paused by owner:

1. Wait for announcement
2. Check official channels
3. Do not attempt transactions

### Lost Access to Wallet

1. Use seed phrase to recover
2. Import into new MetaMask
3. Never share seed phrase

### Suspicious Activity

1. Disconnect wallet immediately
2. Check transaction history
3. Report to team
4. Consider moving assets

---

## Useful Links

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [MetaMask Support](https://support.metamask.io/)
- [Pinata Docs](https://docs.pinata.cloud/)
- [Next.js Docs](https://nextjs.org/docs)
