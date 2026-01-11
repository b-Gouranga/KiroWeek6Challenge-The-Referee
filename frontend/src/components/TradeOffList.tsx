/**
 * TradeOffList Component
 * 
 * Displays contextual trade-off recommendations from the AI analysis.
 * Each trade-off follows the pattern:
 * - Scenario: "When you need..." or "If you prioritize..."
 * - Recommendation: "Consider X because..."
 * 
 * Design Principle: Trade-offs are the heart of The Referee's neutral
 * approach. Instead of declaring a winner, we present scenarios where
 * each option shines, empowering users to make context-aware decisions.
 * 
 * This enforces the "neutral referee" behavior specified in the prompts
 * sent to Grok AI (see promptBuilder.ts).
 * 
 * Requirements: 3.2, 3.3, 3.4
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { TradeOff } from '@/types';

interface TradeOffListProps {
  tradeOffs: TradeOff[];
}

export function TradeOffList({ tradeOffs }: TradeOffListProps) {
  if (tradeOffs.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trade-Offs & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {tradeOffs.map((tradeOff, index) => (
            <li key={index} className="border-l-2 border-muted pl-4">
              <p className="font-medium text-foreground">
                {tradeOff.scenario}
              </p>
              <p className="text-muted-foreground mt-1">
                {tradeOff.recommendation}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
