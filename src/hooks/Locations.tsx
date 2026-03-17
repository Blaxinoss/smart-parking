import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react"


import * as Location from 'expo-location';
import { LatLng } from "react-native-maps";




const LocationContext = createContext<{
    initLocation: Location.LocationObject | null;
    errorMsg: string | null;
    coordsFull: Location.LocationObjectCoords | null;
    setcoordsFull: any;
    rotation: number;
    FIXED_MAYCHANGE_DEST: { latitude: number, longitude: number }
}>({
    initLocation: null,
    errorMsg: null,
    coordsFull: null,
    rotation: 0,
    setcoordsFull: null,
    FIXED_MAYCHANGE_DEST: { latitude: 31.23, longitude: 29.95 }
})





export default function LocationProvider({ children }: PropsWithChildren) {

    const [initLocation, setinitLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [coordsFull, setcoordsFull] = useState<Location.LocationObjectCoords | null>(null);
    const [rotation, setRotation] = useState(0)

    const rotationReductionRef = useRef(25)

    const FIXED_MAYCHANGE_DEST = { latitude: 31.23, longitude: 29.95 } as LatLng;


    useEffect(() => {
        let positionSubscription: Location.LocationSubscription | null = null;
        let headingSubscription: Location.LocationSubscription | null = null;

        async function startSensors() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync();
            setinitLocation(currentLocation);

            positionSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 5,

                },
                (newLocation) => {
                    setcoordsFull(newLocation.coords);
                }
            );

            headingSubscription = await Location.watchHeadingAsync((headingObject) => {

                const newHeading = headingObject.magHeading;

                const absdiff = Math.abs(newHeading - rotationReductionRef.current);
                const realDiff = Math.min(absdiff, 360 - absdiff);

                if (realDiff > 5) {
                    setRotation(newHeading);
                    rotationReductionRef.current = newHeading;
                }

            });




        }

        startSensors();

        return () => {
            if (positionSubscription) positionSubscription.remove();
            if (headingSubscription) headingSubscription.remove();
        };
    }, []);


    return (
        <LocationContext.Provider value={{ initLocation, errorMsg, coordsFull, setcoordsFull, FIXED_MAYCHANGE_DEST, rotation }}>
            {children}
        </ LocationContext.Provider>
    )
}

export const useLocationHook = () => {
    const context = useContext(LocationContext);
    return context;
}