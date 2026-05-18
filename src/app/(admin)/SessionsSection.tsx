import { StyledText } from "@/components/ui/styledText";
import { AlertTriangle, CheckCircle, Pencil, Timer, X } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { z } from "zod";
// import AxiosAPI, { getAdminData } from "path-to-api"; // تأكد من استدعائهم
// import showToast from "path-to-toast"; // تأكد من استدعائهم
import { ParkingSessionStatus, PaymentMethod, TransactionStatus } from "@/constants/types";
import { ParkingSession, useAdminSessions, useCompleteCashPayment, useEditSession, useForceCancel } from "../../services/useAdminApi";
import AdminModal from "./AdminModal";

// ─── Status styles ────────────────────────────────────────────────────────────
const STATUS: Record<string, { color: string; bg: string }> = {
    ACTIVE: { color: "#50c882", bg: "rgba(80,200,130,0.12)" },
    COMPLETED: { color: "#555", bg: "#1a1a1a" },
    CANCELLED: { color: "#F97C7C", bg: "rgba(249,124,124,0.1)" },
};

// ─── Confirm schema (For Force Cancel & Cash Payment) ─────────────────────────
const confirmSchema = z.object({});
type ConfirmSchema = z.infer<typeof confirmSchema>;

// ─── Edit schema (For Updating Session) ───────────────────────────────────────
const editSchema = z.object({
    slotId: z.string().min(1, "Slot ID is required"),
    status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
});
type EditSchema = z.infer<typeof editSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────
type ConfirmConfig = {
    title: string;
    subtitle: string;
    submitLabel: string;
    icon: "warning" | "cash";
    onConfirm: () => void;
};

export default function SessionsSection() {
    const { data: sessions, isLoading } = useAdminSessions();
    const forceCancel = useForceCancel();
    const completeCash = useCompleteCashPayment();
    const editSessionMutation = useEditSession();

    // States
    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
    const [editSessionItem, setEditSessionItem] = useState<ParkingSession | null>(null);

    const handleForceCancel = (id: number) => {
        setConfirmConfig({
            title: "Force Cancel Session",
            subtitle: "This will immediately cancel the session with no payment charged. The slot will be freed and the user will be notified.",
            submitLabel: "Force Cancel",
            icon: "warning",
            onConfirm: () => forceCancel.mutate(id),
        });
    };

    const handleCompleteCash = (id: number) => {
        setConfirmConfig({
            title: "Confirm Cash Payment",
            subtitle: "Confirm that cash has been received. This will mark the transaction as completed and send the gate open command.",
            submitLabel: "Confirm & Open Gate",
            icon: "cash",
            onConfirm: () => completeCash.mutate(id),
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            {/* Header */}
            <View style={{
                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 20, padding: 16, marginBottom: 12,
            }}>
                <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Sessions</Text>
                <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                    Review live and completed parking sessions
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator color="#E7872E" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={sessions ?? []}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingBottom: 100, gap: 8 }}
                    ListEmptyComponent={() => (
                        <View>
                            <StyledText>No Sessions Found</StyledText>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const sc = STATUS[item.status] ?? { color: "#555", bg: "#1a1a1a" };
                        const latestTx = item.paymentTransaction?.[0];
                        const isCashPending =
                            latestTx?.transactionStatus === TransactionStatus.PENDING &&
                            latestTx?.paymentMethod === PaymentMethod.CASH;
                        const isActive = item.status === ParkingSessionStatus.ACTIVE;

                        return (
                            <View style={{
                                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                                borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
                                flexDirection: "row", alignItems: "center", gap: 12,
                            }}>
                                {/* Icon */}
                                <View style={{
                                    width: 38, height: 38, borderRadius: 12,
                                    backgroundColor: "rgba(80,200,130,0.1)",
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <Timer size={18} color="#50c882" />
                                </View>

                                {/* Info */}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: "#d0d0d0", fontSize: 13, fontFamily: "Titillium_700Bold" }}>
                                        #{item.id} — {item.user?.name ?? `User ${item.userId}`}
                                    </Text>
                                    <Text style={{ color: "#555", fontSize: 11 }}>
                                        Slot: {item.slotId ?? "—"} · {item.vehicle?.plate ?? "No plate"}
                                    </Text>
                                    <Text style={{ color: "#444", fontSize: 10, marginTop: 1 }}>
                                        {new Date(item.startTime).toLocaleString()}
                                    </Text>

                                    {/* Badges row */}
                                    <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                                        <View style={{
                                            backgroundColor: sc.bg, borderRadius: 20,
                                            paddingHorizontal: 8, paddingVertical: 2,
                                        }}>
                                            <Text style={{ color: sc.color, fontSize: 10, fontFamily: "Titillium_700Bold" }}>
                                                {item.status}
                                            </Text>
                                        </View>

                                        {item.totalCost !== undefined && (
                                            <View style={{
                                                backgroundColor: "rgba(231,135,46,0.12)", borderRadius: 20,
                                                paddingHorizontal: 8, paddingVertical: 2,
                                            }}>
                                                <Text style={{ color: "#E7872E", fontSize: 10, fontFamily: "Titillium_700Bold" }}>
                                                    ${item.totalCost}
                                                </Text>
                                            </View>
                                        )}

                                        {isCashPending && (
                                            <View style={{
                                                backgroundColor: "rgba(231,135,46,0.08)", borderRadius: 20,
                                                paddingHorizontal: 8, paddingVertical: 2,
                                                borderWidth: 0.5, borderColor: "rgba(231,135,46,0.3)",
                                            }}>
                                                <Text style={{ color: "#E7872E", fontSize: 10, fontFamily: "Titillium_700Bold" }}>
                                                    CASH PENDING
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Actions Container */}
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    {/* Edit Session */}
                                    <Pressable onPress={() => setEditSessionItem(item)} style={{ padding: 8 }}>
                                        <Pencil size={15} color="#4da6ff" />
                                    </Pressable>

                                    {/* Force Cancel — ACTIVE only */}
                                    {isActive && (
                                        <Pressable onPress={() => handleForceCancel(item.id)} style={{ padding: 8 }}>
                                            <X size={15} color="#F97C7C" />
                                        </Pressable>
                                    )}

                                    {/* Confirm Cash — PENDING CASH only */}
                                    {isCashPending && (
                                        <Pressable onPress={() => handleCompleteCash(item.id)} style={{ padding: 8 }}>
                                            <CheckCircle size={15} color="#E7872E" />
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            {/* 1. Confirmation Modal (Cancel / Cash) */}
            <AdminModal<ConfirmSchema>
                visible={!!confirmConfig}
                onClose={() => setConfirmConfig(null)}
                title={confirmConfig?.title ?? ""}
                subtitle={confirmConfig?.subtitle}
                schema={confirmSchema}
                fields={[]}
                submitLabel={confirmConfig?.submitLabel ?? "Confirm"}
                isLoading={forceCancel.isPending || completeCash.isPending}
                onSubmit={() => {
                    confirmConfig?.onConfirm();
                    setConfirmConfig(null);
                }}
            >
                <View style={{ alignItems: "center", paddingVertical: 8, marginBottom: 4 }}>
                    <View style={{
                        width: 52, height: 52, borderRadius: 16,
                        backgroundColor: confirmConfig?.icon === "warning"
                            ? "rgba(249,124,124,0.12)"
                            : "rgba(231,135,46,0.12)",
                        alignItems: "center", justifyContent: "center",
                    }}>
                        {confirmConfig?.icon === "warning"
                            ? <AlertTriangle size={24} color="#F97C7C" />
                            : <CheckCircle size={24} color="#E7872E" />
                        }
                    </View>
                </View>
            </AdminModal>

            {/* 2. Edit Session Modal */}
            <AdminModal<EditSchema>
                visible={!!editSessionItem}
                onClose={() => setEditSessionItem(null)}
                title={`Edit Session #${editSessionItem?.id}`}
                subtitle="Update session slot or status manually."
                schema={editSchema}
                defaultValues={{
                    slotId: editSessionItem?.slotId ?? "",
                    status: editSessionItem?.status ?? "ACTIVE",
                }}
                fields={[
                    { name: "slotId", label: "Slot ID", placeholder: "e.g. A1" },
                    // افترضت إن المودال بتاعك بيدعم الـ Select أو مجرد Text
                    { name: "status", label: "Status (ACTIVE, COMPLETED, CANCELLED)", placeholder: "ACTIVE" }
                ]}
                submitLabel="Save Changes"
                isLoading={editSessionMutation.isPending}
                onSubmit={(data) => {
                    if (editSessionItem) {
                        editSessionMutation.mutate(
                            { id: editSessionItem.id, data },
                            { onSuccess: () => setEditSessionItem(null) }
                        );
                    }
                }}
            />
        </View>
    );
}