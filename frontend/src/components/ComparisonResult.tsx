/**
 * ComparisonResult Component
 * 
 * Displays the AI-generated comparison results in a table format.
 * Shows each option's score against each constraint side-by-side.
 * 
 * Design Principle: Neutral presentation - no option is highlighted
 * as "better" or "winner". The table presents facts and lets users
 * draw their own conclusions based on their priorities.
 * 
 * The component dynamically extracts all unique constraints from
 * the options to build the table rows, ensuring all evaluated
 * factors are displayed.
 * 
 * Requirements: 3.1, 3.4, 3.5
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { OptionAnalysis } from '@/types';

interface ComparisonResultProps {
  options: OptionAnalysis[];
}

export function ComparisonResult({ options }: ComparisonResultProps) {
  if (options.length === 0) {
    return null;
  }

  // Get all unique constraints from all options
  const allConstraints = new Set<string>();
  options.forEach(option => {
    Object.keys(option.scores).forEach(constraint => {
      allConstraints.add(constraint);
    });
  });
  const constraints = Array.from(allConstraints);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comparison Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-muted-foreground">
                  Constraint
                </th>
                {options.map((option) => (
                  <th
                    key={option.name}
                    className="text-left p-3 font-medium"
                  >
                    {option.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {constraints.map((constraint) => (
                <tr key={constraint} className="border-b last:border-b-0">
                  <td className="p-3 font-medium text-muted-foreground">
                    {constraint}
                  </td>
                  {options.map((option) => (
                    <td key={`${option.name}-${constraint}`} className="p-3">
                      {option.scores[constraint] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
