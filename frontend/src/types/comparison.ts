/**
 * Request payload for creating a new comparison
 */
export interface ComparisonRequest {
  /** Technical options to compare (minimum 2) */
  options: string[];
  /** Factors to evaluate options against (minimum 1) */
  constraints: string[];
}

/**
 * Analysis of a single option against all constraints
 */
export interface OptionAnalysis {
  /** Name of the option being analyzed */
  name: string;
  /** List of advantages for this option */
  pros: string[];
  /** List of disadvantages for this option */
  cons: string[];
  /** Scores/ratings for each constraint */
  scores: Record<string, string>;
}

/**
 * A trade-off scenario explaining when to choose each option
 */
export interface TradeOff {
  /** The scenario description (e.g., "When you need...") */
  scenario: string;
  /** The recommendation for this scenario (e.g., "Consider X because...") */
  recommendation: string;
}

/**
 * Full comparison response from the API
 */
export interface ComparisonResponse {
  /** Unique identifier for this comparison */
  id: string;
  /** Analysis for each option */
  options: OptionAnalysis[];
  /** Trade-off scenarios */
  tradeOffs: TradeOff[];
  /** Timestamp when the comparison was created */
  createdAt: string;
}

/**
 * Health check response from the API
 */
export interface HealthResponse {
  /** Overall health status */
  status: 'healthy' | 'unhealthy';
  /** Database connection status */
  database: 'connected' | 'disconnected';
  /** Grok AI API connection status */
  grokApi: 'connected' | 'disconnected';
  /** Timestamp of the health check */
  timestamp: string;
}

/**
 * API error response structure
 */
export interface ApiError {
  /** Error type identifier */
  error: string;
  /** Human-readable error message */
  message: string;
}
