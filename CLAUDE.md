# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EmuReady is a React Native Expo app for emulation gaming performance tracking. Users can create listings for games running on different devices/emulators, vote on performance, and discover compatibility information.

## Development Commands

### Core Commands
- `npm install` - Install dependencies
- `npm start` or `expo start` - Start development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

### Quality Assurance
- `npm run lint` - Run ESLint with expo config
- `npm run eslint:check` - Check ESLint rules with detailed output
- `npm run typecheck` - Run TypeScript type checking
- `npm run check` - Run both lint and typecheck (recommended before commits)
- `npm run format` - Format code with Prettier

### Build Commands
- `npm run build:android` - Build Android APK using `./scripts/build-android.sh`

## Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo (v53)
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Clerk with secure token storage
- **State Management**: Zustand with persistence
- **API Client**: TanStack Query (React Query) with custom HTTP client
- **Storage**: AsyncStorage + SecureStore (replaced MMKV)
- **Styling**: Custom components with theme system (NativeWind configured but not actively used)
- **Animations**: Reanimated 3 with custom animations

### Key Architecture Patterns

#### File-Based Routing Structure
```
app/
├── (auth)/          # Authentication screens
├── (tabs)/          # Main tab navigation (index, browse, create, profile, notifications, test)
├── device/[id].tsx  # Device detail screen
├── devices/         # Device listing
├── emulator/[id].tsx # Emulator detail screen
├── emulators/       # Emulator listing
├── game/[id].tsx    # Game detail screen
├── listing/[id].tsx # Listing detail screen
├── user/[id].tsx    # User profile screen
└── _layout.tsx      # Root layout with providers
```

#### Component Organization
- `components/ui/` - Reusable UI components (Button, Card, etc.)
- `components/cards/` - Specialized card components
- `components/lists/` - List components with virtualization
- `components/themed/` - Theme-aware components

#### API Integration
- `lib/api/client.ts` - React Query client with mobile-optimized settings
- `lib/api/http.ts` - HTTP client with auth token integration
- `lib/api/hooks.ts` - Custom React Query hooks
- `lib/api/services.ts` - API service functions

#### State Management
- `lib/store/index.ts` - Zustand store with persistence
- `contexts/ThemeContext.tsx` - Theme management context
- Auth state managed by Clerk

### Core Features

#### API documentation

All documentation for the api can be found in [./mobile-openapi.json](./mobile-openapi.json)
#### Authentication System
- Clerk integration with secure token storage
- Sign-in/sign-up flows in `app/(auth)/`
- Token automatically attached to API requests via `setAuthTokenGetter`

#### Emulator Integration
- `lib/services/emulator.ts` - Native Android emulator launching
- Preset configurations for different performance profiles
- Intent-based launching with proper error handling

#### Performance Tracking
- Listings with game/device/emulator combinations
- 5-tier performance ranking system
- Voting and commenting system
- User-generated content with moderation

## Environment Configuration

### Required Environment Variables
```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
EXPO_PUBLIC_API_URL=https://dev.emuready.com
EXPO_PUBLIC_ENV=development
```

### Configuration Files
- `app.json` - Expo configuration
- `eas.json` - EAS Build configuration
- `tailwind.config.js` - Tailwind configuration (available but not actively used)
- `lib/constants/config.ts` - App configuration constants

## Key Implementation Details

### Authentication Flow
1. Root layout wraps app with ClerkProvider
2. Auth helpers in `lib/auth/clerk.ts` provide token management
3. API client automatically includes auth tokens via `setAuthTokenGetter`
4. Protected routes check authentication status

### Data Fetching Pattern
```typescript
// Custom hook pattern for API calls
const useListings = () => {
  return useQuery({
    queryKey: ['listings'],
    queryFn: () => apiClient.get('/listings'),
    staleTime: CONFIG.CACHE_TTL,
  })
}
```

### Theme System
- `contexts/ThemeContext.tsx` provides theme state and utilities
- Supports light/dark/system themes with persistence
- Components use `useTheme()` hook for theme-aware styling

### Native Android Integration
- `lib/services/emulator.ts` handles emulator launching
- Uses `Linking` API for better compatibility
- Multiple intent-based approaches for different emulator types

### Error Handling
- `components/ErrorBoundary.tsx` and `components/EnhancedErrorBoundary.tsx`
- API error handling in `lib/api/client.ts`
- User-friendly error messages throughout

## Development Practices

### Code Quality
- TypeScript strict mode enabled
- ESLint with Expo configuration
- Prettier for consistent formatting
- Run `npm run check` before commits

### Component Development
- Use functional components with hooks
- Implement proper loading and error states
- Follow theme system for consistent styling
- Add proper TypeScript types

### Performance Optimizations
- Use `@shopify/flash-list` for large lists
- Implement proper React Query caching
- Use React.memo for expensive components
- Optimize image loading with expo-image

### Testing Approach
- No testing framework currently configured
- Focus on manual testing across devices
- Test authentication flows thoroughly
- Validate emulator integration on Android devices

## Important Notes

### Platform Differences
- Emulator launching only works on Android
- iOS uses different navigation patterns
- Web version available but limited functionality

### API Integration
- Backend uses tRPC but mobile client uses REST
- API base URL configurable via environment
- Proper error handling for network failures

### Storage Strategy
- User preferences stored via AsyncStorage
- Secure data (auth tokens) via SecureStore
- Zustand provides state persistence

### Development Status
According to NOTES.md, the app is production-ready with:
- Complete authentication system
- Full CRUD operations for listings
- Advanced search and filtering
- Native sharing functionality
- Professional UI with animations
- Comprehensive error handling
