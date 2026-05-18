import { Cpu, Pencil, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { Device, useAdminDevices, useCreateDevice, useDeleteDevice, useUpdateDevice } from "../../services/useAdminApi";
import AdminModal, { FieldConfig } from "./AdminModal";

const deviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["SENSOR", "CAMERA", "GATE"]),
    status: z.enum(["online", "offline"]),  // ✅ lowercase
    slotId: z.string().optional().nullable(),
});
type DeviceForm = z.infer<typeof deviceSchema>;

const fields: FieldConfig[] = [
    { name: "name", label: "Device Name", placeholder: "Sensor A1" },
    {
        name: "type", label: "Type", type: "select",
        options: [
            { label: "Sensor", value: "SENSOR" },
            { label: "Camera", value: "CAMERA" },
            { label: "Gate", value: "GATE" },
        ],
    },
    {
        name: "status", label: "Status", type: "select",
        options: [
            { label: "Online", value: "online" },   // ✅
            { label: "Offline", value: "offline" },  // ✅
        ],
    },
    { name: "slotId", label: "Linked Slot (optional)", placeholder: "A-01" },
];

export default function DevicesSection() {
    const { data: devices, isLoading } = useAdminDevices();
    const createDevice = useCreateDevice();
    const updateDevice = useUpdateDevice();
    const deleteDevice = useDeleteDevice();

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Device | null>(null);

    const handleDelete = (device: Device) => {
        if (confirm("are you sure?")) {
            deleteDevice.mutate(device._id)
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
                    <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Devices</Text>
                    <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                        Manage sensors, cameras and gates
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
                    data={devices ?? []}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <EmptyState title="No devices yet" subtitle="Add the first device to connect the hardware layer." />
                    }
                    renderItem={({ item }) => (
                        <View style={{
                            flexDirection: "row", alignItems: "center",
                            backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                            borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
                            marginBottom: 6, gap: 12,
                        }}>
                            <View style={{
                                width: 38, height: 38, borderRadius: 12,
                                backgroundColor: "rgba(167,139,250,0.12)",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <Cpu size={18} color="#a78bfa" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: "#d0d0d0", fontSize: 13, fontFamily: "Titillium_700Bold" }}>{item.name}</Text>
                                <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular" }}>
                                    {item.type}{item.slotId ? ` · Slot ${item.slotId}` : ""}
                                </Text>
                                <View style={{
                                    marginTop: 4, alignSelf: "flex-start",
                                    backgroundColor: item.status === "online" ? "rgba(80,200,130,0.1)" : "rgba(249,124,124,0.1)",
                                    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
                                }}>
                                    <Text style={{
                                        color: item.status === "offline" ? "#50c882" : "#F97C7C",
                                        fontSize: 10, fontFamily: "Titillium_700Bold",
                                    }}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                            <Pressable onPress={() => setEditTarget(item)} style={{ padding: 8 }}>
                                <Pencil size={15} color="#444" />
                            </Pressable>
                            <Pressable onPress={() => handleDelete(item)} style={{ padding: 8 }}>
                                <Trash2 size={15} color="#F97C7C" />
                            </Pressable>
                        </View>
                    )}
                />
            )}

            <AdminModal<DeviceForm>
                visible={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Add Device"
                schema={deviceSchema}
                fields={fields}
                defaultValues={{ status: "online", type: "SENSOR" }}
                onSubmit={(data) => createDevice.mutate(data, { onSuccess: () => setCreateOpen(false) })}
                isLoading={createDevice.isPending}
                submitLabel="Add Device"
            />
            <AdminModal<DeviceForm>
                visible={!!editTarget}
                onClose={() => setEditTarget(null)}
                title="Edit Device"
                subtitle={editTarget?._id}
                schema={deviceSchema}
                fields={fields}
                defaultValues={editTarget ? { name: editTarget.name, type: editTarget.type, status: editTarget.status, slotId: editTarget.slotId } : undefined}
                onSubmit={(data) => {
                    if (!editTarget) return;
                    updateDevice.mutate({ id: editTarget._id, ...data }, { onSuccess: () => setEditTarget(null) });
                }}
                isLoading={updateDevice.isPending}
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