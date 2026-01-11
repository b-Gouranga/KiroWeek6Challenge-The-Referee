import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ResultPage } from '@/pages/ResultPage';
import type { ComparisonResponse } from '@/types';

function App() {
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        {/* Error toast/banner */}
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-md shadow-lg max-w-md">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-destructive-foreground hover:opacity-80"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                onComparisonComplete={setComparisonResult}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setError={setError}
              />
            } 
          />
          <Route 
            path="/result" 
            element={<ResultPage result={comparisonResult} />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
