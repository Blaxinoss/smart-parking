import { CalendarClock, Trash2 } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useAdminReservations, useDeleteReservation } from "./useAdminApi";

const STATUS: Record<string, { color: string; bg: string }> = {
    PENDING: { color: "#E7872E", bg: "rgba(231,135,46,0.12)" },
    CONFIRMED: { color: "#50c882", bg: "rgba(80,200,130,0.12)" },
    CANCELLED: { color: "#F97C7C", bg: "rgba(249,124,124,0.1)" },
};

export default function ReservationsSection() {
    const { data: reservations, isLoading } = useAdminReservations();
    const deleteReservation = useDeleteReservation();

    const handleDelete = (id: number) => {
        Alert.alert("Cancel Reservation", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteReservation.mutate(id) },
        ]);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            <View style={{
                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 20, padding: 16, marginBottom: 12,
            }}>
                <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Reservations</Text>
                <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                    Manage booking records and cancellations
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator color="#E7872E" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={reservations ?? []}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <EmptyState title="No reservations found" subtitle="Reservations will appear here once users book a slot." />
                    }
                    renderItem={({ item }) => {
                        const sc = STATUS[item.status] ?? { color: "#555", bg: "#1a1a1a" };
                        return (
                            <View style={{
                                flexDirection: "row", alignItems: "center",
                                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                                borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
                                marginBottom: 6, gap: 12,
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
                                        Reservation #{item.id}
                                    </Text>
                                    <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular" }}>Slot: {item.slotId}</Text>
                                    <Text style={{ color: "#444", fontSize: 10, fontFamily: "Titillium_400Regular", marginTop: 1 }}>
                                        {new Date(item.startTime).toLocaleString()} → {new Date(item.endTime).toLocaleString()}
                                    </Text>
                                    <View style={{
                                        marginTop: 4, alignSelf: "flex-start",
                                        backgroundColor: sc.bg, borderRadius: 20,
                                        paddingHorizontal: 8, paddingVertical: 2,
                                    }}>
                                        <Text style={{ color: sc.color, fontSize: 10, fontFamily: "Titillium_700Bold" }}>{item.status}</Text>
                                    </View>
                                </View>
                                <Pressable onPress={() => handleDelete(item.id)} style={{ padding: 8 }}>
                                    <Trash2 size={15} color="#F97C7C" />
                                </Pressable>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <View style={{
            backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
            borderStyle: "dashed", borderRadius: 18, padding: 24,
        }}>
            <Text style={{ color: "#d0d0d0", fontSize: 14, fontFamily: "Titillium_700Bold" }}>{title}</Text>
            <Text style={{ color: "#444", fontSize: 12, fontFamily: "Titillium_400Regular", marginTop: 4 }}>{subtitle}</Text>
        </View>
    );
}