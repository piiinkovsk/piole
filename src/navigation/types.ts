import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CollectionProduct, WishlistProduct } from '../types/product';

// Stack navigation params
export type CollectionStackParamList = {
  CollectionHome: undefined;
  ProductDetails: {
    product: CollectionProduct;
    isWishlist?: false;
  };
  AddProduct: {
    isWishlist?: false;
  };
  EditProduct: {
    product: CollectionProduct;
    isWishlist?: false;
  };
};

export type WishlistStackParamList = {
  WishlistHome: undefined;
  ProductDetails: {
    product: WishlistProduct;
    isWishlist: true;
  };
  AddProduct: {
    isWishlist: true;
  };
  EditProduct: {
    product: WishlistProduct;
    isWishlist: true;
  };
};

// Tab navigation params
export type RootTabParamList = {
  Collection: NavigatorScreenParams<CollectionStackParamList>;
  Browser: undefined;
  Wishlist: NavigatorScreenParams<WishlistStackParamList>;
  Profile: undefined;
};

// Screen props
export type CollectionScreenProps = NativeStackScreenProps<CollectionStackParamList, 'CollectionHome'>;
export type WishlistScreenProps = NativeStackScreenProps<WishlistStackParamList, 'WishlistHome'>;
export type BrowserScreenProps = NativeStackScreenProps<RootTabParamList, 'Browser'>;
export type ProfileScreenProps = NativeStackScreenProps<RootTabParamList, 'Profile'>;

export type ProductDetailsScreenProps = 
  | NativeStackScreenProps<CollectionStackParamList, 'ProductDetails'>
  | NativeStackScreenProps<WishlistStackParamList, 'ProductDetails'>;

export type AddProductScreenProps = 
  | NativeStackScreenProps<CollectionStackParamList, 'AddProduct'>
  | NativeStackScreenProps<WishlistStackParamList, 'AddProduct'>;

export type EditProductScreenProps = 
  | NativeStackScreenProps<CollectionStackParamList, 'EditProduct'>
  | NativeStackScreenProps<WishlistStackParamList, 'EditProduct'>;
