# Implementation Plan: Referee Comparison Tool

## Overview

This plan implements a decision-comparison tool using React frontend, Express.js backend, PostgreSQL database, and Grok AI integration, all containerized with Docker. Tasks are ordered to build incrementally with early validation of core functionality.

## Tasks

- [x] 1. Set up project structure and Docker configuration
  - [x] 1.1 Create root project structure with frontend/, backend/, and configuration files
    - Create directory structure as specified in design
    - Initialize .env.example with all required variables
    - _Requirements: 6.1, 6.7, 8.4_
  - [x] 1.2 Create docker-compose.yml with all three services
    - Define frontend, backend, and db services
    - Configure networking between containers
    - Set up volume for PostgreSQL data persistence
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 1.3 Create Dockerfile for backend service
    - Use Node.js base image
    - Copy source and install dependencies
    - Expose port 3000
    - _Requirements: 6.3_
  - [x] 1.4 Create Dockerfile for frontend service
    - Use Node.js base image for Vite
    - Configure for development with hot reload
    - Expose port 5173
    - _Requirements: 6.2_

- [x] 2. Implement backend core infrastructure
  - [x] 2.1 Initialize backend Node.js project with TypeScript and Express
    - Set up package.json with required dependencies
    - Configure TypeScript compilation
    - Create basic Express app structure
    - _Requirements: 7.4_
  - [x] 2.2 Implement PostgreSQL database connection and schema
    - Create database connection module using pg library
    - Implement schema initialization (comparisons and comparison_results tables)
    - Add connection error handling
    - _Requirements: 4.3, 4.1, 4.2_
  - [x] 2.3 Implement health check endpoint
    - Create GET /health route
    - Verify database connectivity
    - Verify Grok API connectivity (ping test)
    - Return structured health response
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3. Implement Grok AI integration
  - [x] 3.1 Create Grok API service module
    - Implement Grok API client using environment variable for API key
    - Add retry logic with exponential backoff
    - Handle API errors gracefully
    - _Requirements: 2.1, 2.6, 8.1_
  - [x] 3.2 Implement prompt builder for neutral referee comparisons
    - Build structured prompt including all options and constraints
    - Include instructions for side-by-side comparison
    - Enforce neutral language (no "winner" declaration)
    - Request JSON output format
    - _Requirements: 2.2, 2.3, 2.4_
  - [x] 3.3 Implement response normalizer
    - Parse JSON from Grok response
    - Validate required fields (options, pros, cons, tradeOffs)
    - Handle malformed responses gracefully
    - _Requirements: 2.5_

- [x] 4. Implement comparison API endpoint
  - [x] 4.1 Create input validation middleware
    - Validate minimum 2 options
    - Validate minimum 1 constraint
    - Validate non-empty strings
    - Return appropriate error messages
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 4.2 Implement POST /compare endpoint
    - Accept options and constraints in request body
    - Store request in database
    - Call Grok service with constructed prompt
    - Normalize and store result
    - Return structured comparison response
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 4.1, 4.2, 4.4_
  - [x] 4.3 Implement comparison service business logic
    - Orchestrate the comparison flow
    - Handle errors at each step
    - Ensure data consistency
    - _Requirements: 2.1, 4.4_

- [x] 5. Checkpoint - Verify backend functionality
  - Ensure backend starts without errors
  - Verify database connection via health endpoint
  - Verify Grok API connection via health endpoint
  - Test POST /compare with sample data

- [x] 6. Implement frontend infrastructure
  - [x] 6.1 Initialize React project with Vite and TypeScript
    - Create Vite React TypeScript project
    - Configure Tailwind CSS
    - Set up shadcn/ui components
    - _Requirements: 3.5_
  - [x] 6.2 Create TypeScript types for comparison data
    - Define ComparisonRequest interface
    - Define ComparisonResponse interface
    - Define OptionAnalysis and TradeOff interfaces
    - _Requirements: 7.2, 7.3_
  - [x] 6.3 Implement API service module
    - Create fetch wrapper for backend API
    - Implement postCompare function
    - Implement getHealth function
    - Handle network errors
    - _Requirements: 5.5_

- [x] 7. Implement frontend UI components
  - [x] 7.1 Create ComparisonForm component
    - Input fields for options (dynamic add/remove)
    - Input fields for constraints (dynamic add/remove)
    - Client-side validation with error messages
    - Submit button with loading state
    - _Requirements: 1.4, 1.5_
  - [x] 7.2 Create ComparisonResult component
    - Table layout for side-by-side option comparison
    - Display scores for each constraint
    - Clean, minimal design
    - _Requirements: 3.1, 3.4, 3.5_
  - [x] 7.3 Create TradeOffList component
    - Bullet-point list of trade-offs
    - Scenario and recommendation format
    - Neutral presentation without highlighting winners
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 7.4 Create ProsCons component
    - Display pros as green-tinted bullets
    - Display cons as red-tinted bullets
    - Balanced visual presentation
    - _Requirements: 3.2, 3.4_

- [x] 8. Implement frontend pages and routing
  - [x] 8.1 Create HomePage with ComparisonForm
    - Landing page with form
    - Handle form submission
    - Navigate to results on success
    - _Requirements: 1.4_
  - [x] 8.2 Create ResultPage with comparison display
    - Fetch and display comparison result
    - Show ComparisonResult table
    - Show TradeOffList below table
    - Show ProsCons for each option
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 8.3 Wire up App routing and state management
    - Configure React Router
    - Manage comparison state between pages
    - Handle loading and error states
    - _Requirements: 3.1_

- [x] 9. Checkpoint - Verify full stack connectivity
  - Ensure docker-compose up starts all services
  - Verify frontend can reach backend API
  - Verify end-to-end comparison flow works
  - Check all connections via health endpoint

- [x] 10. Create documentation and finalize
  - [x] 10.1 Create comprehensive README.md
    - Architecture diagram
    - Docker setup instructions
    - Environment variable documentation
    - Usage examples
    - _Requirements: Documentation requirement_
  - [x] 10.2 Add inline code comments
    - Document why Grok is used
    - Explain trade-off enforcement in prompts
    - Note how Kiro accelerated development
    - _Requirements: Documentation requirement_
  - [x] 10.3 Finalize .env.example and .gitignore
    - Ensure all variables documented
    - Ensure .kiro folder is NOT gitignored
    - Ensure secrets are gitignored
    - _Requirements: 8.3, 8.4_

- [x] 11. Final checkpoint - Production readiness
  - Verify all Docker containers start correctly
  - Verify all API endpoints respond correctly
  - Verify UI displays comparison results properly
  - Ensure code is clean and production-readable

## Notes

- No authentication is implemented per project constraints
- No automated tests are implemented per project constraints
- Focus is on clarity, connectivity, and correctness
- All services run via Docker Compose with no local installation required
