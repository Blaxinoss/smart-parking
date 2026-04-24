import { StyledText } from "@/components/ui/styledText";
import { useLocationHook } from "@/hooks/Locations";
import { TouchableOpacity } from "react-native";
import type Location from 'expo-location'
import { useQueryClient } from "@tanstack/react-query";

type DeveloperToolsProps = {
    setcoordsFull: React.Dispatch<React.SetStateAction<Location.LocationObjectCoords | null>>;
    setRouteCoordinates: React.Dispatch<React.SetStateAction<coord | null>>;
};

type coord = {
    latitude: number;
    longitude: number;
}[];

export const DeveloperToolsbuttons = ({ setcoordsFull, setRouteCoordinates }: DeveloperToolsProps) => {
    const { initLocation, FIXED_MAYCHANGE_DEST } = useLocationHook();
    const queryClient = useQueryClient()

    if (!initLocation) return null;
    return (
        <>
            <TouchableOpacity
                style={{ position: 'absolute', top: 90, left: 20, backgroundColor: 'red', padding: 10, borderRadius: 10, zIndex: 100 }}
                onPress={() => {

                    const mockLocation = {
                        latitude: FIXED_MAYCHANGE_DEST.latitude + 0.0005,
                        longitude: FIXED_MAYCHANGE_DEST.longitude + 0.0005,
                        altitude: 10,
                        accuracy: 5,
                        altitudeAccuracy: 5,
                        heading: 0,
                        speed: 0,
                    };

                    setcoordsFull(mockLocation);
                    setRouteCoordinates(null)
                    console.log("🚀 Teleported! You are now inside the Geofence.");
                }}
            >
                <StyledText className="text-white font-bold">Teleport to Garage</StyledText>
            </TouchableOpacity>


            <TouchableOpacity
                style={{ position: 'absolute', top: 100, left: 100, backgroundColor: 'red', padding: 10, borderRadius: 10, zIndex: 100 }}
                onPress={async () => {

                    await queryClient.invalidateQueries()
                }}
            >
                <StyledText className="text-white font-bold">refresh cash</StyledText>
            </TouchableOpacity>

            <TouchableOpacity
                style={{ position: 'absolute', top: 90, left: 200, backgroundColor: 'red', padding: 10, borderRadius: 10, zIndex: 100 }}
                onPress={() => {

                    const mockLocation = {
                        latitude: initLocation.coords.latitude,
                        longitude: initLocation.coords.longitude,
                        altitude: 10,
                        accuracy: 5,
                        altitudeAccuracy: 5,
                        heading: 0,
                        speed: 0,
                    };

                    setcoordsFull(mockLocation);
                    setRouteCoordinates(null)
                    console.log("Teleported OUTSIDE");
                }}
            >
                <StyledText className="text-white font-bold">Teleport to Home</StyledText>
            </TouchableOpacity>
        </>
    )
}