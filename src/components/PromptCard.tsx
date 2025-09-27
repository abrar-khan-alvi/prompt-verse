"use client";
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <Card className="glass card-glow overflow-hidden flex flex-col h-full">
      {image && (
        <div className="relative w-full pt-[75%] overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform hover:scale-105 duration-500" 
          />
        </div>
      )}
      
      <CardContent className="flex-1 p-5">
        <Link href={`/prompt/${id}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-purple-400 transition-colors">
            {title}
          </h3>
        </Link>
        
        <p className="text-gray-400 text-sm mb-3">
          By: {creator.name || formatAddress(creator.address)}
        </p>
        
        <p className="text-gray-300 line-clamp-3">
          {preview}
        </p>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex justify-between items-center">
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
