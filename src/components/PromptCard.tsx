'use client';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/FavoriteButton';
import { FollowButton } from '@/components/FollowButton';

import { useState } from 'react';
import { burnNFT } from '@/utils/contractInteraction';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

export interface PromptCardProps {
  id: string;
  title: string;
  preview: string;
  image?: string;
  price: string;
  creator: {
    address: string;
    name?: string;
  };
  isOwner?: boolean;
}

const PromptCard = ({ id, title, preview, image, price, creator, isOwner }: PromptCardProps) => {
  const { toast } = useToast();
  const [isBurning, setIsBurning] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleBurn = async () => {
    if (!confirm('Are you sure you want to burn this NFT? This action cannot be undone.')) {
      return;
    }

    setIsBurning(true);
    try {
      await burnNFT(id);
      toast({
        title: 'NFT Burned',
        description: 'The NFT has been successfully burned.',
      });
      // Optional: Refresh page or callback to remove item from list
      window.location.reload();
    } catch (error) {
      console.error('Failed to burn NFT:', error);
      toast({
        title: 'Burn Failed',
        description: 'Failed to burn the NFT. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBurning(false);
    }
  };

  return (
    <Card className="glass card-glow flex h-full flex-col overflow-hidden">
      {image && (
        <div className="relative w-full overflow-hidden pt-[75%]">
          <img
            src={image}
            alt={title}
            className="absolute left-0 top-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute right-2 top-2 z-10">
            <FavoriteButton tokenId={id} />
          </div>
        </div>
      )}

      <CardContent className="flex-1 p-5">
        <Link href={`/prompt/${id}`}>
          <h3 className="mb-2 text-xl font-semibold transition-colors hover:text-purple-400">
            {title}
          </h3>
        </Link>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            By: {creator.name || formatAddress(creator.address)}
          </p>
          <FollowButton address={creator.address} size="sm" className="h-7 px-2 text-xs" />
        </div>

        <p className="line-clamp-3 text-gray-300">{preview}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-5 pt-0">
        <div className="flex items-center">
          <span className="text-sm text-gray-400">Price:</span>
          <span className="ml-2 font-semibold">{price} ETH</span>
        </div>

        <div className="flex gap-2">
          {isOwner && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBurn}
              disabled={isBurning}
              className="px-2"
            >
              {isBurning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          )}
          <Link href={`/prompt/${id}`}>
            <Button variant="secondary" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PromptCard;
