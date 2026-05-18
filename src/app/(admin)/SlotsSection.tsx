import { IParkingSlot, SlotStatus } from "@/constants/types";
import { ParkingSquare, Pencil, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { useAdminSlots, useCreateSlot, useDeleteSlot, useUpdateSlot } from "../../services/useAdminApi";
import AdminModal, { FieldConfig } from "./AdminModal";

const slotSchema = z.object({
    // Using _id because your FlatList uses item._id and your delete mutation uses _id
    slotId: z.string().min(1, "Slot ID is required"),
    status: z.enum(SlotStatus),

    type: z.enum(["REGULAR", "EMERGENCY"]).optional(),


    current_vehicle: z.object({
        plate_number: z.string().optional(),
        occupied_since: z.date().optional(),
    }).optional(),

    conflict_details: z.object({
        expected_plate: z.string(),
    }).optional(),

    stats: z.object({
        total_uses_today: z.number().default(0),
        average_duration_minutes: z.number().default(0),
    }).default({ total_uses_today: 0, average_duration_minutes: 0 }),
});

type SlotForm = z.infer<typeof slotSchema>;


const fields: FieldConfig<IParkingSlot>[] = [
    { name: "slotId", label: "Slot ID", placeholder: "A-01" },
    {
        name: "type", type: "select", label: "Slot type",
        options: [
            { label: "Regular", value: "REGULAR" },
            { label: "Emergency", value: "EMERGENCY" },

        ]
    },
    {
        name: "status",
        label: "Status",
        type: "select",
        options: [
            { label: "Available", value: SlotStatus.AVAILABLE },
            { label: "Occupied", value: SlotStatus.OCCUPIED },
            { label: "Reserved", value: SlotStatus.RESERVED },
            { label: "Maintenance", value: SlotStatus.MAINTENANCE },
            { label: "Disabled", value: SlotStatus.DISABLED },
            { label: "Conflict", value: SlotStatus.CONFLICT },
            { label: "Assigned", value: SlotStatus.ASSIGNED },
        ],
    },

    {
        name: "floorLevel",
        label: "Floor Level",
        type: "number",
        placeholder: "1",
        keyboardType: "numeric",

    },
];



export default function SlotsSection() {
    const { data: slots, isLoading } = useAdminSlots();
    const createSlot = useCreateSlot();
    const updateSlot = useUpdateSlot();
    const deleteSlot = useDeleteSlot();

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<IParkingSlot | null>(null);
    const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
        [SlotStatus.AVAILABLE]: { color: "#50c882", bg: "rgba(80,200,130,0.12)" },
        [SlotStatus.OCCUPIED]: { color: "#F97C7C", bg: "rgba(249,124,124,0.12)" },
        [SlotStatus.RESERVED]: { color: "#E7872E", bg: "rgba(231,135,46,0.12)" },
        [SlotStatus.MAINTENANCE]: { color: "#6366f1", bg: "rgba(99,102,241,0.12)" }, // Indigo
        [SlotStatus.DISABLED]: { color: "#666", bg: "#1a1a1a" },
        [SlotStatus.CONFLICT]: { color: "#FF4500", bg: "rgba(255,69,0,0.12)" },    // Orange-Red
        [SlotStatus.ASSIGNED]: { color: "#2E90FA", bg: "rgba(46,144,250,0.12)" },  // Blue
    };
    const handleDelete = (slot: IParkingSlot) => {
        if (confirm(`Delete slot "${slot._id}"?`)) {
            deleteSlot.mutate(slot._id);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            <View style={{
                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 20, padding: 16, marginBottom: 12,
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Parking Slots</Text>
                    <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                        Configure capacity and status
                    </Text>
                </View>
                <Pressable
                    onPress={() => setCreateOpen(true)}
                    style={{
                        flexDirection: "row", alignItems: "center", gap: 6,
                        backgroundColor: "#E7872E", borderRadius: 12,
                        paddingHorizontal: 14, paddingVertical: 8,
                    }}
                >
                    <Plus size={14} color="#0a0a0a" />
                    <Text style={{ color: "#0a0a0a", fontSize: 13, fontFamily: "Titillium_700Bold" }}>New</Text>
                </Pressable>
            </View>

            {isLoading ? (
                <ActivityIndicator color="#E7872E" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={slots ?? []}
                    keyExtractor={(item: IParkingSlot) => item._id}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 8 }}
                    contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <EmptyState
                            title="No slots yet"
                            subtitle="Create the first slot to start managing occupancy."
                        />
                    }
                    renderItem={({ item }) => {
                        const sc = STATUS_COLORS[item.status] ?? { color: "#444", bg: "#1a1a1a" };

                        return (
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: "#111",
                                    borderWidth: 1,
                                    borderColor: sc.color + "40",
                                    borderRadius: 18,
                                    padding: 12,
                                }}
                            >
                                {/* Header */}
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 10,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 12,
                                            backgroundColor: "#0a0a0a",
                                            borderWidth: 1,
                                            borderColor: sc.color + "30",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <ParkingSquare size={18} color={sc.color} />
                                    </View>

                                    <View style={{ flexDirection: "row", gap: 8 }}>
                                        <Pressable
                                            onPress={() => setEditTarget(item)}
                                            style={{ padding: 6 }}
                                        >
                                            <Pencil size={13} color="#666" />
                                        </Pressable>

                                        <Pressable
                                            onPress={() => handleDelete(item)}
                                            style={{ padding: 6 }}          // ✅ زود من 6 لـ 10
                                        >
                                            <Trash2 size={13} color="#F97C7C" />
                                        </Pressable>
                                    </View>
                                </View>

                                {/* Slot ID */}
                                <Text
                                    style={{
                                        color: "#f1f1f1",
                                        fontSize: 14,
                                        fontFamily: "Titillium_700Bold",
                                    }}
                                >
                                    {item._id}
                                </Text>



                                {/* Vehicle */}
                                {item.current_vehicle?.plate_number && (
                                    <View style={{ marginTop: 8 }}>
                                        <Text
                                            style={{
                                                color: "#888",
                                                fontSize: 10,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Vehicle
                                        </Text>

                                        <Text
                                            style={{
                                                color: "#d6d6d6",
                                                fontSize: 12,
                                                marginTop: 1,
                                                fontFamily: "Titillium_700Bold",
                                            }}
                                        >
                                            {item.current_vehicle.plate_number}
                                        </Text>
                                    </View>
                                )}

                                {/* Occupied Since */}
                                {item.current_vehicle?.occupied_since && (
                                    <Text
                                        style={{
                                            color: "#555",
                                            fontSize: 10,
                                            marginTop: 4,
                                        }}
                                    >
                                        Since{" "}
                                        {new Date(
                                            item.current_vehicle.occupied_since
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                )}

                                {/* Conflict Details */}
                                {item.status === SlotStatus.CONFLICT &&
                                    item.conflict_details && (
                                        <View
                                            style={{
                                                marginTop: 8,
                                                padding: 8,
                                                borderRadius: 10,
                                                backgroundColor: "rgba(249,124,124,0.08)",
                                                borderWidth: 1,
                                                borderColor: "rgba(249,124,124,0.15)",
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: "#F97C7C",
                                                    fontSize: 10,
                                                    fontFamily: "Titillium_700Bold",
                                                }}
                                            >
                                                CONFLICT DETECTED
                                            </Text>

                                            <Text
                                                style={{
                                                    color: "#aaa",
                                                    fontSize: 10,
                                                    marginTop: 2,
                                                }}
                                            >
                                                Expected plate:{" "}
                                                {item.conflict_details.expected_plate}
                                            </Text>
                                        </View>
                                    )}

                                {/* Stats */}
                                <View
                                    style={{
                                        marginTop: 10,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 10,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "#555",
                                            fontSize: 10,
                                        }}
                                    >
                                        Uses today: {item.stats.total_uses_today}
                                    </Text>

                                    <Text
                                        style={{
                                            color: "#555",
                                            fontSize: 10,
                                        }}
                                    >
                                        Avg: {item.stats.average_duration_minutes}m
                                    </Text>
                                </View>

                                {/* Status Badge */}
                                <View
                                    style={{
                                        marginTop: 10,
                                        alignSelf: "flex-start",
                                        backgroundColor: sc.bg,
                                        borderRadius: 20,
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderWidth: 1,
                                        borderColor: sc.color + "30",
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: sc.color,
                                            fontSize: 10,
                                            fontFamily: "Titillium_700Bold",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {item.status.replace("_", " ")}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            )}

            <AdminModal<SlotForm>
                visible={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create Slot"
                schema={slotSchema}
                fields={fields}
                defaultValues={{ status: SlotStatus.AVAILABLE, type: "REGULAR" }}
                onSubmit={(data) => createSlot.mutate(data, { onSuccess: () => setCreateOpen(false) })}
                isLoading={createSlot.isPending}
                submitLabel="Create Slot"
            />
            <AdminModal<SlotForm>
                visible={!!editTarget}
                onClose={() => setEditTarget(null)}
                title="Edit Slot"
                subtitle={editTarget?._id}
                schema={slotSchema}
                fields={fields}
                defaultValues={editTarget ? {
                    slotId: editTarget._id,
                    status: editTarget.status,
                    stats: {
                        total_uses_today: editTarget.stats?.total_uses_today ?? 0,
                        average_duration_minutes: editTarget.stats?.average_duration_minutes ?? 0,
                    },
                    current_vehicle: {
                        plate_number: editTarget.current_vehicle?.plate_number ?? "",
                        occupied_since: editTarget.current_vehicle?.occupied_since
                            ? new Date(editTarget.current_vehicle.occupied_since)
                            : undefined,
                    },
                    conflict_details: {
                        expected_plate: editTarget.conflict_details?.expected_plate ?? "",
                    },
                    type: (editTarget.type as "REGULAR" | "EMERGENCY") ?? "REGULAR",
                } : undefined}

                onSubmit={(data) => {
                    if (!editTarget) return;
                    updateSlot.mutate(
                        {
                            slotId: editTarget._id,
                            newId: data.slotId !== editTarget._id ? data.slotId : undefined,
                            status: data.status,
                            type: data.type,
                        },
                        { onSuccess: () => setEditTarget(null) }
                    );
                }}

                isLoading={updateSlot.isPending}

                submitLabel="Save Changes"
            />
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