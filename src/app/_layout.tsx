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
  const inAuthGroup = segments[0] === '(auth)';
  const inOnboardingStackGroup = segments[0] === '(onboard)';
  const inTabs = segments[0] === '(tabs)';
  const inAdmin = segments[0] === '(admin)'

  // 📝 كونسول لوج عام مع كل إعادة رندر عشان تتابع الـ State اللحظية
  console.log('--- 🔄 [RENDER TRIGGERED] ---', {
    currentSegment: segments[0] || 'root',
    isFirebaseLoading,
    isBackendLoading: isLoading,
    hasFirebaseUser: !!firebaseUser,
    hasUserData: !!userData,
    userRole: userData?.role || 'NONE',
    isNavReady: !!navigationState?.key
  });
  useEffect(() => {
    console.log('🚀 [useEffect - Auth/Redirect Logic Started]');

    if (!navigationState?.key) {
      console.log('🛑 [Redirect Guard]: Navigation state is NOT ready yet. Skipping redirect.');
      return;
    }

    if (!firebaseUser) {
      console.log('ℹ️ [Auth Status]: No firebaseUser found.');
      if (!inAuthGroup) {
        console.log('➡️ [Redirecting]: Guest trying to access protected route. Moving to -> /(auth)/login');
        router.replace('/(auth)/login');
      } else {
        console.log('✅ [Stay]: Guest is already in Auth Group.');
      }
    }

    else if (firebaseUser && !userData) {
      console.log('ℹ️ [Auth Status]: Firebase User exists, but Backend userData is missing.');
      if (!inOnboardingStackGroup) {
        console.log('➡️ [Redirecting]: User needs onboarding. Moving to -> /(onboard)');
        router.replace('/(onboard)');
      } else {
        console.log('✅ [Stay]: User is already in Onboarding Group.');
      }
    }

    else if (firebaseUser && userData) {
      console.log(`ℹ️ [Auth Status]: Logged in. Role: [${userData.role}]`);

      // التحقق من الحلقات المفرغة أو التوجيه للأماكن الصحيحة
      if (inAuthGroup || inOnboardingStackGroup || (inTabs && userData.role === 'ADMIN') || (inAdmin && userData.role !== 'ADMIN')) {
        if (userData.role === 'ADMIN') {
          console.log('➡️ [Redirecting]: Admin found in wrong stack. Moving to -> /(admin)');
          router.replace('/(admin)/index');
        } else {
          console.log('➡️ [Redirecting]: Regular user found in wrong stack. Moving to -> /(tabs)');
          router.replace('/(tabs)');
        }
      } else {
        console.log(`✅ [Stay]: User is in the correct group for role: ${userData.role}`);
      }
    }

  }, [firebaseUser, isLoading, segments, isFirebaseLoading, userData, router, navigationState?.key]);


  useEffect(() => {
    setColorScheme("dark");
  }, [colorScheme]);

  const isAppLoading = isLoading || isFirebaseLoading;

  // 2. كونسول لوجز داخل بوابات الحماية (Render Guards) عشان تعرف مين اللي معلق الشاشة

  // البوابة أ: تحميل الداتا الأساسية أو الـ Navigation لسه مجاش
  if (isFirebaseLoading || !navigationState?.key) {
    console.log('⏳ [Render Guard A]: Freezing screen via ActivityIndicator because:', {
      isFirebaseLoading,
      isNavReady: !!navigationState?.key
    });
    return <ActivityIndicator size="large" color="#E7872E" style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  // البوابة ب: لو مش مسجل دخول وبيحاول يشوف صفحة محمية
  if (!firebaseUser && !inAuthGroup) {
    console.log('⏳ [Render Guard B]: Freezing screen. Guest user trying to view protected segment:', segments[0]);
    return <ActivityIndicator size="large" color="#E7872E" style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  // البوابة ج: مسجل دخول بس داتا الـ backend لسه بتحمل وهو بره الـ Onboarding
  if (firebaseUser && isLoading && !inOnboardingStackGroup && !inAuthGroup) {
    console.log('⏳ [Render Guard C]: Freezing screen. Waiting for backend useUser() data to load...');
    return <ActivityIndicator size="large" color="#E7872E" style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  // البوابة د: حارس الأمن ضد التسلل لصفحة الأدمن
  if (inAdmin && userData?.role !== 'ADMIN') {
    console.log(`🚨 [Render Guard D]: Access Denied! Role [${userData?.role}] tried to access /(admin). Freezing until redirected.`);
    return <ActivityIndicator size="large" color="#E7872E" style={{ flex: 1, backgroundColor: 'black' }} />;
  }

  console.log('✨ [SUCCESS RENDERING]: All guards passed, rendering <Slot /> now.');

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