// src/app/about/page.tsx
'use client'; // If you add any client-side interactivity later, otherwise can be a Server Component

import React from 'react';
import Link from 'next/link';
// import Navbar from '@/components/Navbar'; // Assumed to be in layout.tsx
// import Footer from '@/components/Footer'; // Assumed to be in layout.tsx
import { ShieldCheck, Zap, Users, Layers, Globe, SearchCode, Gem } from 'lucide-react'; // Icons
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
const AboutPage = () => {
  const features = [
    {
      icon: <ShieldCheck className="mb-4 h-10 w-10 text-primary" />,
      title: 'Secure Ownership & Authenticity',
      description:
        'Leveraging the immutable Hyperledger Besu blockchain, each AI prompt is tokenized as a unique Non-Fungible Token (NFT). This guarantees verifiable ownership and a transparent history for every prompt, combating plagiarism and unauthorized use.',
    },
    {
      icon: <Layers className="mb-4 h-10 w-10 text-primary" />,
      title: 'Decentralized Storage with IPFS',
      description:
        'Prompt data, especially larger media files associated with prompts, is stored on the InterPlanetary File System (IPFS) via Pinata. This ensures content is resilient, censorship-resistant, and persistently available, linked securely to its on-chain NFT record.',
    },
    {
      icon: <Zap className="mb-4 h-10 w-10 text-primary" />,
      title: 'Efficient & Scalable Private Network',
      description:
        'Built on a private Hyperledger Besu network using IBFT consensus, our platform offers high throughput, low latency, and minimal transaction costs, making minting and trading prompts fast and affordable.',
    },
    {
      icon: <Gem className="mb-4 h-10 w-10 text-primary" />,
      title: 'Monetize Your Creativity',
      description:
        'Creators can tokenize their unique AI prompts, set initial sale prices, and earn royalties on secondary sales through smart contract-enforced ERC2981 royalty standards. Turn your creative AI engineering into valuable digital assets.',
    },
    {
      icon: <Users className="mb-4 h-10 w-10 text-primary" />,
      title: 'Transparent Marketplace',
      description:
        'Our platform provides a transparent environment for buying and selling AI prompt NFTs. All transactions, ownership changes, and sale listings are recorded on the blockchain, fostering trust and fair dealings.',
    },
    {
      icon: <SearchCode className="mb-4 h-10 w-10 text-primary" />,
      title: 'Dual Data Model for Prompts',
      description:
        'Key metadata for prompts is stored directly on-chain for quick access and verifiability, while larger content (full prompt text, media files, output samples) is linked via IPFS, optimizing for both performance and data integrity.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 text-foreground md:py-16">
      <header className="mb-12 text-center md:mb-16">{/* ... header content ... */}</header>
      {/* --- "OUR VISION" SECTION - UPDATED CONTENT --- */}
      <section className="mb-12 md:mb-16">
        <Card className="glass border-border bg-card p-6 shadow-xl md:p-8">
          {' '}
          {/* Added shadow for depth */}
          <CardHeader>
            <CardTitle className="mb-3 text-center text-2xl text-primary sm:text-left md:text-3xl">
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base text-muted-foreground md:text-lg">
            <p>
              In the rapidly evolving landscape of artificial intelligence, the true value often
              lies in the ingenuity of the prompts that unlock AI's potential. We envision a future
              where AI prompt engineers and creators are recognized, empowered, and fairly
              compensated for their intellectual contributions.
            </p>
            <p>
              AI Prompt NFTs is born from the need to establish a transparent, secure, and
              decentralized ecosystem for these valuable digital assets. Our platform provides the
              tools to transform meticulously crafted AI prompts—from simple text to complex
              multi-modal inputs—into unique, verifiable Non-Fungible Tokens (NFTs).
            </p>
            <p>Our core mission is to:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>
                <strong>Preserve Ownership:</strong> Grant creators undeniable, blockchain-verified
                ownership of their prompts.
              </li>
              <li>
                <strong>Ensure Authenticity:</strong> Provide a clear, immutable record of a
                prompt's origin and history.
              </li>
              <li>
                <strong>Enable Monetization:</strong> Offer a dedicated marketplace for creators to
                sell, license, and earn royalties from their prompts.
              </li>
              <li>
                <strong>Foster Innovation:</strong> Create a community where high-quality prompts
                can be discovered, shared, and built upon, accelerating creativity in the AI space.
              </li>
            </ul>
            <p>
              By leveraging the power of Hyperledger Besu, IPFS, and smart contracts, we are
              building more than just a marketplace; we are cultivating a new standard for the
              valuation and exchange of AI-driven creativity.
            </p>
          </CardContent>
        </Card>
      </section>
      {/* --- END OF "OUR VISION" SECTION --- */}

      <section className="mb-12 md:mb-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-foreground md:text-4xl">
          How Our System Works
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="glass card-glow flex flex-col border-border bg-card">
              <CardHeader className="items-center text-center">
                {feature.icon}
                <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow text-sm text-muted-foreground">
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12 text-center md:mb-16">
        {/* ... technology stack ... uses <Badge /> ... */}
        <div className="mx-auto max-w-2xl space-y-3 text-base text-muted-foreground md:text-lg">
          <p>
            Our platform is built on a robust and modern technology stack designed for security,
            scalability, and user experience:
          </p>
          <ul className="inline-block list-inside list-disc space-y-2 text-left">
            <li>
              <strong>Blockchain:</strong> Hyperledger Besu (Private IBFT Network)
            </li>
            <li>
              <strong>Smart Contracts:</strong> Solidity (ERC721, ERC2981 for Royalties, Custom
              Logic)
            </li>
            <li>
              <strong>Decentralized Storage:</strong> IPFS (via Pinata for reliable pinning)
            </li>
            <li>
              <strong>Frontend:</strong> Next.js with React & TypeScript{' '}
              <Badge variant="secondary" className="ml-1">
                Core
              </Badge>
            </li>
            <li>
              <strong>Styling:</strong> Tailwind CSS with ShadCN UI components{' '}
              <Badge variant="secondary" className="ml-1">
                UI
              </Badge>
            </li>
            <li>
              <strong>Wallet Integration:</strong> MetaMask (via ethers.js){' '}
              <Badge variant="secondary" className="ml-1">
                Web3
              </Badge>
            </li>
          </ul>
        </div>
      </section>

      <section className="text-center">
        {/* ... call to action ... uses <Button /> ... */}
        <div className="space-x-4">
          <Link href="/create" passHref>
            <Button
              size="lg"
              className="bg-gradient-button hover:bg-gradient-button-hover px-8 py-3 text-primary-foreground"
            >
              Create Your First Prompt NFT
            </Button>
          </Link>
          <Link href="/marketplace" passHref>
            <Button
              size="lg"
              variant="outline"
              className="border-primary px-8 py-3 text-primary hover:bg-primary/10"
            >
              Explore the Marketplace
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
// If you're using the App Router and this file is src/app/about/page.tsx,
// you might want to export metadata if not done in layout.tsx
// export const metadata = {
//   title: "About AI Prompt NFTs",
//   description: "Learn more about our decentralized platform for AI prompts."
// };

// If Navbar and Footer are in layout.tsx, you don't need to import them here.
// However, if you have a specific layout for this page, you might.
// For now, assuming global layout.
export default AboutPage;
