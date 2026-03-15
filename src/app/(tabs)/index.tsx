import { ActivityIndicator, Button, Dimensions, Pressable, Text, View } from 'react-native';
import MapView, { Callout, Circle, Marker, Polyline } from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
import { useLocationHook } from '@/hooks/Locations';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { OnGoingReservation } from '@/screens/tabsScreens/OnGoingReservation';
import { StyledText } from '@/components/ui/styledText';

import Colors from '@/constants/Colors';
import { Reserver } from '@/screens/tabsScreens/Reserver';
import { useUserReservations } from '@/hooks/useReservations';
import { SplitSquareVertical } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import SlotsGrid from '@/screens/slots/slotGrid';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';




type coord = {
  latitude: number;
  longitude: number;
}[];
export default function TabOneScreen() {

  const [isSlotsShown, setIsSlotsShown] = useState(false);
  const { coordsFull, errorMsg, initLocation, FIXED_MAYCHANGE_DEST } = useLocationHook();
  const [routeCoordinates, setRouteCoordinates] = useState<coord | null>(null)
  const { data: reservation, isLoading: isLoadingReservations, isFetching: isFetchingReservations } = useUserReservations();
  const [routeDuration, setRouteDuration] = useState<number | null>(null)
  const [midPoint, setMidPoint] = useState<{ latitude: number, longitude: number } | null>(null);

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
    if (!coordsFull?.latitude || !coordsFull?.longitude) return;
    if (routeCoordinates && routeCoordinates.length > 0) return;
    const getRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsFull.longitude},${coordsFull.latitude};${FIXED_MAYCHANGE_DEST.longitude},${FIXED_MAYCHANGE_DEST.latitude}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const points: coord = data.routes[0].geometry.coordinates.map((coord: coord) => ({
            latitude: coord[1],
            longitude: coord[0]
          }));

          const duration = Math.ceil(data.routes[0].duration / 60) || 0;
          setRouteDuration(duration);
          setRouteCoordinates(points);

          const middleIndex = Math.floor(points.length / 2);
          setMidPoint(points[middleIndex]);
        }
      } catch (error) {
        console.error("Route fetching failed:", error);
      }
    };

    getRoute();
  }, [coordsFull?.latitude, coordsFull?.longitude]);




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
        {coordsFull && (
          <Marker
            coordinate={{
              latitude: coordsFull.latitude,
              longitude: coordsFull.longitude
            }}
            title="You here"
            pinColor={Colors.danger[900]}
          />
        )}

        <Marker
          coordinate={FIXED_MAYCHANGE_DEST}
          pinColor={Colors.main[900]}
        >
          <Callout tooltip onPress={() => bottomSheetRef.current?.snapToIndex(2)}>
            <View className="bg-garage-950 p-3 rounded-2xl border-2 border-main-900">
              <Text className="text-white font-bold text-center">Smart Parking</Text>
              <Text className="text-main-400 text-xs text-center">Click to open</Text>
            </View>
          </Callout>
        </Marker>



        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates} // المصفوفة اللي جات من OSRM
            strokeColor="#3b82f6"          // لون الخط (مثلاً أزرق)
            strokeWidth={5}                // تخن الخط
            lineJoin="round"               // بيخلي ملفات الشوارع ناعمة مش حادة
            lineCap="round"

          />
        )}

        {/* {coordsFull && (
          <Polyline
            coordinates={[
              { latitude: coordsFull.latitude, longitude: coordsFull.longitude },
              FIXED_MAYCHANGE_DEST
            ]}
            strokeColor={Colors.main[900]}
            strokeWidth={5}
            lineJoin="round"
          />
        )} */}
        <Circle
          center={FIXED_MAYCHANGE_DEST}
          radius={150} // 150 متر حوالين الجراج
          fillColor="rgba(230, 226, 43, 0.15)" // لون أخضر شفاف جداً من جوه
          strokeColor="rgba(197, 154, 34, 0.6)" // لون حدود أخضر أتقل شوية
          strokeWidth={2} // تخن الحد
        />

        {midPoint && routeDuration && routeDuration > 0 && (
          <Marker
            coordinate={midPoint}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View className="bg-garage-900 border-2 border-main-900 px-3 py-1.5 rounded-full shadow-xl shadow-black">
              <StyledText className="text-white font-titillium-bold text-sm">
                {routeDuration} min
              </StyledText>
            </View>
          </Marker>
        )}
      </MapView>

      <BottomSheet
        animationConfigs={animationConfigs}
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: Colors.garage[900], borderRadius: 30 }}
        handleIndicatorStyle={{ backgroundColor: Colors.main[950], width: 40, boxShadow: '0px 2px 15px 3px rgba(231, 135, 46, 0.8)' }} >
        <View style={{ flex: 1, alignItems: 'center' }}>

          {isLoadingReservations ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <ActivityIndicator size="large" color={Colors.main[900]} />
            </View>
          ) : reservation ? (
            <OnGoingReservation bottomSheetRef={bottomSheetRef} />
          ) : (
            <Reserver bottomSheetRef={bottomSheetRef} />
          )}




        </View>

      </BottomSheet>


    </View >
  );
}