import type { QueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Alert, Linking } from "react-native";

interface SlotStatusPayload {
    slotId: string;
    newStatus: number;

}

export const handleSlotStatusChange = async (data: SlotStatusPayload, queryClient: QueryClient) => {

    console.log('Recieved an event that a slot has been changed', data.slotId)
    // 4. تحديث الكاش عشان الشاشة تنضف والحجز يختفي
    await queryClient.invalidateQueries({ queryKey: ["Slots"] });
}