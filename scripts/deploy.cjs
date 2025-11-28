const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying AIPromptNFT contract...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Fee recipient: defaulting to deployer, but can be changed
  const feeRecipient = deployer.address;

  const AIPromptNFT = await ethers.getContractFactory('AIPromptNFT');
  const nft = await AIPromptNFT.deploy('PromptVerse', 'PVS', feeRecipient);

  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log(`AIPromptNFT deployed to: ${address}`);
  console.log(`Fee Recipient set to: ${feeRecipient}`);

  console.log('\nIMPORTANT: Update your .env.local file with this contract address:');
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
