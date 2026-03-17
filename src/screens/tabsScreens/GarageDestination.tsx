import { StyledText } from "@/components/ui/styledText";
import Colors from "@/constants/Colors";
import { useLocationHook } from "@/hooks/Locations";
import BottomSheet from "@gorhom/bottom-sheet";
import { View } from "react-native";
import { Callout, Circle, Marker } from "react-native-maps"



export const GarageDestination = ({ bottomSheetRef }: { bottomSheetRef: React.RefObject<BottomSheet> }) => {
    const { FIXED_MAYCHANGE_DEST } = useLocationHook();


    if (!bottomSheetRef) return null;
    return (
        <>
            <Marker
                coordinate={FIXED_MAYCHANGE_DEST}
                pinColor={Colors.main[900]}
            >
                <Callout tooltip onPress={() => bottomSheetRef.current?.snapToIndex(2)}>
                    <View className="bg-garage-950 p-3 rounded-2xl border-2 border-main-900">
                        <StyledText className="text-white font-bold text-center">Smart Parking</StyledText>
                        <StyledText className="text-main-400 text-xs text-center">Click to open</StyledText>
                    </View>
                </Callout>
            </Marker>


            <Circle
                center={FIXED_MAYCHANGE_DEST}
                radius={150} // 150 متر حوالين الجراج
                fillColor="rgba(230, 226, 43, 0.15)" // لون أخضر شفاف جداً من جوه
                strokeColor="rgba(197, 154, 34, 0.6)" // لون حدود أخضر أتقل شوية
                strokeWidth={2} // تخن الحد
            />
        </>
    )
}