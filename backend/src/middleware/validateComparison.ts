/**
 * Input Validation Middleware for Comparison Requests
 * Validates that comparison requests meet minimum requirements:
 * - At least 2 options
 * - At least 1 constraint
 * - All strings are non-empty
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

import { Request, Response, NextFunction } from 'express';

export interface ComparisonRequest {
  options: string[];
  constraints: string[];
}

export interface ValidationError {
  error: 'validation_error';
  message: string;
  details?: string[];
}

/**
 * Check if a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that an array contains only non-empty strings
 */
function validateStringArray(arr: unknown[], fieldName: string): string[] {
  const errors: string[] = [];
  
  arr.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      errors.push(`${fieldName}[${index}] must be a non-empty string`);
    }
  });
  
  return errors;
}

/**
 * Middleware to validate comparison request body
 * Returns 400 with validation errors if request is invalid
 */
export function validateComparisonRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as Partial<ComparisonRequest>;
  const errors: string[] = [];

  // Check if options exists and is an array
  if (!body.options) {
    errors.push('options is required');
  } else if (!Array.isArray(body.options)) {
    errors.push('options must be an array');
  } else {
    // Validate minimum 2 options (Requirement 1.2)
    if (body.options.length < 2) {
      errors.push('At least 2 options are required');
    }
    // Validate all options are non-empty strings
    errors.push(...validateStringArray(body.options, 'options'));
  }

  // Check if constraints exists and is an array
  if (!body.constraints) {
    errors.push('constraints is required');
  } else if (!Array.isArray(body.constraints)) {
    errors.push('constraints must be an array');
  } else {
    // Validate minimum 1 constraint (Requirement 1.3)
    if (body.constraints.length < 1) {
      errors.push('At least 1 constraint is required');
    }
    // Validate all constraints are non-empty strings
    errors.push(...validateStringArray(body.constraints, 'constraints'));
  }

  // If there are validation errors, return 400
  if (errors.length > 0) {
    const response: ValidationError = {
      error: 'validation_error',
      message: 'Invalid comparison request',
      details: errors
    };
    res.status(400).json(response);
    return;
  }

  // Trim whitespace from all strings before proceeding
  req.body = {
    options: (body.options as string[]).map(o => o.trim()),
    constraints: (body.constraints as string[]).map(c => c.trim())
  };

  next();
}
