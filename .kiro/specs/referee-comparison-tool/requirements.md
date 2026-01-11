# Requirements Document

## Introduction

The Referee is a web-based decision-comparison tool that helps users choose between technical options (APIs, cloud services, tech stacks, etc.) by presenting balanced trade-offs instead of single recommendations. The system uses Grok AI to generate structured comparisons based on user-provided options and constraints.

## Glossary

- **Comparison_Engine**: The backend service that orchestrates comparison requests, communicates with Grok AI, and stores results
- **Grok_AI**: The AI service used to generate structured comparisons between technical options
- **Option**: A technical choice being compared (e.g., AWS vs Azure, React vs Vue)
- **Constraint**: A factor the user cares about (e.g., cost, scalability, ease of use, performance)
- **Trade_Off**: A balanced explanation of advantages and disadvantages for each option
- **Comparison_Result**: The structured output containing pros, cons, and trade-offs for all options
- **Frontend_App**: The React-based web interface for user interaction
- **Backend_API**: The Express.js REST API handling requests and data persistence
- **Database**: PostgreSQL storage for comparison requests and results

## Requirements

### Requirement 1: Submit Comparison Request

**User Story:** As a user, I want to submit multiple technical options along with my constraints, so that I can receive a balanced comparison.

#### Acceptance Criteria

1. WHEN a user submits a comparison request with at least two options and at least one constraint, THE Comparison_Engine SHALL accept the request and initiate processing
2. WHEN a user submits a comparison request with fewer than two options, THE Comparison_Engine SHALL reject the request with a validation error
3. WHEN a user submits a comparison request with no constraints, THE Comparison_Engine SHALL reject the request with a validation error
4. THE Frontend_App SHALL provide an input form with fields for options (minimum 2) and constraints (minimum 1)
5. THE Frontend_App SHALL validate inputs before submission and display appropriate error messages

### Requirement 2: Generate AI-Powered Comparison

**User Story:** As a user, I want the system to use AI to generate a structured comparison, so that I receive expert-level analysis of my options.

#### Acceptance Criteria

1. WHEN a valid comparison request is received, THE Comparison_Engine SHALL send a structured prompt to Grok_AI
2. THE Comparison_Engine SHALL construct prompts that instruct Grok_AI to compare options side-by-side
3. THE Comparison_Engine SHALL construct prompts that explicitly request trade-offs without declaring a "best" option
4. THE Comparison_Engine SHALL construct prompts that phrase output as a neutral referee
5. WHEN Grok_AI returns a response, THE Comparison_Engine SHALL normalize the response into a structured format
6. IF Grok_AI fails to respond or returns an error, THEN THE Comparison_Engine SHALL return an appropriate error message to the user

### Requirement 3: Display Comparison Results

**User Story:** As a user, I want to view the comparison results in a clear, structured format, so that I can easily understand the trade-offs.

#### Acceptance Criteria

1. WHEN a comparison is complete, THE Frontend_App SHALL display results in a table format showing side-by-side comparison
2. THE Frontend_App SHALL display pros and cons for each option as bullet points
3. THE Frontend_App SHALL display trade-offs that explain when each option is preferable
4. THE Frontend_App SHALL present information neutrally without highlighting a "winner"
5. THE Frontend_App SHALL use a clean, minimal UI design with Tailwind CSS and shadcn/ui components

### Requirement 4: Persist Comparison Data

**User Story:** As a system operator, I want comparison requests and results stored in a database, so that data is preserved and can be retrieved.

#### Acceptance Criteria

1. WHEN a comparison request is submitted, THE Comparison_Engine SHALL store the request inputs (options and constraints) in the Database
2. WHEN a comparison result is generated, THE Comparison_Engine SHALL store the AI-generated output in the Database
3. THE Database SHALL use PostgreSQL as the storage engine
4. THE Comparison_Engine SHALL associate each result with its original request

### Requirement 5: Health Check and Connectivity

**User Story:** As a system operator, I want health check endpoints, so that I can verify all system connections are working.

#### Acceptance Criteria

1. THE Backend_API SHALL expose a GET /health endpoint
2. WHEN the health endpoint is called, THE Backend_API SHALL verify Database connectivity
3. WHEN the health endpoint is called, THE Backend_API SHALL verify Grok_AI API connectivity
4. THE Backend_API SHALL return status information for each connection check
5. THE Frontend_App SHALL be able to connect to the Backend_API

### Requirement 6: Docker Containerization

**User Story:** As a developer, I want the entire project to run via Docker Compose, so that no local installation is required.

#### Acceptance Criteria

1. THE system SHALL include a docker-compose.yml file at the project root
2. THE system SHALL define a Frontend container running the Vite React application
3. THE system SHALL define a Backend container running the Express.js API
4. THE system SHALL define a PostgreSQL container for the database
5. THE system SHALL configure proper networking between all containers
6. THE system SHALL use environment variables via .env files for configuration
7. THE system SHALL include a .env.example file documenting required variables
8. WHEN docker-compose up is executed, THE system SHALL start all services with proper connectivity

### Requirement 7: API Design

**User Story:** As a developer, I want a clean REST API design, so that the frontend can easily interact with the backend.

#### Acceptance Criteria

1. THE Backend_API SHALL expose POST /compare endpoint for submitting comparison requests
2. THE POST /compare endpoint SHALL accept options and constraints in the request body
3. THE POST /compare endpoint SHALL return a structured comparison result
4. THE Backend_API SHALL use JSON for request and response bodies
5. THE Backend_API SHALL return appropriate HTTP status codes for success and error cases

### Requirement 8: Environment Configuration

**User Story:** As a developer, I want sensitive configuration stored in environment variables, so that secrets are not committed to source control.

#### Acceptance Criteria

1. THE Backend_API SHALL read the Grok API key from environment variables
2. THE Backend_API SHALL read database connection details from environment variables
3. THE system SHALL NOT include actual API keys or secrets in source code
4. THE system SHALL include a .env.example file with placeholder values
