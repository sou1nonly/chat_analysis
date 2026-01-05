"use client";

import { useState, useCallback } from 'react';
import { useOrbitStore } from '@/store/useOrbitStore';
import api from '@/lib/api';

export interface SearchResult {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
}

export interface SearchFilters {
    text?: string;
    sender?: string;
    dayOfWeek?: number; // 0-6 (Sun-Sat)
    hourOfDay?: number; // 0-23
    startDate?: string; // ISO string
    endDate?: string;   // ISO string
}

export function useSearch() {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeQuery, setActiveQuery] = useState<string | null>(null);
    const { uploadId } = useOrbitStore();

    const search = useCallback(async (filters: SearchFilters, label?: string) => {
        if (!uploadId) {
            console.warn('No upload ID available for search');
            return;
        }

        setIsSearching(true);
        setResults([]);
        setActiveQuery(label || JSON.stringify(filters));

        try {
            const response = await api.searchMessages(uploadId, {
                text: filters.text,
                sender: filters.sender,
                dayOfWeek: filters.dayOfWeek,
                hourOfDay: filters.hourOfDay,
            });
            setResults(response.results);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [uploadId]);

    const clear = useCallback(() => {
        setResults([]);
        setActiveQuery(null);
    }, []);

    return { search, results, isSearching, activeQuery, clear };
}
