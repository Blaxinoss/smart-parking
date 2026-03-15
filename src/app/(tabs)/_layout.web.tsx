import Colors from '@/constants/Colors';
import LocationProvider from '@/hooks/Locations';
import { Tabs } from 'expo-router';
import { Home, User, Settings } from 'lucide-react-native';

export default function WebLayout() {
    return (
        <LocationProvider>

            <Tabs screenOptions={{
                tabBarStyle: {
                    backgroundColor: Colors.garage[950],
                    height: 60,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    overflow: 'hidden',
                    borderTopWidth: 0,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                },
                tabBarActiveTintColor: '#E7872E',
                headerShown: false,
            }}>
                <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} /> }} />
                <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} /> }} />
            </Tabs>
        </ LocationProvider>

    );
}