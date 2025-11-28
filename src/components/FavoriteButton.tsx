/**
 * Favorite Button Component
 * Heart icon that toggles favorite status
 */

'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
    tokenId: string;
    className?: string;
    size?: number;
}

export function FavoriteButton({ tokenId, className, size = 20 }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(tokenId);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(tokenId);
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'group relative transition-transform hover:scale-110 active:scale-95',
                className
            )}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart
                size={size}
                className={cn(
                    'transition-all duration-200',
                    favorite
                        ? 'fill-red-500 stroke-red-500'
                        : 'fill-none stroke-current group-hover:fill-red-500/20 group-hover:stroke-red-500'
                )}
            />
            {favorite && (
                <span className="absolute inset-0 animate-ping">
                    <Heart size={size} className="fill-red-500/50 stroke-none" />
                </span>
            )}
        </button>
    );
}
