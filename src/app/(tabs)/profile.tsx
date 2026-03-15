
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from 'react-native';

export default function ProfileScreen() {
    return (
        <View className='justify-center items-center flex-1'>
            <Text >Profile</Text>
            <EditScreenInfo path="app/(tabs)/two.tsx" />
        </View>
    );
}
