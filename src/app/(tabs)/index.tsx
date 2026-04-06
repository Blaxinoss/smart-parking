import { ActivityIndicator, Pressable, View } from 'react-native';
import MapView from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
import LocationProvider, { useLocationHook } from '@/hooks/Locations';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { StyledText } from '@/components/ui/styledText';
import { ReservationManager } from '@/screens/tabsScreens/ReservationManager';
import Colors from '@/constants/Colors';
import { useUserReservations } from '@/hooks/useReservations';
import { SplitSquareVertical } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import SlotsGrid from '@/screens/slots/slotGrid';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useUserSessions } from '@/hooks/useSessions';
import { LocationMapParent } from '@/screens/LocationMapParent';




export default function TabOneScreen() {

  const [isSlotsShown, setIsSlotsShown] = useState(false);
  const { data: reservation, isLoading: isLoadingReservations } = useUserReservations();
  const { data: session, isLoading: isLoadingSession } = useUserSessions();
  const [shouldSessionStart, setShouldSessionStart] = useState(false);




  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['25%', '50%', '80%'];

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 8,
    stiffness: 20,
    mass: 1,
  });
  const scaleSV = useSharedValue(0);
  const opacitySV = useSharedValue(0);

  const AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleSV.value }],
      opacity: opacitySV.value,
    };
  });

  const handleShowSlots = (isOpening: boolean) => {
    if (!isOpening) {
      // قفل
      scaleSV.value = withTiming(0, { duration: 400 });
      opacitySV.value = withTiming(0, { duration: 300 });
    } else {
      // فتح بـ Spring
      scaleSV.value = withSpring(1, { damping: 200, stiffness: 2000 });
      opacitySV.value = withTiming(1, { duration: 300 });
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
    <View className='flex-1'>

      <SlotsGrid SharedStyles={AnimatedStyle} />
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
          isLoading={isLoadingReservations}
          reservation={reservation}
          bottomSheetRef={bottomSheetRef}
          shouldSessionStart={shouldSessionStart}
          session={session}
          isLoadingSession={isLoadingSession}
          isLoadingReservation={isLoadingReservations}
        />




      </BottomSheet>



    </View >
  );
}