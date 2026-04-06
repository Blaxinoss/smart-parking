import { QueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Alert, Linking } from "react-native"; // هنحتاج دول عشان اللينك والرسالة الثابتة

// 1. ظبطنا الـ Type عشان يستقبل كل الداتا اللي السوكيت بيبعتها
interface CancelPayload {
    type: string;
    reservationId: number;
    charge: number;
    debtAmount: number;
    paymentLink: string | null;
    isBlacklisted: boolean;
    message: string;
}

export const handleCancel = async (data: CancelPayload, queryClient: QueryClient) => {

    // 2. اللوجيك: لو اليوزر اتعمله بلاك ليست وعليه فلوس
    if (data.isBlacklisted) {
        Alert.alert(
            "ٌReservation has been canceled Payment Required)⚠️",
            data.message, // الرسالة جاية جاهزة من الباك إند
            [
                {
                    text: "Later",
                    style: "cancel"
                },
                {
                    text: "Pay Now",
                    style: "default",
                    onPress: () => {
                        // يفتح لينك سترايب في متصفح الموبايل
                        if (data.paymentLink) {
                            Linking.openURL(data.paymentLink);
                        }
                    }
                }
            ]
        );
    }
    else {
        Toast.show({
            type: "info",
            visibilityTime: 5000,
            text1: "reservation has been canceled",
            text2: data.message
        });
    }

    // 4. تحديث الكاش عشان الشاشة تنضف والحجز يختفي
    await queryClient.invalidateQueries({ queryKey: ["userReservations"] });

}