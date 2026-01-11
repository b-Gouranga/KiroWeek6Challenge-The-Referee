/**
 * Comparison Service
 * Orchestrates the comparison flow: storing requests, calling Grok AI,
 * normalizing responses, and storing results.
 * 
 * Requirements: 2.1, 4.4
 */

import { query } from '../db';
import { callGrokWithRetry } from './grokService';
import { buildComparisonPrompt } from '../utils/promptBuilder';
import { normalizeGrokResponse, NormalizedComparisonResult, NormalizationError } from '../utils/responseNormalizer';

export interface ComparisonInput {
  options: string[];
  constraints: string[];
}

export interface ComparisonResponse {
  id: string;
  options: NormalizedComparisonResult['options'];
  tradeOffs: NormalizedComparisonResult['tradeOffs'];
  createdAt: string;
}

export class ComparisonServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'ComparisonServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Store a comparison request in the database
 * Returns the generated comparison ID
 */
async function storeComparisonRequest(input: ComparisonInput): Promise<string> {
  try {
    const result = await query(
      'INSERT INTO comparisons (options, constraints) VALUES ($1, $2) RETURNING id',
      [input.options, input.constraints]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Failed to store comparison request:', error);
    throw new ComparisonServiceError(
      'Failed to store comparison request',
      'database_error',
      500
    );
  }
}

/**
 * Store a comparison result in the database
 */
async function storeComparisonResult(
  comparisonId: string,
  result: NormalizedComparisonResult
): Promise<void> {
  try {
    await query(
      'INSERT INTO comparison_results (comparison_id, result) VALUES ($1, $2)',
      [comparisonId, JSON.stringify(result)]
    );
  } catch (error) {
    console.error('Failed to store comparison result:', error);
    throw new ComparisonServiceError(
      'Failed to store comparison result',
      'database_error',
      500
    );
  }
}

/**
 * Execute a comparison: store request, call Grok AI, normalize and store result
 * 
 * @param input - The comparison input with options and constraints
 * @returns The structured comparison response
 * @throws ComparisonServiceError if any step fails
 */
export async function executeComparison(input: ComparisonInput): Promise<ComparisonResponse> {
  // Step 1: Store the comparison request in the database
  const comparisonId = await storeComparisonRequest(input);

  // Step 2: Build the prompt for Grok AI
  const prompt = buildComparisonPrompt(input.options, input.constraints);

  // Step 3: Call Grok AI with retry logic
  let rawResponse: string;
  try {
    rawResponse = await callGrokWithRetry({ prompt });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Grok API call failed:', errorMessage);
    throw new ComparisonServiceError(
      `AI service is currently unavailable: ${errorMessage}`,
      'ai_service_error',
      502
    );
  }

  // Step 4: Normalize the Grok response
  let normalizedResult: NormalizedComparisonResult;
  try {
    normalizedResult = normalizeGrokResponse(rawResponse);
  } catch (error) {
    if (error instanceof NormalizationError) {
      console.error('Failed to normalize Grok response:', error.message);
      throw new ComparisonServiceError(
        'Failed to process AI response. Please try again.',
        'normalization_error',
        502
      );
    }
    throw error;
  }

  // Step 5: Store the result in the database
  await storeComparisonResult(comparisonId, normalizedResult);

  // Step 6: Return the structured response
  return {
    id: comparisonId,
    options: normalizedResult.options,
    tradeOffs: normalizedResult.tradeOffs,
    createdAt: new Date().toISOString()
  };
}
