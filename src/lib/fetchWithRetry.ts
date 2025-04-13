/**
 * Fetch with retry functionality for handling network errors
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retries - Number of retries (default: 3)
 * @param backoff - Backoff factor in ms (default: 300)
 * @returns Promise with fetch response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 300
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      // Add cache control headers to prevent stale data
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
    // Handle non-network errors (4xx, 5xx)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
      throw error;
    }
    
    return response;
  } catch (error) {
    // If we have no more retries, throw the error
    if (retries <= 0) throw error;
    
    // Wait for backoff * (4 - remaining retries) ms
    await new Promise(resolve => setTimeout(resolve, backoff * (4 - retries)));
    
    // Retry the request with one less retry
    return fetchWithRetry(url, options, retries - 1, backoff);
  }
}

/**
 * Fetch JSON data with retry functionality
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with parsed JSON data
 */
export async function fetchJsonWithRetry<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options);
  return response.json();
}
