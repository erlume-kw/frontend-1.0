import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/HomeScreen';
import AllDropsScreen from '../../screens/AllDropsScreen';
import DropDetailScreen from '../../screens/DropDetailScreen';
import ProductDetailScreen from '../../screens/ProductDetailScreen';
import CartScreen from '../../screens/CartScreen';
import CheckoutScreen from '../../screens/CheckoutScreen';
import SellScreen from '../../screens/SellScreen';
import WishlistScreen from '../../screens/WishlistScreen';
import LoginScreen from '../../screens/auth/LoginScreen';
import SellerPolicyScreen from '../../screens/SellerPolicyScreen';
import PrivacyPolicyScreen from '../../screens/PrivacyPolicyScreen';
import PricingEstimatorScreen from '../../screens/PricingEstimatorScreen';
import CookiesPolicyScreen from '../../screens/CookiesPolicyScreen';

const Stack = createNativeStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AllDrops" component={AllDropsScreen} />
      <Stack.Screen name="DropDetail" component={DropDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Sell" component={SellScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SellerPolicy" component={SellerPolicyScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="PricingEstimator" component={PricingEstimatorScreen} />
      <Stack.Screen name="CookiesPolicy" component={CookiesPolicyScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
