# The Referee - Decision Comparison Tool

A web-based decision-comparison tool that helps users choose between technical options (APIs, cloud services, tech stacks, etc.) by presenting balanced trade-offs instead of single recommendations. Powered by Grok AI.

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

### Components

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL 15
- **AI**: Grok AI for generating neutral comparisons

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Grok API key (obtain from [xAI](https://x.ai/))

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd referee-comparison-tool
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Grok API key:
   ```
   GROK_API_KEY=your_actual_api_key_here
   ```

4. Start all services:
   ```bash
   docker-compose up --build
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## Environment Variables

| Variable | Service | Description | Default |
|----------|---------|-------------|---------|
| `GROK_API_KEY` | backend | API key for Grok AI | (required) |
| `DATABASE_URL` | backend | PostgreSQL connection string | `postgresql://user:pass@db:5432/referee` |
| `POSTGRES_USER` | db | Database username | `user` |
| `POSTGRES_PASSWORD` | db | Database password | `pass` |
| `POSTGRES_DB` | db | Database name | `referee` |
| `VITE_API_URL` | frontend | Backend API URL | `http://localhost:3000` |

## API Endpoints

### POST /compare

Submit a comparison request.

**Request:**
```json
{
  "options": ["AWS Lambda", "Google Cloud Functions"],
  "constraints": ["cost", "cold start time", "language support"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "options": [
    {
      "name": "AWS Lambda",
      "pros": ["Mature ecosystem", "Wide language support"],
      "cons": ["Complex pricing", "Cold starts"],
      "scores": {
        "cost": "Pay-per-use, can be cost-effective for sporadic workloads",
        "cold start time": "100-500ms typical",
        "language support": "Excellent - supports Node.js, Python, Java, Go, etc."
      }
    }
  ],
  "tradeOffs": [
    {
      "scenario": "When you need tight AWS integration",
      "recommendation": "Consider AWS Lambda because of native service integrations"
    }
  ],
  "createdAt": "2025-01-11T12:00:00Z"
}
```

### GET /health

Check system health and connectivity.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "grokApi": "connected",
  "timestamp": "2025-01-11T12:00:00Z"
}
```

## Usage Examples

### Example 1: Comparing Cloud Providers

**Options:**
- AWS
- Google Cloud Platform
- Microsoft Azure

**Constraints:**
- Cost for small startups
- Machine learning capabilities
- Global availability

### Example 2: Comparing Frontend Frameworks

**Options:**
- React
- Vue.js
- Angular

**Constraints:**
- Learning curve
- Community support
- Performance
- TypeScript integration

### Example 3: Comparing Databases

**Options:**
- PostgreSQL
- MongoDB
- MySQL

**Constraints:**
- ACID compliance
- Horizontal scaling
- Query flexibility
- Operational complexity

## Development

### Running Locally (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Project Structure

```
referee-comparison-tool/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript types
│   └── Dockerfile
├── backend/                  # Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers (prompt builder, normalizer)
│   │   ├── middleware/      # Validation middleware
│   │   └── db/              # Database connection
│   └── Dockerfile
├── docker-compose.yml        # Container orchestration
├── .env.example              # Environment template
└── README.md                 # This file
```

## Design Principles

### Neutrality

The Referee never declares a "winner". Instead, it presents:
- **Pros and Cons** for each option
- **Trade-offs** that explain when each option is preferable
- **Scores** against each constraint

This approach empowers users to make informed decisions based on their specific context.

### Why Grok AI?

Grok AI was chosen because:
1. High-quality, nuanced responses for technical comparisons
2. Ability to follow structured prompting for neutral analysis
3. Handles complex multi-factor analysis effectively

## Troubleshooting

### Common Issues

**Database connection failed:**
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check database credentials in `.env`

**Grok API errors:**
- Verify `GROK_API_KEY` is set correctly
- Check API key validity and rate limits

**Frontend can't reach backend:**
- Ensure backend is running on port 3000
- Check `VITE_API_URL` environment variable

### Logs

View container logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## License

MIT
