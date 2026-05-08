import { toastConfig } from '@/components/ui/customToast';
import { AuthProvider, useAuth } from '@/hooks/Auth';
import { SocketProvider } from '@/hooks/SocketContext';
import { useUser } from '@/hooks/useUsers';
import { StripeProviderWrapper } from '@/services/StripeProviderWrapper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import '../../global.css';
import { DarkTheme, DefaultTheme } from '../components/Themed';



export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {

    }
  }
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    Titillium_Reg: require('../../assets/fonts/TitilliumWeb-Regular.ttf'),
    Titillium_Bold: require('../../assets/fonts/TitilliumWeb-Bold.ttf'),
    Titillium_Light: require('../../assets/fonts/TitilliumWeb-Light.ttf'),
    Titillium_SemiBold: require('../../assets/fonts/TitilliumWeb-SemiBold.ttf'),
    Titillium_Black: require('../../assets/fonts/TitilliumWeb-Black.ttf'),
    Titillium_ExtraLight: require('../../assets/fonts/TitilliumWeb-ExtraLight.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>

  );
}

function RootLayoutNav() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();

  const segments = useSegments();
  const { firebaseUser, isFirebaseLoading } = useAuth();
  const navigationState = useRootNavigationState();

  const { data: userData, isLoading } = useUser()

  useEffect(() => {


    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingStackGroup = segments[0] === '(onboard)';

    if (isFirebaseLoading || !navigationState?.key || isLoading) return;



    if (!firebaseUser && !inAuthGroup) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }

    } else if (firebaseUser && !userData) {
      if (!inOnboardingStackGroup) {
        router.replace('/(onboard)');
      }
    } else if (firebaseUser && userData) {
      if (inAuthGroup || inOnboardingStackGroup) {
        router.replace('/(tabs)')
      }
    }


  }, [firebaseUser, isLoading, segments, isFirebaseLoading, userData, router, navigationState?.key]);


  useEffect(() => {
    setColorScheme("dark");

  }, [colorScheme])
  const isAppLoading = isLoading || isFirebaseLoading;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SocketProvider>
        <SafeAreaProvider>
          <StripeProviderWrapper >
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

              <Slot />
              <PortalHost />
            </ThemeProvider>
          </StripeProviderWrapper>
        </SafeAreaProvider>
      </SocketProvider>

      {isAppLoading && (
        <View
          style={{
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#E7872E" />
        </View>
      )}

      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}