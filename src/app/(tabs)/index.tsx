import { ActivityIndicator, Pressable, View } from 'react-native';
import MapView from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
import { useLocationHook } from '@/hooks/Locations';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { StyledText } from '@/components/ui/styledText';
import { ReservationManager } from '@/screens/tabsScreens/ReservationManager';
import Colors from '@/constants/Colors';
import { useUserReservations } from '@/hooks/useReservations';
import { SplitSquareVertical } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import SlotsGrid from '@/screens/slots/slotGrid';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { isPointWithinRadius } from 'geolib';
import { UserMarker } from '@/screens/tabsScreens/UserMarker';
import { GarageDestination } from '@/screens/tabsScreens/GarageDestination';
import RoutePolyline from '@/screens/tabsScreens/RoutePolyline';
import { DeveloperToolsbuttons } from '@/screens/tabsScreens/DeveloperToolsButtons';


type coord = {
  latitude: number;
  longitude: number;
}[];


export default function TabOneScreen() {

  const [isSlotsShown, setIsSlotsShown] = useState(false);
  const { coordsFull, setcoordsFull, initLocation, FIXED_MAYCHANGE_DEST } = useLocationHook();
  const { data: reservation, isLoading: isLoadingReservations } = useUserReservations();
  const [routeCoordinates, setRouteCoordinates] = useState<coord | null>(null)



  const isUserNearGarage = useRef(false);
  const [shouldSessionStart, setShouldSessionStart] = useState(false);


  const mapRegion = initLocation ? {
    latitude: initLocation.coords.latitude,
    longitude: initLocation.coords.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  } : undefined;

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['25%', '50%', '90%'];

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




  useEffect(() => {

    if (coordsFull && coordsFull.latitude && coordsFull.longitude) {
      const isInside = isPointWithinRadius({ latitude: coordsFull.latitude, longitude: coordsFull.longitude },
        { latitude: FIXED_MAYCHANGE_DEST.latitude, longitude: FIXED_MAYCHANGE_DEST.longitude },
        150
      )
      if (isInside && !isUserNearGarage.current) {
        isUserNearGarage.current = true;
        setShouldSessionStart(true);
        console.log("you have reached the station starting the session....")
      } else if (!isInside && isUserNearGarage.current) {
        isUserNearGarage.current = false;
        setShouldSessionStart(false)
      }
    }

  }, [coordsFull])





  if (!initLocation) {
    return (
      <View className="flex-1 justify-center items-center bg-garage-950">
        <ActivityIndicator size="large" color={Colors.main[900]} />
        <StyledText className="text-garage-200 mt-2">جاري تحديد موقعك...</StyledText>
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

      <MapView
        style={{ height: "100%" }}
        initialRegion={mapRegion}
        region={mapRegion}
      >

        <UserMarker />

        <GarageDestination bottomSheetRef={bottomSheetRef} />

        <RoutePolyline routeCoordinates={routeCoordinates} setRouteCoordinates={setRouteCoordinates} />

      </MapView>

      <BottomSheet
        animationConfigs={animationConfigs}
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: Colors.garage[900], borderRadius: 30 }}
        handleIndicatorStyle={{ backgroundColor: Colors.main[950], width: 40, boxShadow: '0px 2px 15px 3px rgba(231, 135, 46, 0.8)' }} >
        <View style={{ flex: 1, alignItems: 'center' }}>

          <ReservationManager
            isLoading={isLoadingReservations}
            reservation={reservation}
            bottomSheetRef={bottomSheetRef}
            shouldSessionStart={shouldSessionStart}
          />


        </View>


      </BottomSheet>


      <DeveloperToolsbuttons setRouteCoordinates={setRouteCoordinates} setcoordsFull={setcoordsFull} />

    </View >
  );
}