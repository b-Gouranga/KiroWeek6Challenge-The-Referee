/**
 * Prompt Builder for Grok AI
 * 
 * Constructs structured prompts that enforce neutral "referee" behavior.
 * The key design principle is neutrality: never declare a "winner" but
 * present trade-offs that help users make informed decisions.
 * 
 * WHY GROK AI?
 * Grok AI was chosen for this project because:
 * 1. High-quality, nuanced responses for technical comparisons
 * 2. Ability to follow structured prompting to maintain neutrality
 * 3. Handles complex multi-factor analysis effectively
 * 4. Consistent JSON output formatting
 * 
 * TRADE-OFF ENFORCEMENT:
 * The prompt explicitly instructs Grok to:
 * - NOT declare a "best" or "winner"
 * - Provide scenario-based recommendations ("If you prioritize X...")
 * - Be factual and balanced in analysis
 * - Score each option against each constraint
 * 
 * This ensures the AI acts as a neutral referee rather than an opinionated
 * advisor, which is the core value proposition of The Referee tool.
 * 
 * DEVELOPMENT NOTE:
 * This project was built using Kiro's spec-driven development workflow.
 * The clear requirements and design documents accelerated implementation
 * by providing upfront clarity on the neutral referee behavior.
 * 
 * Requirements: 2.2, 2.3, 2.4
 */

/**
 * Build a comparison prompt for Grok AI
 * Includes all options and constraints with instructions for neutral analysis
 * 
 * @param options - Array of technical options to compare (e.g., "AWS", "Azure")
 * @param constraints - Array of factors to evaluate (e.g., "cost", "scalability")
 * @returns Structured prompt string for Grok AI
 */
export function buildComparisonPrompt(options: string[], constraints: string[]): string {
  const optionsList = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const constraintsList = constraints.map((c, i) => `${i + 1}. ${c}`).join('\n');

  return `You are a neutral technical referee. Compare the following options without declaring a winner.

OPTIONS TO COMPARE:
${optionsList}

CONSTRAINTS TO EVALUATE:
${constraintsList}

INSTRUCTIONS:
1. Analyze each option against ALL constraints
2. List specific pros and cons for each option
3. DO NOT declare a "best" or "winner" - remain completely neutral
4. Provide trade-off scenarios: "If you prioritize X, consider Y because..."
5. Be factual and balanced in your analysis
6. Score each option against each constraint with a brief explanation

OUTPUT FORMAT (respond with valid JSON only, no markdown code blocks):
{
  "options": [
    {
      "name": "option name",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"],
      "scores": {
        "constraint1": "rating/explanation",
        "constraint2": "rating/explanation"
      }
    }
  ],
  "tradeOffs": [
    {
      "scenario": "When you need...",
      "recommendation": "Consider X because..."
    }
  ]
}

IMPORTANT: 
- Return ONLY valid JSON, no additional text or markdown formatting
- Include ALL options provided in your analysis
- Include scores for ALL constraints for each option
- Trade-offs should present balanced scenarios, not recommendations for a single option`;
}
