# GitHub Copilot Agent Development Instructions

## Project Overview
This is a React Native/Expo application designed to scale into a social platform. Follow these guidelines strictly to ensure consistent, maintainable, and scalable code.

## Core Tech Stack

### Primary Framework
- **Expo** (managed workflow initially, bare workflow for advanced features)
- **React Native** (latest stable version)
- **TypeScript** (mandatory for all new code)

### Recommended Additional Technologies for Social Platform Scaling

#### State Management
- **Zustand** or **Redux Toolkit** for global state
- **React Query/TanStack Query** for server state management
- **AsyncStorage** or **MMKV** for local persistence

#### Navigation
- **React Navigation v6** (Stack, Tab, Drawer navigators)
- **Deep linking** configuration for social sharing

#### UI/Design System
- **NativeWind** (Tailwind CSS for React Native) or **Tamagui**
- **React Native Reanimated 3** for smooth animations
- **React Native Gesture Handler** for complex interactions
- **Expo Linear Gradient** for modern UI elements

#### API Integration & Media
- **Axios** or **Fetch API** for HTTP requests
- **React Query/TanStack Query** for API state management and caching
- **Expo ImagePicker** for media selection
- **Expo Camera** for camera functionality

#### Performance & Monitoring
- **Flipper** for debugging
- **Expo Analytics** or **Mixpanel** for user tracking
- **Sentry** for error tracking
- **React Native Performance** monitoring

#### Social Platform Specific
- **Expo Notifications** for push notifications
- **React Native Share** for social sharing
- **React Native WebView** for embedded content
- **Socket.io** for real-time messaging
- **React Native Video** for media content

## Development Best Practices

### Code Structure
1. **Use Atomic Design Principles**
   - Atoms: Basic UI components (Button, Input, Text)
   - Molecules: Component combinations (SearchBar, Card)
   - Organisms: Complex UI sections (Header, Feed)
   - Templates: Page layouts
   - Pages: Complete screens

2. **Folder Structure**
   ```
   src/
   ├── components/
   │   ├── atoms/
   │   ├── molecules/
   │   ├── organisms/
   │   └── templates/
   ├── screens/
   ├── hooks/
   ├── services/
   ├── store/
   ├── types/
   ├── utils/
   └── constants/
   ```

3. **File Naming Conventions**
   - Use PascalCase for components: `UserProfile.tsx`
   - Use camelCase for utilities: `formatDate.ts`
   - Use kebab-case for assets: `user-avatar.png`
   - Use SCREAMING_SNAKE_CASE for constants: `API_ENDPOINTS.ts`

### TypeScript Guidelines
1. **Always use TypeScript** - no JavaScript files in src/
2. **Define interfaces for all props and data structures**
3. **Use generic types for reusable components**
4. **Prefer type unions over enums when possible**
5. **Use strict TypeScript configuration**

### Component Development
1. **Functional Components Only** - no class components
2. **Use React Hooks** - prefer custom hooks for complex logic
3. **Implement proper error boundaries**
4. **Use React.memo() for performance optimization when needed**
5. **Props should be destructured in function signature**
6. **Always define default props when applicable**

### Performance Best Practices
1. **Optimize FlatList usage** with proper keyExtractor and getItemLayout
2. **Use Image optimization** - proper resizeMode and caching
3. **Implement lazy loading** for screens and heavy components
4. **Use React.useMemo() and useCallback()** appropriately
5. **Avoid inline functions in render methods**
6. **Implement proper list virtualization** for large datasets

### State Management Rules
1. **Keep state as close to usage as possible**
2. **Use global state only for truly global data**
3. **Implement optimistic updates** for better UX
4. **Handle loading and error states consistently**
5. **Use proper state normalization** for complex data

### Frontend Security & Data Handling
1. **Never store sensitive data in AsyncStorage** (tokens, passwords)
2. **Validate all user inputs** on frontend before sending to API
3. **Implement proper authentication token management**
4. **Use secure storage for sensitive data** (Expo SecureStore)
5. **Implement proper deep linking validation**
6. **Follow platform-specific privacy guidelines**
7. **Sanitize data received from API** before displaying

### API Integration Best Practices
1. **Always implement proper error handling** for API calls
2. **Use TypeScript interfaces** for all API responses
3. **Implement request/response interceptors** for common logic
4. **Add proper loading states** for all async operations
5. **Cache API responses** appropriately with React Query
6. **Handle offline scenarios** gracefully
7. **Implement retry logic** for failed requests
8. **Use proper HTTP status code handling**
9. **Mock API responses** during development when backend is unavailable

## Code Quality Standards

### Formatting & Linting
- Use **Prettier** for code formatting
- Use **ESLint** with React Native recommended rules
- Use **Husky** for pre-commit hooks
- Maintain **90%+ test coverage** for critical components

### Documentation
1. **JSDoc comments** for all public functions and components
2. **README.md** for each major feature/module
3. **Type definitions** should be self-documenting
4. **Inline comments** for complex business logic only

### Testing Strategy
1. **Jest** for unit testing
2. **React Native Testing Library** for component testing
3. **Detox** for E2E testing
4. **Mock all external dependencies**
5. **Test error conditions and edge cases**

## Naming Conventions

### Variables & Functions
- Use descriptive names: `getUserProfile` not `getUser`
- Boolean variables: `isLoading`, `hasError`, `canEdit`
- Event handlers: `handlePress`, `onUserSelect`
- Async functions: `fetchUserData`, `uploadImage`

### Components
- Use descriptive, action-oriented names
- Include context when needed: `UserProfileCard` not `Card`
- Use consistent suffixes: `Modal`, `Screen`, `Hook`, `Provider`

### Constants
- Use SCREAMING_SNAKE_CASE: `MAX_UPLOAD_SIZE`
- Group related constants in objects or enums
- Use meaningful prefixes: `API_ENDPOINTS`, `STORAGE_KEYS`

## Social Platform Specific Guidelines

### User Experience
1. **Implement infinite scroll** with proper loading states
2. **Add pull-to-refresh** functionality
3. **Implement proper offline support**
4. **Use skeleton loaders** for better perceived performance
5. **Add haptic feedback** for interactions

### Content Management (Frontend)
1. **Implement image/video compression** before upload
2. **Add client-side content validation**
3. **Support multiple media formats**
4. **Implement proper caching strategies** for media
5. **Add image optimization and lazy loading**
6. **Handle media upload progress** with proper UI feedback

### Real-time Features (Frontend)
1. **Implement WebSocket client connection** efficiently
2. **Handle connection states** (connecting, connected, disconnected)
3. **Implement proper connection recovery** and reconnection logic
4. **Handle real-time updates gracefully** with optimistic updates
5. **Optimize for battery usage** with proper connection management
6. **Show real-time status indicators** to users

## Error Handling

### Implementation Rules
1. **Always handle async operations** with try-catch
2. **Provide meaningful error messages** to users
3. **Log errors appropriately** for debugging
4. **Implement graceful degradation**
5. **Use error boundaries** for component-level errors

### User Communication
- Show specific, actionable error messages
- Provide retry mechanisms where appropriate
- Use consistent error UI patterns
- Implement proper loading states

## Accessibility Requirements
1. **Add accessibility labels** to all interactive elements
2. **Ensure proper color contrast**
3. **Support screen readers**
4. **Implement proper focus management**
5. **Test with accessibility tools**

## Platform-Specific Considerations

### iOS
- Follow iOS Human Interface Guidelines
- Implement proper safe area handling
- Use iOS-specific UI patterns when needed

### Android
- Follow Material Design principles
- Handle Android back button properly
- Implement proper permission handling

## Development Workflow

### Git Practices
1. **Use conventional commits**: `feat:`, `fix:`, `refactor:`
2. **Create feature branches** from main/develop
3. **Write descriptive commit messages**
4. **Keep commits atomic and focused**
5. **Use pull request templates**

### Code Reviews
- Review for performance implications
- Check accessibility compliance
- Verify error handling
- Ensure consistent styling
- Validate TypeScript usage

## Important Notes for Copilot Agent

1. **Always prioritize TypeScript** - suggest TS solutions first
2. **Consider mobile performance** in all suggestions
3. **Suggest accessibility improvements** when relevant
4. **Recommend modern React patterns** (hooks, functional components)
5. **Consider offline scenarios** for social platform features
6. **Suggest testing approaches** with code suggestions
7. **Always include error handling** in async code suggestions
8. **Prioritize user experience** in all recommendations
9. **Consider scalability** in architectural suggestions
10. **Suggest performance optimizations** when appropriate

Remember: This is a social platform that needs to handle thousands of users, real-time interactions, and media content efficiently. Always consider scalability, performance, and user experience in your suggestions.