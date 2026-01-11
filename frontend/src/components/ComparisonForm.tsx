/**
 * ComparisonForm Component
 * 
 * The main input form for The Referee application. Users enter:
 * - Options: Technical choices to compare (minimum 2 required)
 * - Constraints: Factors to evaluate against (minimum 1 required)
 * 
 * The form validates inputs client-side before submission and provides
 * dynamic add/remove functionality for both options and constraints.
 * 
 * Design Principle: The form is intentionally simple and focused,
 * following the "neutral referee" philosophy - we don't bias users
 * toward any particular option or constraint.
 * 
 * Requirements: 1.4, 1.5
 */

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import type { ComparisonRequest } from '@/types';

interface ComparisonFormProps {
  onSubmit: (request: ComparisonRequest) => Promise<void>;
  isLoading?: boolean;
}

interface FormErrors {
  options?: string;
  constraints?: string;
}

export function ComparisonForm({ onSubmit, isLoading = false }: ComparisonFormProps) {
  const [options, setOptions] = useState<string[]>(['', '']);
  const [constraints, setConstraints] = useState<string[]>(['']);
  const [errors, setErrors] = useState<FormErrors>({});

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    if (errors.options) {
      setErrors({ ...errors, options: undefined });
    }
  };

  const addConstraint = () => {
    setConstraints([...constraints, '']);
  };

  const removeConstraint = (index: number) => {
    if (constraints.length > 1) {
      setConstraints(constraints.filter((_, i) => i !== index));
    }
  };

  const updateConstraint = (index: number, value: string) => {
    const newConstraints = [...constraints];
    newConstraints[index] = value;
    setConstraints(newConstraints);
    if (errors.constraints) {
      setErrors({ ...errors, constraints: undefined });
    }
  };


  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Filter out empty strings and validate options
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      newErrors.options = 'Please provide at least 2 options to compare';
    }

    // Filter out empty strings and validate constraints
    const validConstraints = constraints.filter(c => c.trim() !== '');
    if (validConstraints.length < 1) {
      newErrors.constraints = 'Please provide at least 1 constraint';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    const validConstraints = constraints.filter(c => c.trim() !== '');

    await onSubmit({
      options: validOptions,
      constraints: validConstraints,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Compare Options</CardTitle>
        <CardDescription>
          Enter the technical options you want to compare and the constraints that matter to you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Options Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Options to Compare</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            {errors.options && (
              <p className="text-sm text-destructive">{errors.options}</p>
            )}
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1} (e.g., AWS, Azure, GCP)`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    disabled={isLoading}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Constraints Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Constraints / Factors</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addConstraint}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Constraint
              </Button>
            </div>
            {errors.constraints && (
              <p className="text-sm text-destructive">{errors.constraints}</p>
            )}
            <div className="space-y-2">
              {constraints.map((constraint, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Constraint ${index + 1} (e.g., cost, scalability, ease of use)`}
                    value={constraint}
                    onChange={(e) => updateConstraint(index, e.target.value)}
                    disabled={isLoading}
                  />
                  {constraints.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeConstraint(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Compare Options'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
