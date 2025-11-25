/**
 * Search Service for SearXNG
 * Provides web search capabilities for AI-powered content generation
 * Requirements: 4.1, 4.4
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  searchTime: number;
}

interface SearXNGResult {
  title: string;
  url: string;
  content?: string;
  snippet?: string;
}

interface SearXNGResponse {
  results: SearXNGResult[];
  query: string;
  number_of_results: number;
}

// Admin toggle state - in production this would be stored in database
let searchEnabled = true;

/**
 * Get the SearXNG base URL from environment
 */
function getSearXNGUrl(): string {
  return process.env.SEARXNG_URL || 'http://localhost:8080';
}

/**
 * Check if search is enabled globally (admin toggle)
 * Requirements: 4.4
 */
export function isSearchEnabled(): boolean {
  return searchEnabled && !!process.env.SEARXNG_URL;
}

/**
 * Enable or disable search globally (admin function)
 * Requirements: 4.4, 9.3
 */
export function setSearchEnabled(enabled: boolean): void {
  searchEnabled = enabled;
}


/**
 * Query SearXNG for search results
 * Requirements: 4.1
 * 
 * @param searchQuery - The search query string
 * @param maxResults - Maximum number of results to return (default: 5)
 * @returns Search results with title, url, and snippet
 */
export async function query(
  searchQuery: string,
  maxResults: number = 5
): Promise<SearchResponse> {
  if (!isSearchEnabled()) {
    return {
      results: [],
      query: searchQuery,
      searchTime: 0,
    };
  }

  const startTime = Date.now();
  const baseUrl = getSearXNGUrl();
  
  const params = new URLSearchParams({
    q: searchQuery,
    format: 'json',
    categories: 'general,it',
    language: 'en',
    safesearch: '1',
  });

  try {
    const response = await fetch(`${baseUrl}/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`SearXNG search failed with status: ${response.status}`);
      return {
        results: [],
        query: searchQuery,
        searchTime: Date.now() - startTime,
      };
    }

    const data: SearXNGResponse = await response.json();
    
    const results: SearchResult[] = data.results
      .slice(0, maxResults)
      .map((result) => ({
        title: result.title || '',
        url: result.url || '',
        snippet: result.content || result.snippet || '',
      }))
      .filter((result) => result.title && result.url);

    return {
      results,
      query: searchQuery,
      searchTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('SearXNG search error:', error);
    return {
      results: [],
      query: searchQuery,
      searchTime: Date.now() - startTime,
    };
  }
}

/**
 * Search service interface for dependency injection
 */
export interface SearchService {
  query(searchQuery: string, maxResults?: number): Promise<SearchResponse>;
  isEnabled(): boolean;
}

export const searchService: SearchService = {
  query,
  isEnabled: isSearchEnabled,
};
