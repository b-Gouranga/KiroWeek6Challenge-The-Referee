/**
 * Groq AI Service
 * 
 * Handles communication with the Groq API for generating neutral comparisons.
 * 
 * WHY GROQ?
 * Groq was selected for The Referee because:
 * 1. Extremely fast inference speeds
 * 2. High-quality responses using LLaMA and Mixtral models
 * 3. OpenAI-compatible API format
 * 4. Reliable JSON output formatting for structured responses
 * 5. Cost-effective for real-time comparisons
 * 
 * The service implements retry logic with exponential backoff to handle
 * transient failures gracefully, ensuring a robust user experience.
 */

// Groq API endpoint (OpenAI-compatible)
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';
// Use llama3 or mixtral models available on Groq
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export interface GrokCompletionOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GrokApiError extends Error {
  statusCode?: number;
  isRetryable: boolean;
}

/**
 * Delay helper for exponential backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a GrokApiError with appropriate properties
 */
function createGrokError(message: string, statusCode?: number): GrokApiError {
  const error = new Error(message) as GrokApiError;
  error.statusCode = statusCode;
  // Retry on 429 (rate limit), 500, 502, 503, 504 (server errors)
  error.isRetryable = statusCode !== undefined && 
    (statusCode === 429 || statusCode >= 500);
  return error;
}

/**
 * Get the Groq API key from environment variables
 */
function getApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw createGrokError('GROQ_API_KEY environment variable is not configured', undefined);
  }
  return apiKey;
}

/**
 * Check if Groq API is accessible
 * Performs a lightweight connectivity test
 */
export async function checkGrokConnection(): Promise<boolean> {
  try {
    const apiKey = getApiKey();
    const response = await fetch(`${GROQ_API_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Groq API connection check failed:', error);
    return false;
  }
}

/**
 * Call Groq API with retry logic and exponential backoff
 */
export async function callGrokWithRetry(
  options: GrokCompletionOptions,
  maxRetries: number = MAX_RETRIES
): Promise<string> {
  const apiKey = getApiKey();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: 'user',
              content: options.prompt
            }
          ],
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Groq API error response: Status ${response.status}, Body: ${errorBody}`);
        const error = createGrokError(
          `Groq API error: ${response.status} - ${errorBody}`,
          response.status
        );
        
        // If not retryable or last attempt, throw immediately
        if (!error.isRetryable || attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff before retry
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Groq API attempt ${attempt} failed (${response.status}), retrying in ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }

      const data = await response.json() as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw createGrokError('Invalid response structure from Groq API');
      }

      return data.choices[0].message.content || '';
    } catch (error) {
      // If it's already a GrokApiError, handle retry logic
      if ((error as GrokApiError).isRetryable !== undefined) {
        if (!(error as GrokApiError).isRetryable || attempt === maxRetries) {
          throw error;
        }
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Groq API attempt ${attempt} failed, retrying in ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      
      // Network errors or other unexpected errors
      if (attempt === maxRetries) {
        throw createGrokError(`Groq API request failed after ${maxRetries} attempts: ${(error as Error).message}`);
      }
      
      const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`Groq API attempt ${attempt} failed (network error), retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw createGrokError('Unexpected error in retry logic');
}
