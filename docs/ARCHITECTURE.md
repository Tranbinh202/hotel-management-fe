# Project Architecture

## Overview
This is a hotel management system built with Next.js 14, TypeScript, and React Query. The project follows a clean architecture pattern with clear separation of concerns.

## Directory Structure

\`\`\`
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard pages
│   ├── login/               # Authentication pages
│   └── page.tsx             # Public homepage
├── components/
│   ├── features/            # Feature-specific components
│   │   ├── amenities/       # Amenity management components
│   │   ├── auth/            # Authentication components
│   │   └── dashboard/       # Dashboard components
│   ├── layout/              # Layout components (Header, Footer, Sidebar)
│   ├── providers/           # Context providers and guards
│   ├── shared/              # Reusable UI components
│   └── ui/                  # Base UI components (shadcn)
├── lib/
│   ├── api/                 # API client and endpoints
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
└── public/                  # Static assets

\`\`\`

## Key Patterns

### 1. API Layer
- Centralized API client with automatic token refresh
- Type-safe API functions
- Consistent error handling

### 2. State Management
- React Query for server state
- React Context for auth state
- Local state for UI interactions

### 3. Component Organization
- **Shared Components**: Reusable across features (DataTable, Modal, SearchBar)
- **Feature Components**: Business logic specific (AmenityForm, LoginForm)
- **Layout Components**: Page structure (Header, Footer, Sidebar)

### 4. Type Safety
- Centralized type definitions in `lib/types/api.ts`
- Strict TypeScript configuration
- Type inference from API responses

### 5. Authentication
- JWT-based authentication
- Automatic token refresh
- Route guards for protected pages
- Role-based access control

## Best Practices

1. **Always read files before editing** to understand current implementation
2. **Use shared components** instead of duplicating code
3. **Leverage React Query hooks** for data fetching and mutations
4. **Follow the established patterns** for consistency
5. **Keep components focused** on single responsibility
