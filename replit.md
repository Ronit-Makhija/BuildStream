# Overview

TimeTracker Pro is a full-stack web application for professional timesheet management. It's built as a modern React application with an Express.js backend, designed to help employees track their daily tasks and hours while providing administrators with oversight capabilities. The application features role-based access control, task entry forms, timesheet submission workflows, and comprehensive reporting dashboards.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 using TypeScript and follows a modern component-based architecture. It uses Vite as the build tool for fast development and optimized production builds. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface elements. TailwindCSS handles styling with a comprehensive design system including dark mode support.

State management is handled through TanStack Query (React Query) for server state management and caching, eliminating the need for additional state management libraries. Form handling uses React Hook Form with Zod for validation, providing type-safe form interactions.

Routing is implemented with Wouter, a lightweight client-side router. The application includes protected routes that redirect unauthenticated users to the login page.

## Backend Architecture
The backend uses Express.js with TypeScript in ESM module format. It follows a RESTful API design pattern with clear separation of concerns across authentication, routing, storage, and database layers.

Authentication is implemented using Passport.js with local strategy and session-based authentication. Password hashing uses Node.js crypto module with scrypt for secure password storage. Sessions are stored in PostgreSQL using connect-pg-simple.

The API layer provides endpoints for user authentication, task management, timesheet operations, and administrative functions. Error handling is centralized with consistent error responses across all endpoints.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema includes users, tasks, and timesheets tables with proper relationships and constraints.

Drizzle provides compile-time type safety and runtime validation, with schema definitions shared between frontend and backend through a shared module. Database migrations are managed through Drizzle Kit with automatic schema generation.

The Neon serverless PostgreSQL driver is used for database connectivity, providing connection pooling and WebSocket support for optimal performance.

## Authentication and Authorization
The system implements role-based access control with two user roles: employee and admin. Session-based authentication provides secure user sessions with configurable session storage in PostgreSQL.

Protected routes on the frontend ensure unauthorized users cannot access application features. The backend validates authentication on all protected endpoints and enforces role-based permissions for administrative functions.

Password security follows best practices with salted hashing using scrypt and timing-safe comparison to prevent timing attacks.

## Design System and UI Components
The application uses a comprehensive design system built on shadcn/ui components, providing consistent styling and behavior across the interface. The design system includes:

- Customizable color tokens supporting light and dark themes
- Responsive grid layouts and spacing system
- Accessible form components with proper validation states
- Interactive elements like dialogs, tooltips, and dropdown menus
- Data display components including tables, cards, and badges

The component library is fully typed with TypeScript and follows React best practices for composition and reusability.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with WebSocket support for real-time connections
- **PostgreSQL**: Primary database engine for data persistence and session storage

## UI and Styling
- **Radix UI**: Headless UI components providing accessibility and keyboard navigation
- **shadcn/ui**: Pre-built component library with consistent design patterns
- **TailwindCSS**: Utility-first CSS framework for responsive design and theming
- **Lucide React**: Icon library providing consistent iconography

## Development and Build Tools
- **Vite**: Frontend build tool with hot module replacement and optimized production builds
- **TypeScript**: Type safety across frontend and backend codebases
- **Drizzle Kit**: Database migration and schema management tools
- **ESBuild**: JavaScript bundler for backend production builds

## Authentication and Security
- **Passport.js**: Authentication middleware with local strategy support
- **connect-pg-simple**: PostgreSQL session store for secure session management
- **Node.js Crypto**: Built-in cryptographic functions for password hashing

## State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with performance optimization
- **Zod**: Runtime type validation and schema definition

## Utilities and Helpers
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional CSS class name generation
- **nanoid**: Unique ID generation for database records