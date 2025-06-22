import React, { createContext, useContext, useReducer } from 'react';
import { CollectionProduct, WishlistProduct } from '../types/product';

// State type
type StoreState = {
  collection: CollectionProduct[];
  wishlist: WishlistProduct[];
};

// Action types
type Action = 
  | { type: 'ADD_TO_COLLECTION'; payload: CollectionProduct }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistProduct }
  | { type: 'UPDATE_COLLECTION_ITEM'; payload: CollectionProduct }
  | { type: 'UPDATE_WISHLIST_ITEM'; payload: WishlistProduct }
  | { type: 'DELETE_FROM_COLLECTION'; payload: string }
  | { type: 'DELETE_FROM_WISHLIST'; payload: string }
  | { type: 'MOVE_TO_COLLECTION'; payload: WishlistProduct }
  | { type: 'MOVE_TO_WISHLIST'; payload: CollectionProduct };

// Context type
type StoreContextType = {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
};

// Initial state
const initialState: StoreState = {
  collection: [],
  wishlist: [],
};

// Create context
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Reducer function
function storeReducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'ADD_TO_COLLECTION':
      return {
        ...state,
        collection: [...state.collection, action.payload],
      };
    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      };
    case 'UPDATE_COLLECTION_ITEM':
      return {
        ...state,
        collection: state.collection.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'UPDATE_WISHLIST_ITEM':
      return {
        ...state,
        wishlist: state.wishlist.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_FROM_COLLECTION':
      return {
        ...state,
        collection: state.collection.filter(item => item.id !== action.payload),
      };
    case 'DELETE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload),
      };
    case 'MOVE_TO_COLLECTION':
      return {
        ...state,
        collection: [...state.collection, action.payload],
        wishlist: state.wishlist.filter(item => item.id !== action.payload.id),
      };
    case 'MOVE_TO_WISHLIST':
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
        collection: state.collection.filter(item => item.id !== action.payload.id),
      };
    default:
      return state;
  }
}

// Provider component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook for using the store
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Custom hook for using the store context
export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};
