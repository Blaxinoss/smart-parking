import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { View } from 'react-native';
export default function TabLayout() {


  return (

    <View className="flex-1">

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
          <Label>History</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Label>Profile</Label>
          <Icon sf="person.fill" drawable="custom_android_drawable" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="vehicles">
          <Label>Cars</Label>
          <Icon sf="car.fill" drawable="custom_android_drawable" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>

  );
}