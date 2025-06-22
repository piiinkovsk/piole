# Piole - Cosmetics Collection App

A mobile application built with Expo/React Native for managing your cosmetics collection and wishlist.

## Features

- **My Collection**: Track owned cosmetic products with expiration dates
- **Wishlist**: Save desired products for future purchase
- **Browser**: Built-in web browser to discover products on marketplaces
- **Authentication System**: Email registration/login with email verification code and social login with Apple and Google
- **Hierarchical Category Filtering**: Organize products with deep nesting categories
- **Theme Support**: Light and dark theme with pastel mint accent color

## Tech Stack

- Expo (managed workflow)
- React Native
- TypeScript
- React Navigation
- Zustand for state management
- NativeWind (Tailwind CSS for React Native)
- React Native Reanimated for animations

## Project Structure

The project follows Atomic Design principles with the following structure:

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

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Development Workflow

1. Run the app on iOS or Android:
   ```
   npm run ios
   npm run android
   ```

2. To build the app:
   ```
   expo build:ios
   expo build:android
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.