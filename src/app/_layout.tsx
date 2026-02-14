import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../../global.css';
import { PortalHost } from '@rn-primitives/portal';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/hooks/Auth';
import { Text, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import Buttonfg from '@/components/ui/buttonfg';
import Input from '@/components/ui/inputfg';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>


  );
}

function RootLayoutNav() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const { user, isLoading } = useAuth();
  const navigationState = useRootNavigationState();
  useEffect(() => {

    const inAuthGroup = segments[0] === '(auth)';

    if (isLoading || !navigationState?.key) return;

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }


  }, [user, isLoading, segments, navigationState?.key]);


  if (isLoading) return <Text>Loading...</Text>;



  return (
    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    //   <Slot />
    //   <PortalHost />

    // </ThemeProvider>
    <View className='flex flex-row gap-4 flex-wrap'>
      <View className='gap-2'>
        <Buttonfg text='Placeholder' />
        <Buttonfg text='Placeholder' theme='primary_orangeDark' />
        <Buttonfg text='Placeholder' theme='primary_shine' />
        <Buttonfg text='Placeholder' theme='primary_white' />
        <Buttonfg text='Placeholder' theme='primary_whiteB' />
        <Buttonfg text='Placeholder' theme='primary_dull' />
        <Buttonfg text='Placeholder' theme='primary_cool' />
        <Buttonfg text='Placeholder' theme='primary_orangeLight' />
        <Buttonfg text='Placeholder' theme='primary_dullNbg' />
        <Buttonfg text='Placeholder' theme='primary_sharpSilver' />

        <Buttonfg text='Placeholder' theme='primary_black' />
      </View>

      <View className='gap-2'>
        <Buttonfg text='Placeholder' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_orangeDark' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_shine' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_white' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_whiteB' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_dull' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_cool' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_orangeLight' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_dullNbg' size='sm' />
        <Buttonfg text='Placeholder' theme='primary_sharpSilver' size='sm' />

        <Buttonfg text='Placeholder' theme='primary_black' size='sm' />
      </View>

      <View className='gap-2'>
        <Buttonfg text='Placeholder' theme='primary_orangeDark' size='sm' Icon={LogOut} />

        <Buttonfg text='Placeholder' theme='primary_orangeDark' size='sm' Icon={LogOut} />
        <Buttonfg text='Placeholder' theme='primary_shine' size='sm' Icon={LogOut} />
        <Buttonfg text='Placeholder' theme='primary_white' size='sm' Icon={LogOut} />
        <Buttonfg text='Placeholder' theme='primary_whiteB' size='sm' Icon={LogOut} />
        <Buttonfg text='Placeholder' theme='primary_dull' size='sm' Icon={LogOut} />
        <Buttonfg text='Placeholder' theme='primary_cool' size='sm' Icon={LogOut} />
        <Buttonfg text='Placeholder' theme='primary_orangeLight' size='sm' Icon={LogOut} />
        <Buttonfg text='Placeholder' theme='primary_dullNbg' size='sm' Icon={LogOut} />
        <Buttonfg text='Placeholder' theme='primary_sharpSilver' size='sm' Icon={LogOut} />

        <Buttonfg text='Placeholder' theme='primary_black' size='sm' Icon={LogOut} />
      </View>


      <View className='gap-2'>
        <Buttonfg text='Placeholder' theme='primary_orangeDark' size='sm' Icon={LogOut} IconDi='right' />

        <Buttonfg text='Placeholder' theme='primary_orangeDark' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg text='Placeholder' theme='primary_shine' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg text='Placeholder' theme='primary_white' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg text='Placeholder' theme='primary_whiteB' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg text='Placeholder' theme='primary_dull' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg text='Placeholder' theme='primary_cool' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg text='Placeholder' theme='primary_orangeLight' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg text='Placeholder' theme='primary_dullNbg' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg text='Placeholder' theme='primary_sharpSilver' size='sm' Icon={LogOut} IconDi='right' />

        <Buttonfg text='Placeholder' theme='primary_black' size='sm' Icon={LogOut} IconDi='right' />
      </View>


      <View className='gap-2'>
        <Buttonfg theme='primary_orangeDark' size='sm' Icon={LogOut} IconDi='right' />

        <Buttonfg theme='primary_orangeDark' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg theme='primary_shine' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg theme='primary_white' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg theme='primary_whiteB' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg theme='primary_dull' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg theme='primary_cool' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg theme='primary_orangeLight' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg theme='primary_dullNbg' size='sm' Icon={LogOut} IconDi='right' />
        <Buttonfg theme='primary_sharpSilver' size='sm' Icon={LogOut} IconDi='right' />

        <Buttonfg theme='primary_black' size='sm' Icon={LogOut} IconDi='right' />
      </View>

      <View>
        <Input
          label="Email"
          placeholder="Enter your email"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          error="This field is required"
        />

      </View>

    </View>
  );
}
