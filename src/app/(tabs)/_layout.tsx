import LocationProvider from '@/hooks/Locations';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUser } from '@/hooks/useUsers';
export default function TabLayout() {



  return (
    <NativeTabs

      tintColor="#E7872E"

      labelStyle={{
        color: '#525252',
      }}
    >
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="two">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
    </NativeTabs>


  );
}