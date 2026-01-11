/**
 * API Service for The Referee
 * 
 * This module handles all communication with the backend API.
 * It provides a type-safe interface for submitting comparison requests
 * and checking system health.
 * 
 * The Referee uses Grok AI to generate neutral, balanced comparisons
 * between technical options. This service abstracts the API calls
 * and provides consistent error handling.
 * 
 * Development Note: This project was built using Kiro's spec-driven
 * development workflow, which accelerated the implementation by
 * providing clear requirements and design documents upfront.
 */

import type {
  ComparisonRequest,
  ComparisonResponse,
  HealthResponse,
  ApiError,
} from '@/types';

// API base URL from environment variable, defaults to localhost for development
// In Docker, this is set via VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  statusCode: number;
  errorType?: string;

  constructor(message: string, statusCode: number, errorType?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.errorType = errorType;
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Parse response body
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const apiError = data as ApiError;
      throw new ApiRequestError(
        apiError.message || 'An error occurred',
        response.status,
        apiError.error
      );
    }

    return data as T;
  } catch (error) {
    // Re-throw ApiRequestError as-is
    if (error instanceof ApiRequestError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiRequestError(
        'Unable to connect to the server. Please check your connection.',
        0,
        'network_error'
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      throw new ApiRequestError(
        'Invalid response from server',
        500,
        'parse_error'
      );
    }

    // Re-throw unknown errors
    throw error;
  }
}

/**
 * Submit a comparison request to the API
 * @param request - The comparison request with options and constraints
 * @returns The comparison response with analysis and trade-offs
 */
export async function postCompare(
  request: ComparisonRequest
): Promise<ComparisonResponse> {
  return fetchApi<ComparisonResponse>('/compare', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Check the health status of the API
 * @returns The health status of the API and its dependencies
 */
export async function getHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>('/health');
}
