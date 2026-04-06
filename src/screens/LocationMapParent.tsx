import { StyledText } from "@/components/ui/styledText";
import Colors from "@/constants/Colors";
import LocationProvider, { useLocationHook } from "@/hooks/Locations"
import { isPointWithinRadius } from "geolib";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import MapView from "react-native-maps";
import { UserMarker } from "./tabsScreens/UserMarker";
import { GarageDestination } from "./tabsScreens/GarageDestination";
import RoutePolyline from "./tabsScreens/RoutePolyline";
import { DeveloperToolsbuttons } from "./tabsScreens/DeveloperToolsButtons";
import BottomSheet from "@gorhom/bottom-sheet";


type coord = {
    latitude: number;
    longitude: number;
}[];



export const LocationMapParent = ({ setShouldSessionStart, bottomSheetRef }: { setShouldSessionStart: (x: boolean) => void, bottomSheetRef: React.RefObject<BottomSheet> }) => {
    const { coordsFull, setcoordsFull, initLocation, FIXED_MAYCHANGE_DEST } = useLocationHook();


    const isUserNearGarage = useRef(false);
    const [routeCoordinates, setRouteCoordinates] = useState<coord | null>(null)





    const mapRegion = initLocation ? {
        latitude: initLocation.coords.latitude,
        longitude: initLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    } : undefined;


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
        <LocationProvider>


            <MapView
                style={{ height: "100%" }}
                initialRegion={mapRegion}
                region={mapRegion}
            >

                <UserMarker />

                <GarageDestination bottomSheetRef={bottomSheetRef} />

                <RoutePolyline routeCoordinates={routeCoordinates} setRouteCoordinates={setRouteCoordinates} />

            </MapView>
            <DeveloperToolsbuttons setRouteCoordinates={setRouteCoordinates} setcoordsFull={setcoordsFull} />

        </LocationProvider>

    )
}


