import { StyledText } from '@/components/ui/styledText';
import { useLocationHook } from '@/hooks/Locations';
import React, { useEffect, useState } from 'react'
import { View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

type Props = {
    routeCoordinates: coord | null
    setRouteCoordinates: React.Dispatch<React.SetStateAction<coord | null>>;
}

type coord = {
    latitude: number;
    longitude: number;
}[];


function RoutePolyline({ routeCoordinates, setRouteCoordinates }: Props) {
    const { coordsFull, initLocation, FIXED_MAYCHANGE_DEST } = useLocationHook();

    const [routeDuration, setRouteDuration] = useState<number | null>(null)
    const [midPoint, setMidPoint] = useState<{ latitude: number, longitude: number } | null>(null);

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
    }, [coordsFull, routeCoordinates]);






    if (!routeCoordinates || !midPoint || !routeDuration) return null;

    return (
        <>
            <Polyline
                coordinates={routeCoordinates} // المصفوفة اللي جات من OSRM
                strokeColor="#1c7fff"          // لون الخط (مثلاً أزرق)
                strokeWidth={10}                // تخن الخط
                lineJoin="round"               // بيخلي ملفات الشوارع ناعمة مش حادة
                lineCap="round" />

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

        </>

    )

}
export default RoutePolyline

