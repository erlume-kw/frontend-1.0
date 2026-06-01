import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { Sarina_400Regular } from '@expo-google-fonts/sarina';
import { View, ActivityIndicator } from 'react-native';
import MainNavigation from 'components/navigation/MainNavigation';
import { WishlistProvider } from './contexts/WishlistContext';

import './global.css';

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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#18230F' }}>
        <ActivityIndicator color="#DFD3C3" />
      </View>
    );
  }

  return (
    <WishlistProvider>
      <NavigationContainer>
        <MainNavigation />
      </NavigationContainer>
      <StatusBar style="auto" />
    </WishlistProvider>
  );
}
