import Colors from "@/constants/Colors";
import { ActivityIndicator, View } from "react-native";
import { OnGoingReservation } from "./OnGoingReservation";
import { Reserver } from "./Reserver";
import BottomSheet from "@gorhom/bottom-sheet";
import { ActiveSessionManager } from "./ActiveSessionManager";

type ReservationManagerProps = {
    isLoadingReservation: boolean;
    isLoadingSession: boolean;
    reservation: any;
    session: any;
    bottomSheetRef: React.RefObject<BottomSheet>;
    shouldSessionStart: boolean;
};

export const ReservationManager = ({
    isLoadingReservation,
    isLoadingSession,
    reservation,
    session,
    bottomSheetRef,
    shouldSessionStart
}: ReservationManagerProps) => {

    // ============================================================================
    // 🔄 Loading State
    // ============================================================================
    if (isLoadingReservation || isLoadingSession) {
        return (
            <View className="flex-1 justify-center items-center" style={{ minHeight: 200 }}>
                <ActivityIndicator size="large" color={Colors.main[900]} />
            </View>
        );
    }

    // ============================================================================
    // 📊 Rendering Logic
    // ============================================================================

    // 1. Active Session (user is inside garage)
    if (session) {
        console.log("found session")
        return (
            <ActiveSessionManager
                bottomSheetRef={bottomSheetRef}
                reservation={reservation}
                session={session}
            />
        );
    }

    // 2. Reservation exists AND should start (at gate, ready to enter)
    if (reservation && shouldSessionStart) {
        console.log("found reservation and inplace")
        return (
            <ActiveSessionManager
                bottomSheetRef={bottomSheetRef}
                reservation={reservation}
                session={null}
            />
        );
    }

    // 3. Reservation exists but NOT ready to start (user hasn't arrived yet)
    if (reservation) {
        console.log("found reservation only")

        return <OnGoingReservation bottomSheetRef={bottomSheetRef} />;
    }

    // 4. No reservation, no session (show reservation form)
    console.log("falling back to the normal mode reservation")
    return <Reserver bottomSheetRef={bottomSheetRef} />;
};