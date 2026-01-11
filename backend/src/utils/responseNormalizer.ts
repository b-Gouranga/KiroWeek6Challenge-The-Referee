/**
 * Response Normalizer for Grok AI
 * Parses and validates JSON responses from Grok AI to ensure consistent structure.
 * Handles malformed responses gracefully.
 * 
 * Requirements: 2.5
 */

export interface OptionAnalysis {
  name: string;
  pros: string[];
  cons: string[];
  scores: Record<string, string>;
}

export interface TradeOff {
  scenario: string;
  recommendation: string;
}

export interface NormalizedComparisonResult {
  options: OptionAnalysis[];
  tradeOffs: TradeOff[];
}

export class NormalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NormalizationError';
  }
}

/**
 * Extract JSON from a response that might contain markdown code blocks
 */
function extractJson(raw: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  
  // Try to find JSON object directly
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  return raw.trim();
}

/**
 * Validate that an option has all required fields
 */
function validateOption(option: unknown, index: number): OptionAnalysis {
  if (!option || typeof option !== 'object') {
    throw new NormalizationError(`Option at index ${index} is not a valid object`);
  }

  const opt = option as Record<string, unknown>;

  if (typeof opt.name !== 'string' || !opt.name.trim()) {
    throw new NormalizationError(`Option at index ${index} is missing a valid 'name' field`);
  }

  if (!Array.isArray(opt.pros)) {
    throw new NormalizationError(`Option '${opt.name}' is missing 'pros' array`);
  }

  if (!Array.isArray(opt.cons)) {
    throw new NormalizationError(`Option '${opt.name}' is missing 'cons' array`);
  }

  // Validate pros are strings
  const pros = opt.pros.filter((p): p is string => typeof p === 'string' && p.trim() !== '');
  
  // Validate cons are strings
  const cons = opt.cons.filter((c): c is string => typeof c === 'string' && c.trim() !== '');

  // Validate scores object
  let scores: Record<string, string> = {};
  if (opt.scores && typeof opt.scores === 'object') {
    scores = Object.entries(opt.scores as Record<string, unknown>)
      .reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value;
        } else if (value !== null && value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>);
  }

  return {
    name: opt.name.trim(),
    pros,
    cons,
    scores
  };
}

/**
 * Validate that a trade-off has all required fields
 */
function validateTradeOff(tradeOff: unknown, index: number): TradeOff | null {
  if (!tradeOff || typeof tradeOff !== 'object') {
    console.warn(`Trade-off at index ${index} is not a valid object, skipping`);
    return null;
  }

  const to = tradeOff as Record<string, unknown>;

  if (typeof to.scenario !== 'string' || !to.scenario.trim()) {
    console.warn(`Trade-off at index ${index} is missing 'scenario', skipping`);
    return null;
  }

  if (typeof to.recommendation !== 'string' || !to.recommendation.trim()) {
    console.warn(`Trade-off at index ${index} is missing 'recommendation', skipping`);
    return null;
  }

  return {
    scenario: to.scenario.trim(),
    recommendation: to.recommendation.trim()
  };
}

/**
 * Normalize a raw Grok AI response into a structured comparison result
 * 
 * @param raw - Raw string response from Grok AI
 * @returns Normalized comparison result with validated structure
 * @throws NormalizationError if the response cannot be parsed or is missing required fields
 */
export function normalizeGrokResponse(raw: string): NormalizedComparisonResult {
  if (!raw || typeof raw !== 'string') {
    throw new NormalizationError('Response is empty or not a string');
  }

  // Extract JSON from potential markdown formatting
  const jsonString = extractJson(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw new NormalizationError(`Failed to parse JSON response: ${(error as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new NormalizationError('Parsed response is not a valid object');
  }

  const response = parsed as Record<string, unknown>;

  // Validate options array
  if (!Array.isArray(response.options)) {
    throw new NormalizationError('Response is missing required "options" array');
  }

  if (response.options.length === 0) {
    throw new NormalizationError('Response "options" array is empty');
  }

  // Validate and normalize each option
  const options: OptionAnalysis[] = response.options.map((opt, index) => 
    validateOption(opt, index)
  );

  // Validate trade-offs array (optional but expected)
  let tradeOffs: TradeOff[] = [];
  if (Array.isArray(response.tradeOffs)) {
    tradeOffs = response.tradeOffs
      .map((to, index) => validateTradeOff(to, index))
      .filter((to): to is TradeOff => to !== null);
  } else {
    console.warn('Response is missing "tradeOffs" array, using empty array');
  }

  return {
    options,
    tradeOffs
  };
}
