import { useNavigate } from 'react-router-dom';
import { ComparisonForm } from '@/components/ComparisonForm';
import { postCompare } from '@/services/api';
import type { ComparisonRequest, ComparisonResponse } from '@/types';

interface HomePageProps {
  onComparisonComplete: (result: ComparisonResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function HomePage({ 
  onComparisonComplete, 
  isLoading, 
  setIsLoading, 
  setError 
}: HomePageProps) {
  const navigate = useNavigate();

  const handleSubmit = async (request: ComparisonRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await postCompare(request);
      onComparisonComplete(result);
      navigate('/result');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">The Referee</h1>
        <p className="text-muted-foreground mt-2">
          A neutral decision-comparison tool that helps you choose between technical options
        </p>
      </div>
      <ComparisonForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
