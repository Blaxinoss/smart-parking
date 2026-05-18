import { DoorClosed, DoorOpen, Pencil } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { Gate, useAdminGates, useForceGateCommand, useUpdateGate } from "../../services/useAdminApi";
import AdminModal, { FieldConfig } from "./AdminModal";

const gateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["ENTRY", "EXIT"]),
    status: z.enum(["OPEN", "CLOSED"]),
});
type GateForm = z.infer<typeof gateSchema>;

const fields: FieldConfig[] = [
    { name: "name", label: "Gate Name", placeholder: "Main Entry" },
    {
        name: "type", label: "Type", type: "select",
        options: [
            { label: "Entry", value: "ENTRY" },
            { label: "Exit", value: "EXIT" },
        ],
    },
    {
        name: "status", label: "Status", type: "select",
        options: [
            { label: "Open", value: "OPEN" },
            { label: "Closed", value: "CLOSED" },
        ],
    },
];

export default function GatesSection() {
    const { data: gates, isLoading } = useAdminGates();
    const updateGate = useUpdateGate();
    const forceGateCommand = useForceGateCommand();
    const [editTarget, setEditTarget] = useState<Gate | null>(null);

    const toggleGate = (gate: Gate) => {
        const newStatus = gate.status === "OPEN" ? "CLOSE" : "OPEN";

        forceGateCommand.mutate({
            gateId: gate.id,
            command: newStatus,
            type: gate.type === "ENTRY" ? "enter" : "exit",
            reason: "ADMIN_OVERRIDE"
        });

    };


    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            <View style={{
                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 20, padding: 16, marginBottom: 12,
            }}>
                <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Gates</Text>
                <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                    Edit entry and exit gate settings
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator color="#E7872E" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={gates ?? []}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <EmptyState title="No gates found" subtitle="Gate records will appear here when available from the API." />
                    }
                    renderItem={({ item }) => (
                        <View style={{
                            flexDirection: "row", alignItems: "center",
                            backgroundColor: "#111", borderWidth: 0.5,
                            borderColor: item.status === "OPEN" ? "rgba(80,200,130,0.2)" : "#1e1e1e",
                            borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
                            marginBottom: 6, gap: 12,
                        }}>
                            <View style={{
                                width: 42, height: 42, borderRadius: 13,
                                backgroundColor: item.status === "OPEN" ? "rgba(80,200,130,0.12)" : "rgba(249,124,124,0.1)",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                {item.status === "OPEN"
                                    ? <DoorOpen size={20} color="#50c882" />
                                    : <DoorClosed size={20} color="#F97C7C" />
                                }
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: "#d0d0d0", fontSize: 13, fontFamily: "Titillium_700Bold" }}>{item.name}</Text>
                                <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular" }}>{item.type}</Text>
                            </View>

                            <Pressable
                                onPress={() => toggleGate(item)}
                                style={{
                                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                                    backgroundColor: item.status === "OPEN" ? "rgba(249,124,124,0.1)" : "rgba(80,200,130,0.1)",
                                    borderWidth: 0.5,
                                    borderColor: item.status === "OPEN" ? "rgba(249,124,124,0.25)" : "rgba(80,200,130,0.25)",
                                    marginRight: 4,
                                }}
                            >
                                <Text style={{
                                    fontSize: 11, fontFamily: "Titillium_700Bold",
                                    color: item.status === "OPEN" ? "#F97C7C" : "#50c882",
                                }}>
                                    {item.status === "OPEN" ? "Close" : "Open"}
                                </Text>
                            </Pressable>

                            <Pressable onPress={() => setEditTarget(item)} style={{ padding: 8 }}>
                                <Pencil size={15} color="#444" />
                            </Pressable>
                        </View>
                    )}
                />
            )}

            <AdminModal<GateForm>
                visible={!!editTarget}
                onClose={() => setEditTarget(null)}
                title="Edit Gate"
                subtitle={editTarget?.id}
                schema={gateSchema}
                fields={fields}
                defaultValues={editTarget ? { name: editTarget.name, type: editTarget.type, status: editTarget.status } : undefined}
                onSubmit={(data) => {
                    if (!editTarget) return;
                    updateGate.mutate({ id: editTarget.id, ...data }, { onSuccess: () => setEditTarget(null) });
                }}
                isLoading={updateGate.isPending}
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