import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react"


import * as Location from 'expo-location';
import { LatLng } from "react-native-maps";




const LocationContext = createContext<{
    initLocation: Location.LocationObject | null;
    errorMsg: string | null;
    coordsFull: Location.LocationObjectCoords | null;
    FIXED_MAYCHANGE_DEST: { latitude: number, longitude: number }
}>({
    initLocation: null,
    errorMsg: null,
    coordsFull: null,
    FIXED_MAYCHANGE_DEST: { latitude: 31.23, longitude: 29.95 }
})





export default function LocationProvider({ children }: PropsWithChildren) {

    const [initLocation, setinitLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [coordsFull, setcoordsFull] = useState<Location.LocationObjectCoords | null>(null);

    const FIXED_MAYCHANGE_DEST = { latitude: 31.23, longitude: 29.95 } as LatLng;

    useEffect(() => {

        let subscription: Location.LocationSubscription | null = null;


        async function startTracking() {

            const acceptedBefore = await Location.getForegroundPermissionsAsync();
            if (acceptedBefore.granted) {
                console.log('already acceptedd')
            } else {
                let { status }: Location.LocationPermissionResponse = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    return;
                }
            }

            const currentLocation = await Location.getCurrentPositionAsync();
            setinitLocation(currentLocation)
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 5,

                },
                (newLocation) => {
                    console.log('New location received:', newLocation.coords);
                    setcoordsFull(newLocation.coords)
                }
            );
        }

        startTracking();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);
    return (
        <LocationContext.Provider value={{ initLocation, errorMsg, coordsFull, FIXED_MAYCHANGE_DEST }}>
            {children}
        </ LocationContext.Provider>
    )
}

export const useLocationHook = () => {
    const context = useContext(LocationContext);
    return context;
}