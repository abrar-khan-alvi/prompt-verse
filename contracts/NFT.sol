// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AIPromptNFT is ERC721, ERC721URIStorage, ERC721Royalty, Ownable, ReentrancyGuard, Pausable {
    
    uint256 private _tokenIdCounter;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeePercent = 250;
    address public feeRecipient;
    
    // Mapping from token ID to prompt data
    mapping(uint256 => PromptData) public prompts;
    
    // Mapping from token ID to sale data
    mapping(uint256 => SaleData) public sales;
    
    // Mapping to track if a prompt hash already exists (prevent duplicates)
    mapping(bytes32 => bool) public promptExists;
    
    struct PromptData {
        string title;
        string platform;
        string description;
        string promptText;
        address creator;
        uint256 createdAt;
        bool includeMedia;
        bool includeOutputSample;
        bytes32 promptHash;
    }
    
    struct SaleData {
        uint256 price;
        bool isForSale;
        address seller;
    }
    
    event PromptMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        string platform,
        uint256 price,
        string tokenURI
    );
    
    event PromptListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    event PromptSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    event PromptDelisted(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    constructor(
        string memory name,
        string memory symbol,
        address _feeRecipient
    ) ERC721(name, symbol) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }
    
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }
    
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
    ) external payable nonReentrant whenNotPaused {
        // Create hash of prompt text to check for duplicates
        bytes32 promptHash = keccak256(abi.encodePacked(promptText, msg.sender));
        require(!promptExists[promptHash], "Prompt already exists");
        
        // Validate royalty percentage (max 20%)
        require(royaltyPercent <= 2000, "Royalty too high"); // 2000 basis points = 20%
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint the NFT
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        // Set royalty info
        _setTokenRoyalty(tokenId, msg.sender, royaltyPercent);
        
        // Store prompt data
        prompts[tokenId] = PromptData({
            title: title,
            platform: platform,
            description: description,
            promptText: promptText,
            creator: msg.sender,
            createdAt: block.timestamp,
            includeMedia: includeMedia,
            includeOutputSample: includeOutputSample,
            promptHash: promptHash
        });
        
        // Mark prompt hash as existing
        promptExists[promptHash] = true;
        
        // If price is set, list for sale immediately
        if (price > 0) {
            sales[tokenId] = SaleData({
                price: price,
                isForSale: true,
                seller: msg.sender
            });
            
            emit PromptListed(tokenId, msg.sender, price);
        }
        
        emit PromptMinted(tokenId, msg.sender, title, platform, price, tokenURI_);
    }
    
    function listForSale(uint256 tokenId, uint256 price) 
        external 
        onlyTokenOwner(tokenId) 
        whenNotPaused 
    {
        require(price > 0, "Price must be greater than 0");
        require(!sales[tokenId].isForSale, "Already listed");
        
        sales[tokenId] = SaleData({
            price: price,
            isForSale: true,
            seller: msg.sender
        });
        
        emit PromptListed(tokenId, msg.sender, price);
    }
    
    function updatePrice(uint256 tokenId, uint256 newPrice) 
        external 
        onlyTokenOwner(tokenId) 
        whenNotPaused 
    {
        require(sales[tokenId].isForSale, "Not listed for sale");
        require(newPrice > 0, "Price must be greater than 0");
        
        sales[tokenId].price = newPrice;
        emit PromptListed(tokenId, msg.sender, newPrice);
    }
    
    function delistFromSale(uint256 tokenId) 
        external 
        onlyTokenOwner(tokenId) 
        whenNotPaused 
    {
        require(sales[tokenId].isForSale, "Not listed for sale");
        
        sales[tokenId].isForSale = false;
        sales[tokenId].price = 0;
        
        emit PromptDelisted(tokenId, msg.sender);
    }
    
    function buyPrompt(uint256 tokenId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        SaleData memory sale = sales[tokenId];
        require(sale.isForSale, "Not for sale");
        require(msg.value >= sale.price, "Insufficient payment");
        require(msg.sender != sale.seller, "Cannot buy own NFT");
        
        address seller = sale.seller;
        uint256 price = sale.price;
        
        // Remove from sale
        sales[tokenId].isForSale = false;
        sales[tokenId].price = 0;
        
        // Calculate fees
        (address royaltyRecipient, uint256 royaltyAmount) = royaltyInfo(tokenId, price);
        uint256 platformFee = (price * platformFeePercent) / 10000;
        uint256 sellerAmount = price - royaltyAmount - platformFee;
        
        // Transfer the NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Distribute payments
        if (royaltyAmount > 0 && royaltyRecipient != seller) {
            payable(royaltyRecipient).transfer(royaltyAmount);
        } else {
            sellerAmount += royaltyAmount; // Add royalty back to seller if they're the creator
        }
        
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        
        payable(seller).transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit PromptSold(tokenId, seller, msg.sender, price);
    }
    
    function getPromptData(uint256 tokenId) 
        external 
        view 
        returns (PromptData memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return prompts[tokenId];
    }
    
    function getSaleData(uint256 tokenId) 
        external 
        view 
        returns (SaleData memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return sales[tokenId];
    }
    
    function getTokensForSale() 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 totalTokens = _tokenIdCounter;
        uint256 forSaleCount = 0;
        
        // Count tokens for sale
        for (uint256 i = 0; i < totalTokens; i++) {
            if (sales[i].isForSale) {
                forSaleCount++;
            }
        }
        
        // Create array of tokens for sale
        uint256[] memory tokensForSale = new uint256[](forSaleCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalTokens; i++) {
            if (sales[i].isForSale) {
                tokensForSale[index] = i;
                index++;
            }
        }
        
        return tokensForSale;
    }
    function getTokensByCreator(address creator) 
    external 
    view 
    returns (uint256[] memory) 
{
    uint256 totalTokens = _tokenIdCounter;
    uint256 count = 0;

    // First count how many
    for (uint256 i = 0; i < totalTokens; i++) {
        if (prompts[i].creator == creator) {
            count++;
        }
    }

    uint256[] memory tokens = new uint256[](count);
    uint256 idx = 0;
    for (uint256 i = 0; i < totalTokens; i++) {
        if (prompts[i].creator == creator) {
            tokens[idx] = i;
            idx++;
        }
    }

    return tokens;
}

    function getTokensByOwner(address owner) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 totalTokens = _tokenIdCounter;
        uint256 ownerTokenCount = balanceOf(owner);
        
        uint256[] memory ownerTokens = new uint256[](ownerTokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < totalTokens && index < ownerTokenCount; i++) {
            if (_ownerOf(i) == owner) {
                ownerTokens[index] = i;
                index++;
            }
        }
        
        return ownerTokens;
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Owner functions
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(feeRecipient).transfer(balance);
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}