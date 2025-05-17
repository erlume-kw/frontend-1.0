import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigation from 'components/navigation/MainNavigation';

import './global.css';

export default function App() {
  return (
    <>
      <NavigationContainer>
        <MainNavigation />
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}
