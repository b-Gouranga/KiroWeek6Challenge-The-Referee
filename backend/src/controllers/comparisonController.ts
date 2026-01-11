/**
 * Comparison Controller
 * Handles HTTP requests for comparison operations.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.5, 4.1, 4.2, 4.4
 */

import { Request, Response } from 'express';
import { executeComparison, ComparisonServiceError } from '../services/comparisonService';
import { ComparisonRequest } from '../middleware/validateComparison';

/**
 * POST /compare endpoint handler
 * Accepts options and constraints, returns structured comparison result
 */
export async function createComparison(req: Request, res: Response): Promise<void> {
  const { options, constraints } = req.body as ComparisonRequest;

  try {
    const result = await executeComparison({ options, constraints });
    
    // Return 200 with structured comparison response (Requirement 7.3, 7.5)
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ComparisonServiceError) {
      // Return appropriate error response based on error type
      res.status(error.statusCode).json({
        error: error.code,
        message: error.message
      });
      return;
    }

    // Unexpected error - log and return generic error
    console.error('Unexpected error in createComparison:', error);
    res.status(500).json({
      error: 'internal_error',
      message: 'An unexpected error occurred'
    });
  }
}
