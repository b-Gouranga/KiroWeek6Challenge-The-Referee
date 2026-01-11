import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComparisonResult } from '@/components/ComparisonResult';
import { TradeOffList } from '@/components/TradeOffList';
import { ProsCons } from '@/components/ProsCons';
import type { ComparisonResponse } from '@/types';

interface ResultPageProps {
  result: ComparisonResponse | null;
}

export function ResultPage({ result }: ResultPageProps) {
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No comparison result found</h2>
          <p className="text-muted-foreground mb-6">
            Please submit a comparison request first.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Comparison
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Comparison Results</h1>
        <p className="text-muted-foreground mt-2">
          A balanced analysis of your options
        </p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Side-by-side comparison table */}
        <ComparisonResult options={result.options} />

        {/* Trade-offs section */}
        <TradeOffList tradeOffs={result.tradeOffs} />

        {/* Pros and Cons for each option */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Detailed Analysis</h2>
          <ProsCons options={result.options} />
        </div>
      </div>
    </div>
  );
}
