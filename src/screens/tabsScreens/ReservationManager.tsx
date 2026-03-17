import Colors from "@/constants/Colors";
import { ActivityIndicator, View } from "react-native";
import { OnGoingReservation } from "./OnGoingReservation";
import { Reserver } from "./Reserver";
import { StyledText } from "@/components/ui/styledText";
import BottomSheet from "@gorhom/bottom-sheet";

type ReservationManagerProps = {
    isLoading: boolean;
    reservation: any;
    bottomSheetRef: React.RefObject<BottomSheet>;
    shouldSessionStart: boolean;
};


export const ReservationManager = ({ isLoading, reservation, bottomSheetRef, shouldSessionStart }: ReservationManagerProps) => {
    console.log(shouldSessionStart)

    if (isLoading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <ActivityIndicator size="large" color={Colors.main[900]} />
        </View>
    ); // كومبوننت تحميل صغير
    if (reservation && !shouldSessionStart) return <OnGoingReservation bottomSheetRef={bottomSheetRef} />;

    if (reservation && shouldSessionStart) return (<StyledText>Hello user</StyledText>)
    return <Reserver bottomSheetRef={bottomSheetRef} />;
};