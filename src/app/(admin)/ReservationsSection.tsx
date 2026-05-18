import { StyledText } from "@/components/ui/styledText";
import { ReservationsStatus } from "@/constants/types";
import { CalendarClock, Pencil, XCircle, } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { Reservation, useAdminReservations, useCancelReservation, useUpdateReservation } from "../../services/useAdminApi";
import AdminModal from "./AdminModal";
const STATUS: Record<string, { color: string; bg: string }> = {
    PENDING: { color: "#E7872E", bg: "rgba(231,135,46,0.12)" },
    CONFIRMED: { color: "#50c882", bg: "rgba(80,200,130,0.12)" },
    CANCELLED: { color: "#F97C7C", bg: "rgba(249,124,124,0.1)" },
};
export default function ReservationsSection() {


    const reservationSchema = z.object({
        slotId: z.string().min(1, "Slot ID is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
    });

    type ReservationForm = z.infer<typeof reservationSchema>;


    const { data: reservations, isLoading } = useAdminReservations();
    const cancelReservation = useCancelReservation();
    const updateReservation = useUpdateReservation();
    const [editTarget, setEditTarget] = useState<Reservation | null>(null);

    const handleCancel = (item: Reservation) => {
        const ok = confirm(
            `Are you sure you want to cancel reservation #${item.id}?`
        );

        if (!ok) return;

        cancelReservation.mutate(item.id);
    };
    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            {/* Header */}
            <View style={{
                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 20, padding: 16, marginBottom: 12,
            }}>
                <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Reservations</Text>
                <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                    View, cancel, or adjust booking details
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator color="#E7872E" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={reservations ?? []}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingBottom: 100, gap: 8 }}
                    ListEmptyComponent={
                        () => {
                            return (
                                <View>
                                    <StyledText>
                                        No Reservation Found
                                    </StyledText>
                                </View>
                            )
                        }
                    }
                    renderItem={({ item }) => {
                        const sc = STATUS[item.status] ?? { color: "#555", bg: "#1a1a1a" };
                        const isCancelled = item.status !== ReservationsStatus.CONFIRMED;


                        return (
                            <View style={{
                                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                                borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
                                flexDirection: "row", alignItems: "center", gap: 12,
                            }}>
                                <View style={{
                                    width: 38, height: 38, borderRadius: 12,
                                    backgroundColor: "rgba(231,135,46,0.1)",
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <CalendarClock size={18} color="#E7872E" />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: "#d0d0d0", fontSize: 13, fontFamily: "Titillium_700Bold" }}>
                                        #{item.id} — {item.user?.name ?? `User ${item.userId}`}
                                    </Text>
                                    <Text style={{ color: "#555", fontSize: 11 }}>
                                        Slot: {item.slotId} · {item.vehicle?.plate ?? "No plate"}
                                    </Text>
                                    <Text style={{ color: "#444", fontSize: 10, marginTop: 1 }}>
                                        {new Date(item.startTime).toLocaleString()} → {new Date(item.endTime).toLocaleString()}
                                    </Text>
                                    <View style={{
                                        marginTop: 4, alignSelf: "flex-start",
                                        backgroundColor: sc.bg, borderRadius: 20,
                                        paddingHorizontal: 8, paddingVertical: 2,
                                    }}>
                                        <Text style={{ color: sc.color, fontSize: 10, fontFamily: "Titillium_700Bold" }}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Edit — CONFIRMED فقط */}
                                {!isCancelled && (
                                    <Pressable onPress={() => setEditTarget(item)} style={{ padding: 8 }}>
                                        <Pencil size={13} color="#666" />
                                    </Pressable>
                                )}

                                {/* Cancel — CONFIRMED فقط */}
                                {!isCancelled && (
                                    <Pressable onPress={() => handleCancel(item)} style={{ padding: 8 }}>
                                        <XCircle size={15} color="#F97C7C" />
                                    </Pressable>
                                )}
                            </View>
                        );
                    }}
                />
            )}

            {/* Edit Modal — slotId و startTime و endTime بس */}
            <AdminModal<ReservationForm>

                visible={!!editTarget}
                onClose={() => setEditTarget(null)}
                title="Edit Reservation"
                subtitle={`Reservation #${editTarget?.id}`}
                fields={[
                    { name: "slotId", label: "Slot ID", placeholder: "A1" },
                    { name: "startTime", label: "Start Time", placeholder: "YYYY-MM-DD HH:MM" },
                    { name: "endTime", label: "End Time", placeholder: "YYYY-MM-DD HH:MM" },
                ]}
                defaultValues={{
                    slotId: editTarget?.slotId ?? "",
                    startTime: editTarget?.startTime ?? "",
                    endTime: editTarget?.endTime ?? "",
                }}
                onSubmit={(data) => {
                    if (!editTarget) return;
                    updateReservation.mutate(
                        { id: editTarget.id, ...data },
                        { onSuccess: () => setEditTarget(null) }
                    );
                }}
                isLoading={updateReservation.isPending}
                schema={reservationSchema}
                submitLabel="Save Changes"
            />
        </View>
    );
}