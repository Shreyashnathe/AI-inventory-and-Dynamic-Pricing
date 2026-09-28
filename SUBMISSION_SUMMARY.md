# StockPulse - AI Inventory & Dynamic Pricing Engine - Submission Summary

## Project Overview

I have successfully completed the StockPulse AI Inventory & Dynamic Pricing Engine hackathon project. The solution implements an autonomous agentic recommendation loop that automatically detects inventory signals and provides AI-powered recommendations for dynamic pricing and inventory replenishment.

## Key Features Implemented

### Backend (Java Spring Boot 3.x)
1. **Domain Models**:
   - Product entity with state machine (ACTIVE → PRICE_REVIEW_PENDING → OUT_OF_STOCK)
   - PricingSuggestion and ReorderSuggestion entities with explicit state management
   - Extension points for future sprint features (costPrice, marginFloor, supplierId)

2. **Pluggable Commerce Engine**:
   - Strategy pattern implementation with RuleBased and AI-powered strategies
   - Runtime strategy switching without application restart
   - Unified interface for both pricing and reorder recommendations

3. **AI Commerce Advisor**:
   - Integration with Qwen-Cursor LLM via Zycus LiteLLM proxy
   - Trigger-specific prompt engineering for inventory-low and demand-spike scenarios
   - Robust error handling with deterministic fallbacks
   - Sanity bounds validation for AI recommendations

4. **Agentic Recommendation Loop**:
   - Event-driven architecture using Spring's @Async and AFTER_COMMIT transaction phase
   - Automatic detection of inventory-low and demand-spike triggers
   - Idempotency protection to prevent duplicate suggestions
   - Zero-downtime operation with immediate response to client requests

5. **REST API**:
   - Complete CRUD operations for products
   - Order and stock level simulation endpoints
   - On-demand pricing and reorder suggestion generation
   - Suggestion acceptance/rejection workflow
   - Runtime strategy switching capability
   - SSE token streaming for real-time AI reasoning (Bonus feature)

### Frontend (React 18 with Vite)
1. **Merchandising Console**:
   - Real-time dashboard showing product catalog and stock health
   - Approval queue displaying pending AI suggestions with confidence metrics
   - Visual indicators for trigger reasons (inventory-low vs demand-spike)
   - Interactive controls for simulating sales and stock updates

2. **User Experience**:
   - Modern dark theme with responsive design
   - Real-time updates via polling
   - Visual feedback for all user actions
   - Modal dialogs for AI reasoning streaming and stock updates
   - Strategy toggle for switching between AI and rule-based engines

3. **Technical Implementation**:
   - Component-based architecture following Material Kit React patterns
   - React hooks for state management
   - Vite for fast development and production builds
   - Lucide React icons for consistent visual language

## Architecture Highlights

1. **Clean Separation of Concerns**:
   - Strategy pattern isolates commerce logic from orchestration services
   - Event-driven architecture decouples signal detection from recommendation generation
   - Repository pattern for data access abstraction

2. **Robustness & Resilience**:
   - Multi-layer LLM error handling with graceful fallbacks
   - Idempotency protection in agentic loop
   - Transaction boundaries properly managed with AFTER_COMMIT semantics
   - Input validation at DTO and entity levels

3. **Extensibility**:
   - Sprint 2/3 seams built into current implementation
   - Well-defined interfaces allowing new strategies without modifying existing code
   - Extension fields pre-wired in entity models

## Files Created/Modified

1. **Documentation**:
   - Comprehensive README.md with installation guide, architecture diagrams, and usage instructions
   - ADR.md documenting all major architectural decisions

2. **Backend**:
   - Complete Spring Boot application with all required endpoints
   - H2 in-memory database for rapid development
   - Maven build configuration

3. **Frontend**:
   - React application with Material Kit-inspired structure
   - Responsive UI with real-time updates
   - Component library for reusable UI elements

## Installation Instructions

### Prerequisites
- Java 21 LTS
- Node.js 18+
- Git CLI

### Backend
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Demo Scenarios

1. **Inventory-Low Trigger**: Pre-seeded Product PRD-003 demonstrates automatic suggestions when stock falls below threshold
2. **Demand-Spike Trigger**: Product PRD-008 shows how viral demand automatically generates recommendations
3. **Strategy Switching**: Toggle between AI-powered and rule-based engines at runtime
4. **AI Reasoning Streaming**: Real-time token streaming shows AI decision-making process

## Technical Debt & Future Improvements

1. Enhanced UI polish and animations
2. Additional charting and analytics features
3. Persistent database configuration for production deployment
4. User authentication and role-based access control
5. Advanced filtering and search capabilities in the catalog view

This implementation successfully addresses all requirements outlined in the hackathon brief while maintaining professional code quality standards.