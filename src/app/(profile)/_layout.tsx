import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native'; // أو الأيقونة اللي بتستخدمها
import Colors from '@/constants/Colors'; // لو عايز تلون الزرار

export default function ProfileLayout() {
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen
                name="Card"
                options={{
                    title: 'Payment Method',
                    headerShown: true,

                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ marginRight: 15 }}
                        >
                            <ChevronLeft size={28} color={Colors.main[900]} />
                        </TouchableOpacity>
                    ),
                }}
            />
        </Stack>
    );
}