/**
 * ProsCons Component
 * 
 * Displays pros and cons for each option in a visually balanced format.
 * - Pros: Green-tinted bullets with thumbs-up icon
 * - Cons: Red-tinted bullets with thumbs-down icon
 * 
 * Design Principle: Visual balance is key to neutrality. Both pros and
 * cons are given equal visual weight, and options are displayed in a
 * grid layout without any indication of preference.
 * 
 * The color coding (green/red) helps users quickly scan the information
 * without implying that one option is "better" overall.
 * 
 * Requirements: 3.2, 3.4
 */

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { OptionAnalysis } from '@/types';

interface ProsConsProps {
  options: OptionAnalysis[];
}

export function ProsCons({ options }: ProsConsProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {options.map((option) => (
        <Card key={option.name} className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">{option.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pros Section */}
            {option.pros.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">Pros</span>
                </div>
                <ul className="space-y-1">
                  {option.pros.map((pro, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-green-700 dark:text-green-400">
                        {pro}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons Section */}
            {option.cons.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-600">Cons</span>
                </div>
                <ul className="space-y-1">
                  {option.cons.map((con, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-red-600 mt-1">•</span>
                      <span className="text-red-700 dark:text-red-400">
                        {con}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
