/**
 * Favorites Context
 * Manages user's favorite prompts using localStorage
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

interface FavoritesContextType {
    favorites: string[];
    isFavorite: (tokenId: string) => boolean;
    toggleFavorite: (tokenId: string) => void;
    getFavoriteCount: () => number;
    clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
            } catch (error) {
                console.error('Failed to save favorites:', error);
            }
        }
    }, [favorites, isLoaded]);

    const isFavorite = useCallback(
        (tokenId: string) => {
            return favorites.includes(tokenId);
        },
        [favorites]
    );

    const toggleFavorite = useCallback((tokenId: string) => {
        setFavorites((prev) => {
            if (prev.includes(tokenId)) {
                // Remove from favorites
                return prev.filter((id) => id !== tokenId);
            } else {
                // Add to favorites
                return [...prev, tokenId];
            }
        });
    }, []);

    const getFavoriteCount = useCallback(() => {
        return favorites.length;
    }, [favorites]);

    const clearFavorites = useCallback(() => {
        setFavorites([]);
    }, []);

    const value: FavoritesContextType = {
        favorites,
        isFavorite,
        toggleFavorite,
        getFavoriteCount,
        clearFavorites,
    };

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
