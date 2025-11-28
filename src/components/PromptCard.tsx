'use client';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/FavoriteButton';
import { FollowButton } from '@/components/FollowButton';

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
}

const PromptCard = ({ id, title, preview, image, price, creator }: PromptCardProps) => {
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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

        <Link href={`/prompt/${id}`}>
          <Button variant="secondary" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PromptCard;
