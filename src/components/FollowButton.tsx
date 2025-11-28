/**
 * Follow Button Component
 * Button to follow/unfollow a creator
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFollowing } from '@/contexts/FollowingContext';
import { UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
    address: string;
    className?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function FollowButton({ address, className, size = 'sm' }: FollowButtonProps) {
    const { isFollowing, toggleFollow } = useFollowing();
    const following = isFollowing(address);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFollow(address);
    };

    return (
        <Button
            variant={following ? 'secondary' : 'default'}
            size={size}
            onClick={handleClick}
            className={cn('gap-2 transition-all', className)}
        >
            {following ? (
                <>
                    <UserCheck size={16} />
                    <span>Following</span>
                </>
            ) : (
                <>
                    <UserPlus size={16} />
                    <span>Follow</span>
                </>
            )}
        </Button>
    );
}
