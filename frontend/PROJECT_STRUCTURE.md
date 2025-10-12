# PodcastAI Frontend - Project Structure

## Overview
This document outlines the comprehensive project structure for the PodcastAI frontend application. The structure follows modern React best practices and is designed for scalability, maintainability, and team collaboration.

## Directory Structure

```
podcastai-frontend/
├── .cursor/                          # Cursor IDE rules and configuration
│   └── rules/                        # Project-specific development rules
│       ├── always/                   # Always-applied rules
│       ├── auto-attached/            # Auto-applied rules for file patterns
│       ├── agent-requested/          # Agent-selectable rules
│       └── manual/                   # Manual rules for specific scenarios
├── memory-bank/                      # Project documentation and context
│   ├── projectbrief.md              # Project foundation and scope
│   ├── productContext.md            # Product vision and user experience
│   ├── systemPatterns.md            # Technical architecture and patterns
│   ├── techContext.md               # Technology stack and setup
│   ├── activeContext.md             # Current work focus and decisions
│   └── progress.md                  # Project status and milestones
├── public/                          # Static assets
│   └── vite.svg                     # Vite logo
├── src/                             # Source code
│   ├── components/                  # React components
│   │   ├── common/                  # Reusable common components
│   │   ├── podcast/                 # Podcast-specific components
│   │   ├── ai/                      # AI feature components
│   │   ├── layout/                  # Layout components (Header, Footer)
│   │   └── forms/                   # Form components
│   ├── services/                    # API services and external integrations
│   │   ├── apiClient.js            # Centralized API client configuration
│   │   ├── podcastService.js       # Podcast-related API calls
│   │   ├── aiService.js            # AI feature API calls
│   │   └── authService.js          # Authentication services
│   ├── hooks/                       # Custom React hooks
│   │   └── usePodcastPlayer.js     # Podcast player functionality
│   ├── contexts/                    # React Context providers
│   │   └── AuthContext.jsx         # Authentication state management
│   ├── pages/                       # Page components (routes)
│   │   ├── HomePage.jsx            # Landing page
│   │   ├── LoginPage.jsx           # User login
│   │   ├── RegisterPage.jsx        # User registration
│   │   ├── ProfilePage.jsx         # User profile
│   │   ├── PodcastPage.jsx         # Individual podcast view
│   │   └── NotFoundPage.jsx        # 404 error page
│   ├── utils/                       # Utility functions
│   │   ├── formatTime.js           # Time formatting utilities
│   │   └── validation.js           # Input validation functions
│   ├── constants/                   # Application constants
│   │   ├── apiEndpoints.js         # API endpoint definitions
│   │   └── appConstants.js         # App-wide constants and configuration
│   ├── assets/                      # Static assets
│   │   ├── images/                 # Image files
│   │   ├── icons/                  # Icon files
│   │   └── audio/                  # Audio files
│   ├── styles/                      # CSS styles
│   │   ├── components/             # Component-specific styles
│   │   └── pages/                  # Page-specific styles
│   ├── types/                       # TypeScript type definitions (future)
│   ├── App.jsx                     # Main App component
│   ├── App.css                     # Global styles
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Base styles
├── .env.example                    # Environment variables template
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Dependency lock file
├── PROJECT_STRUCTURE.md            # This file
├── README.md                       # Project documentation
└── vite.config.js                  # Vite configuration
```

## Key Architectural Decisions

### 1. **Component Organization**
- **Feature-based grouping**: Components are organized by feature (podcast, ai, layout, etc.)
- **Separation of concerns**: Layout, business logic, and presentation are clearly separated
- **Reusability**: Common components are placed in a dedicated directory

### 2. **Service Layer Architecture**
- **Centralized API client**: Single axios instance with interceptors for auth and error handling
- **Service separation**: Each domain (podcast, AI, auth) has its own service module
- **Consistent error handling**: All services return standardized response objects

### 3. **State Management Strategy**
- **Context API**: Used for global state like authentication
- **Custom hooks**: Encapsulate complex state logic (e.g., podcast player)
- **Local state**: Component-level state for UI interactions

### 4. **Routing Structure**
- **Page-based routing**: Each route corresponds to a page component
- **Protected routes**: Authentication-based route protection
- **Nested routing**: Support for complex navigation patterns

### 5. **Styling Approach**
- **CSS modules**: Component-scoped styling
- **Global styles**: Shared styles in App.css and index.css
- **Responsive design**: Mobile-first approach with breakpoints

## Development Guidelines

### File Naming Conventions
- **Components**: PascalCase (e.g., `PodcastPlayer.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `usePodcastPlayer.js`)
- **Services**: camelCase with 'Service' suffix (e.g., `podcastService.js`)
- **Utilities**: camelCase (e.g., `formatTime.js`)
- **Constants**: camelCase (e.g., `apiEndpoints.js`)

### Import/Export Patterns
- **Default exports**: Used for components and main modules
- **Named exports**: Used for utilities, constants, and multiple functions
- **Barrel exports**: Consider for large directories (index.js files)

### Code Organization Principles
1. **Single Responsibility**: Each file has one clear purpose
2. **Dependency Direction**: Dependencies flow inward (components depend on services, not vice versa)
3. **Separation of Concerns**: Business logic, UI logic, and data fetching are separated
4. **Reusability**: Common functionality is extracted into reusable modules

## Future Considerations

### Planned Additions
- **TypeScript migration**: Gradual migration from JavaScript to TypeScript
- **Testing structure**: Jest and React Testing Library setup
- **Storybook integration**: Component documentation and testing
- **PWA features**: Service workers and offline capabilities
- **Internationalization**: Multi-language support structure

### Scalability Features
- **Code splitting**: Lazy loading for route-based code splitting
- **Bundle optimization**: Tree shaking and dynamic imports
- **Performance monitoring**: Integration with analytics and performance tools
- **Error boundaries**: Comprehensive error handling and reporting

## Getting Started

1. **Install dependencies**: `npm install`
2. **Set up environment**: Copy `.env.example` to `.env.local` and configure
3. **Start development**: `npm run dev`
4. **Build for production**: `npm run build`

## Contributing

When adding new features or components:
1. Follow the established directory structure
2. Use the defined naming conventions
3. Add appropriate documentation
4. Update this structure document if needed
5. Follow the established coding patterns and rules

This structure provides a solid foundation for building a scalable, maintainable PodcastAI frontend application.
