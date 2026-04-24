import Colors from "@/constants/Colors";
import { ActivityIndicator, View } from "react-native";
import { OnGoingReservation } from "./OnGoingReservation";
import { Reserver } from "./Reserver";
import BottomSheet from "@gorhom/bottom-sheet";
import { ActiveSessionManager } from "./ActiveSessionManager";
import { ParkingSession, ParkingSessionStatus } from "@/constants/types";
import { ExitSessionManager } from "../insideGarage/ExitSessionManager";
import { useQuery } from "@tanstack/react-query";

type ReservationManagerProps = {
    isLoadingReservation: boolean;
    isLoadingSession: boolean;
    reservation: any;
    session: ParkingSession | null;
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

    // 1. جلب حالة البوابة (لو اليوزر واقف عليها دلوقتي)
    const { data: gateState } = useQuery({
        queryKey: ["exitGateState"],
        enabled: false,
        initialData: null,
        queryFn: async () => null
    });

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
    // 📊 Rendering Logic (Priority Based)
    // ============================================================================


    if (gateState || session?.status === ParkingSessionStatus.EXITING) {
        return <ExitSessionManager bottomSheetRef={bottomSheetRef} session={session!} />;
    }

    // 2. حالة الركنة النشطة (جوه السلوت)
    if (session?.status === ParkingSessionStatus.ACTIVE) {
        return <ActiveSessionManager bottomSheetRef={bottomSheetRef} reservation={reservation} session={session} />;
    }

    // --- المرحلة التانية: التعامل مع الحجوزات (لو مفيش جلسة شغالة) ---
    if (reservation) {
        // وصل الجراج والمفروض يبدأ الركنة
        if (shouldSessionStart) {
            return <ActiveSessionManager bottomSheetRef={bottomSheetRef} reservation={reservation} session={null} />;
        }

        // حجز شغال بس لسه موصلش
        return <OnGoingReservation bottomSheetRef={bottomSheetRef} />;
    }

    // --- المرحلة التالتة: الفول باك (لا جلسة ولا حجز) ---
    return <Reserver bottomSheetRef={bottomSheetRef} />;
};