import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { useRef, useState } from 'react';
import LocationProvider, { useLocationHook } from '@/hooks/Locations';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { ReservationManager } from '@/screens/tabsScreens/ReservationManager';
import Colors from '@/constants/Colors';
import { useUserReservations } from '@/hooks/useReservations';
import { useSlots } from '@/hooks/useSlots';
import { SplitSquareVertical, Bell } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import SlotsGrid from '@/screens/slots/slotGrid';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useUserSessions } from '@/hooks/useSessions';
import LocationMapParent from '../../screens/LocationMapParent';
import DebtBanner from '@/screens/tabsScreens/DebtBanner';
import { useUser } from '@/hooks/useUsers';
import { DebtBannerGrid } from '@/screens/tabsScreens/DebtBannerGrid';




export default function TabOneScreen() {
  const { data: user } = useUser();

  const [isSlotsShown, setIsSlotsShown] = useState(false);
  const [isNotificationsShown, setIsNotificationsShown] = useState(false); // 👈 State للإشعارات
  const { data: reservation, isLoading: isLoadingReservations } = useUserReservations();
  const { data: slots, isLoading: isLoadingSlots } = useSlots();
  const { data: session, isLoading: isLoadingSession } = useUserSessions();
  const [shouldSessionStart, setShouldSessionStart] = useState(false);




  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const snapPoints = ['25%', '50%', '80%'];

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 8,
    stiffness: 20,
    mass: 1,
  });
  const scaleSV = useSharedValue(0);
  const opacitySV = useSharedValue(0);

  const notificationScaleSV = useSharedValue(0); // 👈 Shared Values منفصلة للإشعارات
  const notificationOpacitySV = useSharedValue(0);

  const AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleSV.value }],
      opacity: opacitySV.value,
    };
  });

  const AnimatedNotifications = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleSV.value }],
      opacity: opacitySV.value,
    };
  });



  // ==========================================
  // 🎛️ Handlers
  // ==========================================
  const handleShowSlots = (isOpening: boolean) => {
    if (!isOpening) {
      scaleSV.value = withTiming(0, { duration: 400 });
      opacitySV.value = withTiming(0, { duration: 300 });
    } else {
      scaleSV.value = withSpring(1, { damping: 200, stiffness: 2000 });
      opacitySV.value = withTiming(1, { duration: 300 });
    }
  };

  const handleShowAnimatedNotifications = (isOpening: boolean) => {
    if (!isOpening) {
      notificationScaleSV.value = withTiming(0, { duration: 400 });
      notificationOpacitySV.value = withTiming(0, { duration: 300 });
    } else {
      notificationScaleSV.value = withSpring(1, { damping: 200, stiffness: 2000 });
      notificationOpacitySV.value = withTiming(1, { duration: 300 });
    }
  };








  if (isLoadingReservations || isLoadingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <ActivityIndicator size="large" color={Colors.main[900]} />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-black'>

      {user?.hasOutstandingDebt && (
        <DebtBanner home={true} onPress={() => {
          Alert.alert("still not Implemented")
        }} />
      )}


      <SlotsGrid SharedStyles={AnimatedStyle} slots={slots} isLoading={isLoadingSlots} />
      <Pressable
        onPress={() => {
          const newState = !isSlotsShown;
          setIsSlotsShown(newState);
          if (newState) {
            bottomSheetRef.current?.snapToIndex(0);
          }
          handleShowSlots(newState)
        }}

        style={{ elevation: 5 }} className='rounded-full p-2 absolute right-7 top-14 border border-main-900 z-50  bg-black'>
        <Icon as={SplitSquareVertical} color={Colors.main[900]} size={30} />
      </Pressable>

      {/* 🟢 زرار الـ Slots (يمين) */}
      <Pressable
        onPress={() => {
          const newState = !isSlotsShown;
          setIsSlotsShown(newState);
          handleShowSlots(newState);

          if (newState) {
            bottomSheetRef.current?.snapToIndex(0);
            // نقفل الإشعارات لو مفتوحة عشان الزحمة
            setIsNotificationsShown(false);
            handleShowAnimatedNotifications(false);
          }
        }}
        style={{ elevation: 5 }}
        className='rounded-full p-2 absolute right-7 top-14 border border-main-900 z-50 bg-black'>
        <Icon as={SplitSquareVertical} color={Colors.main[900]} size={30} />
      </Pressable>

      {/* 🔔 زرار الـ Notifications (شمال) */}
      <Pressable
        onPress={() => {
          const newState = !isNotificationsShown;
          setIsNotificationsShown(newState);
          handleShowAnimatedNotifications(newState);

          if (newState) {
            bottomSheetRef.current?.snapToIndex(0);
            // نقفل السلوتس لو مفتوحة
            setIsSlotsShown(false);
            handleShowSlots(false);
          }
        }}
        style={{ elevation: 5 }}
        className='rounded-full p-2 absolute right-7 top-28 border border-main-900 z-50 bg-black'>
        <Icon as={Bell} color={Colors.main[900]} size={30} />
      </Pressable>



      <LocationProvider>
        <LocationMapParent bottomSheetRef={bottomSheetRef} setShouldSessionStart={setShouldSessionStart} />

      </LocationProvider>

      <BottomSheet
        animationConfigs={animationConfigs}
        ref={bottomSheetRef}
        index={1}

        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: Colors.garage[900], borderRadius: 30 }}
        handleIndicatorStyle={{ backgroundColor: Colors.main[950], width: 40, boxShadow: '0px 2px 15px 3px rgba(231, 135, 46, 0.8)' }} >

        <ReservationManager
          isLoadingReservation={isLoadingReservations}
          reservation={reservation}
          bottomSheetRef={bottomSheetRef}
          shouldSessionStart={shouldSessionStart}
          session={session ?? null}
          isLoadingSession={isLoadingSession}
        />




      </BottomSheet>



    </View >
  );
}