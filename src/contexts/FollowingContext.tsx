/**
 * Following Context
 * Manages user's followed creators using localStorage
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

interface FollowingContextType {
    following: string[];
    isFollowing: (address: string) => boolean;
    toggleFollow: (address: string) => void;
    getFollowingCount: () => number;
}

const FollowingContext = createContext<FollowingContextType | undefined>(undefined);

export function FollowingProvider({ children }: { children: React.ReactNode }) {
    const [following, setFollowing] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load following from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.FOLLOWING);
            if (stored) {
                setFollowing(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load following:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save following to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify(following));
            } catch (error) {
                console.error('Failed to save following:', error);
            }
        }
    }, [following, isLoaded]);

    const isFollowing = useCallback(
        (address: string) => {
            return following.includes(address.toLowerCase());
        },
        [following]
    );

    const toggleFollow = useCallback((address: string) => {
        const addr = address.toLowerCase();
        setFollowing((prev) => {
            if (prev.includes(addr)) {
                // Unfollow
                return prev.filter((id) => id !== addr);
            } else {
                // Follow
                return [...prev, addr];
            }
        });
    }, []);

    const getFollowingCount = useCallback(() => {
        return following.length;
    }, [following]);

    const value: FollowingContextType = {
        following,
        isFollowing,
        toggleFollow,
        getFollowingCount,
    };

    return <FollowingContext.Provider value={value}>{children}</FollowingContext.Provider>;
}

export function useFollowing() {
    const context = useContext(FollowingContext);
    if (context === undefined) {
        throw new Error('useFollowing must be used within a FollowingProvider');
    }
    return context;
}
