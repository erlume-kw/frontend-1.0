import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { Sarina_400Regular } from '@expo-google-fonts/sarina';
import { View } from 'react-native';
import MainNavigation from 'components/navigation/MainNavigation';
import { WishlistProvider } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext';

import './global.css';

const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: '',
      AllDrops: 'drops',
      DropDetail: 'drops/:dropTitle',
      ProductDetail: 'product/:productId',
      Cart: 'cart',
      Checkout: 'checkout',
      Sell: 'sell',
      Wishlist: 'wishlist',
      Login: 'login',
      SellerPolicy: 'seller-policy',
      PrivacyPolicy: 'privacy-policy',
      PricingEstimator: 'pricing-estimator',
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Sarina_400Regular,
    'ClashDisplay-Light': require('./assets/fonts/ClashDisplay-Light.ttf'),
    'ClashDisplay-Regular': require('./assets/fonts/ClashDisplay-Regular.ttf'),
    'ClashDisplay-Medium': require('./assets/fonts/ClashDisplay-Medium.ttf'),
    'ClashDisplay-SemiBold': require('./assets/fonts/ClashDisplay-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#18230F' }} />
    );
  }

  return (
    <WishlistProvider>
      <CartProvider>
        <NavigationContainer linking={linking}>
          <MainNavigation />
        </NavigationContainer>
        <StatusBar style="auto" />
      </CartProvider>
    </WishlistProvider>
  );
}
