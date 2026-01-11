# Design Document: Referee Comparison Tool

## Overview

The Referee is a decision-comparison tool that leverages Grok AI to provide balanced, neutral comparisons between technical options. The system follows a three-tier architecture with a React frontend, Express.js backend, and PostgreSQL database, all containerized with Docker.

The key design principle is **neutrality**: the system never declares a "winner" but instead presents trade-offs that help users make informed decisions based on their specific context.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Frontend   │    │   Backend    │    │  PostgreSQL  │      │
│  │   (React)    │───▶│  (Express)   │───▶│   Database   │      │
│  │   Port 5173  │    │   Port 3000  │    │   Port 5432  │      │
│  └──────────────┘    └──────┬───────┘    └──────────────┘      │
│                             │                                   │
│                             ▼                                   │
│                      ┌──────────────┐                          │
│                      │   Grok AI    │                          │
│                      │   (External) │                          │
│                      └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User enters options and constraints in the Frontend
2. Frontend validates input and sends POST /compare to Backend
3. Backend validates request and stores it in PostgreSQL
4. Backend constructs a neutral "referee" prompt and sends to Grok AI
5. Grok AI returns structured comparison
6. Backend normalizes response and stores result in PostgreSQL
7. Backend returns comparison result to Frontend
8. Frontend displays results in table format with trade-offs

## Components and Interfaces

### Frontend Components

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ComparisonForm.tsx    # Input form for options/constraints
│   │   ├── ComparisonResult.tsx  # Results display with table
│   │   └── TradeOffList.tsx      # Bullet-point trade-offs
│   ├── pages/
│   │   ├── HomePage.tsx     # Landing with form
│   │   └── ResultPage.tsx   # Comparison results view
│   ├── services/
│   │   └── api.ts           # Backend API client
│   ├── types/
│   │   └── comparison.ts    # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── Dockerfile
└── package.json
```

### Backend Components

```
backend/
├── src/
│   ├── controllers/
│   │   ├── comparisonController.ts  # Handle comparison requests
│   │   └── healthController.ts      # Health check logic
│   ├── services/
│   │   ├── grokService.ts           # Grok AI integration
│   │   └── comparisonService.ts     # Business logic
│   ├── models/
│   │   └── comparison.ts            # Database models
│   ├── routes/
│   │   └── index.ts                 # Route definitions
│   ├── utils/
│   │   └── promptBuilder.ts         # Grok prompt construction
│   ├── db/
│   │   └── index.ts                 # PostgreSQL connection
│   ├── app.ts
│   └── server.ts
├── Dockerfile
└── package.json
```

### API Interfaces

#### POST /compare

Request:
```typescript
interface ComparisonRequest {
  options: string[];      // Minimum 2 options
  constraints: string[];  // Minimum 1 constraint
}
```

Response:
```typescript
interface ComparisonResponse {
  id: string;
  options: OptionAnalysis[];
  tradeOffs: TradeOff[];
  createdAt: string;
}

interface OptionAnalysis {
  name: string;
  pros: string[];
  cons: string[];
  scores: Record<string, string>;  // constraint -> rating
}

interface TradeOff {
  scenario: string;      // "When you need..."
  recommendation: string; // "Consider X because..."
}
```

#### GET /health

Response:
```typescript
interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  grokApi: 'connected' | 'disconnected';
  timestamp: string;
}
```

## Data Models

### PostgreSQL Schema

```sql
-- Comparison requests table
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  options TEXT[] NOT NULL,
  constraints TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comparison results table
CREATE TABLE comparison_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id UUID REFERENCES comparisons(id),
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### TypeScript Interfaces

```typescript
// Shared types between frontend and backend
interface Comparison {
  id: string;
  options: string[];
  constraints: string[];
  createdAt: Date;
}

interface ComparisonResult {
  id: string;
  comparisonId: string;
  result: {
    options: OptionAnalysis[];
    tradeOffs: TradeOff[];
  };
  createdAt: Date;
}
```

## Grok AI Integration

### Why Grok AI?

Grok AI is used because:
1. It provides high-quality, nuanced responses for technical comparisons
2. It can follow structured prompting to maintain neutrality
3. It handles complex multi-factor analysis well

### Prompt Strategy

The prompt is designed to enforce neutral "referee" behavior:

```typescript
function buildComparisonPrompt(options: string[], constraints: string[]): string {
  return `
You are a neutral technical referee. Compare the following options without declaring a winner.

OPTIONS TO COMPARE:
${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}

CONSTRAINTS TO EVALUATE:
${constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

INSTRUCTIONS:
1. Analyze each option against ALL constraints
2. List specific pros and cons for each option
3. DO NOT declare a "best" or "winner"
4. Provide trade-off scenarios: "If you prioritize X, consider Y because..."
5. Be factual and balanced

OUTPUT FORMAT (JSON):
{
  "options": [
    {
      "name": "option name",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"],
      "scores": { "constraint1": "rating/explanation" }
    }
  ],
  "tradeOffs": [
    {
      "scenario": "When you need...",
      "recommendation": "Consider X because..."
    }
  ]
}
`;
}
```

### Response Normalization

The backend normalizes Grok responses to ensure consistent structure:

```typescript
function normalizeGrokResponse(raw: string): ComparisonResult {
  // Parse JSON from response
  // Validate required fields exist
  // Ensure no "winner" language is present
  // Return structured result
}
```

## Docker Configuration

### docker-compose.yml Structure

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/referee
      - GROK_API_KEY=${GROK_API_KEY}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=referee
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| GROK_API_KEY | backend | API key for Grok AI |
| DATABASE_URL | backend | PostgreSQL connection string |
| VITE_API_URL | frontend | Backend API URL |
| POSTGRES_USER | db | Database username |
| POSTGRES_PASSWORD | db | Database password |
| POSTGRES_DB | db | Database name |



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Input Validation Correctness

*For any* comparison request, the system should accept requests with 2+ options AND 1+ constraints, and reject requests that violate either condition with appropriate validation errors.

**Validates: Requirements 1.1, 1.2, 1.3, 1.5**

### Property 2: Prompt Construction Completeness

*For any* set of options and constraints, the constructed Grok prompt should contain all provided options, all provided constraints, and instructions for neutral referee behavior (no "winner" declaration).

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 3: Response Normalization Consistency

*For any* valid JSON response from Grok AI containing options and trade-offs, normalizing the response should produce a structured result with all options preserved and trade-offs intact.

**Validates: Requirements 2.5**

### Property 4: Data Persistence Round-Trip

*For any* valid comparison request, storing it in the database and retrieving it should return equivalent options and constraints. Similarly, storing a result and retrieving it should return the same structured comparison data.

**Validates: Requirements 4.1, 4.2, 4.4**

### Property 5: API Contract Compliance

*For any* valid comparison request to POST /compare, the API should return a 200 status with a structured response containing options analysis and trade-offs. For any invalid request, the API should return a 400 status with an error message.

**Validates: Requirements 7.2, 7.3, 7.5**

## Error Handling

### Frontend Error Handling

| Error Type | Handling Strategy |
|------------|-------------------|
| Validation errors | Display inline error messages next to invalid fields |
| Network errors | Show toast notification with retry option |
| API errors (4xx) | Display user-friendly error message from response |
| API errors (5xx) | Show generic "service unavailable" message |

### Backend Error Handling

| Error Type | HTTP Status | Response |
|------------|-------------|----------|
| Invalid input | 400 | `{ error: "validation_error", message: "..." }` |
| Grok API failure | 502 | `{ error: "ai_service_error", message: "..." }` |
| Database error | 500 | `{ error: "internal_error", message: "..." }` |
| Rate limiting | 429 | `{ error: "rate_limited", message: "..." }` |

### Grok AI Error Recovery

```typescript
async function callGrokWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await grokClient.complete(prompt);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(1000 * attempt); // Exponential backoff
    }
  }
}
```

## Testing Strategy

### Dual Testing Approach

The system uses both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all valid inputs

### Property-Based Testing Configuration

- **Library**: fast-check (for TypeScript/JavaScript)
- **Minimum iterations**: 100 per property test
- **Tag format**: `Feature: referee-comparison-tool, Property {number}: {property_text}`

### Test Categories

#### Unit Tests (Examples & Edge Cases)
- Health endpoint returns correct structure
- POST /compare endpoint exists and accepts JSON
- Empty string options are rejected
- Whitespace-only constraints are rejected
- Grok API timeout handling

#### Property Tests (Universal Properties)
- Input validation correctness (Property 1)
- Prompt construction completeness (Property 2)
- Response normalization consistency (Property 3)
- Data persistence round-trip (Property 4)
- API contract compliance (Property 5)

### Test File Structure

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── validation.test.ts      # Property 1
│   │   ├── promptBuilder.test.ts   # Property 2
│   │   ├── normalizer.test.ts      # Property 3
│   │   ├── persistence.test.ts     # Property 4
│   │   └── api.test.ts             # Property 5
```

Note: Per project constraints, tests are NOT to be implemented. This section documents the testing strategy for future reference.
