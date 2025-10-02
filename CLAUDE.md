# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MagTrack is a NestJS-based backend API for agricultural crop tracking and management. The application allows users (producers) to track their lots (crop batches) through different growth stages, monitor environmental conditions, manage nutrient applications, and share lot data publicly.

## Commands

### Development
- `yarn install` - Install dependencies
- `yarn run start:dev` - Start development server with hot reload (port 3000)
- `yarn run start` - Start production server
- `yarn run build` - Build the application

### Testing
- `yarn run test` - Run unit tests
- `yarn run test:watch` - Run tests in watch mode
- `yarn run test:cov` - Run tests with coverage
- `yarn run test:e2e` - Run end-to-end tests

### Code Quality
- `yarn run lint` - Run ESLint with auto-fix
- `yarn run format` - Format code with Prettier

### Database
- `docker compose up` - Start MariaDB database (port 3306)
- Database: `magtrack`, User: `root`, Password: `root`

## Architecture

### Core Domain Entities

**Lot (Crop Batch)**: Central entity representing a batch of crops
- Tracks growth stages: Croissance → Floraison → Sechage → Maturation → Stockage
- Associated with User, Variete, and multiple EnvironnementLot records
- Can have LotAction records for tracking activities
- Can be shared publicly via ShareLots

**User**: Represents producers/farmers
- Roles: producteur (default), admin, technicien
- Owns multiple Lots and Environnements

**Environnement**: Physical growing environments (e.g., greenhouses, fields)
- Types: culture, sechage, stockage, maturation
- Tracks ConditionEnvironnementale (temperature, humidity) over time

**EnvironnementLot**: Junction table linking Lots to Environnements with time periods
- Tracks when a lot enters/exits an environment
- Records the cultivation stage (etape)

### Key Services

**LotsService** (`src/lots/lots.service.ts`): Core business logic for lot management
- CRUD operations for lots and actions
- Stage progression and environment transfers
- Access control validation

**PublicService** (`src/public/public.service.ts`): Handles public lot sharing
- Anonymous access to shared lots via UUID
- Calculates average environmental conditions by growth stage
- Provides stage timeline data

**EnvironmentsService**: Manages physical growing environments and environmental data

### Authentication & Security

- JWT-based authentication using cookies (token stored in `token` cookie)
- **AuthGuard** (`src/auth/auth.guard.ts`): Protects routes, extracts user from JWT
- **GlobalSanitizePipe** (`src/pipe/GlobalSanitizePipe.ts`): Input validation and sanitization using class-validator/class-sanitizer
- Access control: Users can only access their own lots (userId validation in services)

### Database Configuration

- **TypeORM** with MariaDB
- **Synchronize: true** (development only - auto-creates/updates schema)
- Entities defined in `src/entities/` with `entitie.` prefix
- Raw SQL queries used for complex data aggregation (see PublicService)

### API Structure

- **Module-based architecture**: Each domain has its own module (AuthModule, LotsModule, etc.)
- **Guards**: JWT authentication required for most endpoints
- **DTOs**: Input validation using class-validator decorators
- **CORS**: Configured for `http://localhost:3001` (frontend)

### Key Patterns

1. **Environment Transitions**: When lots move between environments, new EnvironnementLot records are created
2. **Stage Progression**: LotAction records with `type: 'stage'` track growth stage changes
3. **Public Sharing**: ShareLots generates UUIDs for anonymous access to lot data
4. **Nutrient Tracking**: NutrimentAction records track fertilizer applications per LotAction

### Modified Files (Current Session)
- `src/environments/environments.service.ts`
- `src/public/public.controller.ts`
- `src/public/public.service.ts`

Recent commits show work on public lot sharing and average condition calculations.
- Pour les endpoint non public si il est possible toujours verifier l'utilisateur et si la choses qu'il demande lui appartient bien