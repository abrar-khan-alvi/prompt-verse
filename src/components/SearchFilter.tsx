/**
 * Search and Filter Component
 * Provides search bar, platform filter, and sort options
 */

'use client';

import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AI_PLATFORMS } from '@/lib/types';

interface SearchFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedPlatform: string;
    setSelectedPlatform: (platform: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
}

export function SearchFilter({
    searchTerm,
    setSearchTerm,
    selectedPlatform,
    setSelectedPlatform,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
}: SearchFilterProps) {
    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search prompts by title, description, or creator..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? 'bg-secondary' : ''}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="price_low">Price: Low to High</SelectItem>
                            <SelectItem value="price_high">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {showFilters && (
                <div className="rounded-lg border bg-card p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">AI Platform</label>
                            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Platforms" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Platforms</SelectItem>
                                    {AI_PLATFORMS.map((platform) => (
                                        <SelectItem key={platform} value={platform}>
                                            {platform}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Add more filters here if needed (e.g. Price Range) */}
                    </div>
                </div>
            )}
        </div>
    );
}
