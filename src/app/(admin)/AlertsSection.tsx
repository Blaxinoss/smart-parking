import Colors from "@/constants/Colors";
import { IAlert } from "@/constants/types";
import {
    BellRing,
    CameraOff,
    CheckCircle,
    Clock,
    Eye,
    HelpCircle,
    ShieldAlert,
    Split,
    ToolCase,
    User
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useAdminAlerts, useResolveAlert } from "./useAdminApi";

// Mapping Icons to Alert Types
const AlertIcons: Record<string, React.ElementType> = {
    violation: ShieldAlert,
    overtime: Clock,
    maintenance_needed: ToolCase,
    camera_offline: CameraOff,
    suspicious_activity: Eye,
    slot_conflict: Split,
    no_show: User,
    payment_help_request: HelpCircle,
};

export default function AlertsSection() {
    const { data: alerts, isLoading } = useAdminAlerts();
    const resolveAlert = useResolveAlert();

    const sorted = [...(alerts ?? [])].sort((a, b) => {
        const aRes = a.status === 'resolved' ? 1 : 0;
        const bRes = b.status === 'resolved' ? 1 : 0;
        return aRes - bRes;
    });
    const reslovedLength = alerts?.filter(it => it.status === 'resolved').length
    const UnreslovedLength = alerts?.filter(it => it.status === 'pending').length

    const SeverityColorsBg: Record<string, string> = {
        critical: "rgba(255, 69, 58, 0.12)",
        high: "rgba(231, 135, 46, 0.12)",
        medium: "rgba(255, 214, 10, 0.08)",
        low: "rgba(48, 209, 88, 0.08)",
    };

    const SeverityColorsText: Record<string, string> = {
        CRITICAL: "#FF453A",
        HIGH: "#E7872E",
        MEDIUM: "#FFD60A",
        LOW: "#30D958",
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            <View className="rounded-[28px] bg-garage-950 px-4 py-4 mb-4 border border-garage-800">
                <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                        <Text className="text-main-50 text-2xl font-titillium_bold">Alerts</Text>
                        <Text className="text-garage-300 text-xs font-titillium mt-0.5">
                            Triage incidents by severity and resolve the urgent ones first.
                        </Text>
                    </View>
                    <View className="w-11 h-11 rounded-2xl bg-main-900 items-center justify-center border border-main-700">
                        <BellRing size={20} color={Colors.garage[950]} />
                    </View>
                </View>

                <View className="flex-row flex-wrap gap-2 mt-4">
                    <View className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">
                        <Text className="text-main-50 text-[10px] font-titillium_bold uppercase tracking-[0.2em]">{sorted.length} total</Text>
                    </View>
                    <View className="px-3 py-1.5 rounded-full bg-danger-700/20 border border-danger-700/30">
                        <Text className="text-danger-100 text-[10px] font-titillium_bold uppercase tracking-[0.2em]">{reslovedLength} open</Text>
                    </View>
                    <View className="px-3 py-1.5 rounded-full bg-main-900/20 border border-main-900/30">
                        <Text className="text-main-50 text-[10px] font-titillium_bold uppercase tracking-[0.2em]">{UnreslovedLength} resolved</Text>
                    </View>
                </View>
            </View>
            {isLoading ? (
                <ActivityIndicator color="#E7872E" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={sorted}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }: { item: IAlert }) => {
                        const isResolved = item.status === 'resolved';
                        const sevKey = item.severity.toLowerCase();
                        const textKey = item.severity.toUpperCase();

                        const bgColor = SeverityColorsBg[sevKey] || "#1a1a1a";
                        const textColor = SeverityColorsText[textKey] || "#555";
                        const IconComponent = AlertIcons[item.alert_type] || BellRing;

                        return (
                            <View style={{
                                backgroundColor: "#111",
                                borderWidth: 0.8,
                                borderColor: isResolved ? "#1e1e1e" : textColor + '50',
                                borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14,
                                marginBottom: 10,
                                opacity: isResolved ? 0.5 : 1,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                                    {/* Icon Box */}
                                    <View style={{
                                        width: 44, height: 44, borderRadius: 14,
                                        backgroundColor: isResolved ? "#000" : textColor + "15",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <IconComponent size={22} color={isResolved ? "#444" : textColor} />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={{
                                                color: isResolved ? "#666" : textColor,
                                                fontSize: 11,
                                                letterSpacing: 0.5,
                                                textTransform: 'uppercase'
                                            }}>
                                                {item.alert_type.replace('_', ' ')}
                                            </Text>
                                            {!isResolved && (
                                                <View style={{
                                                    backgroundColor: textColor + "20",
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 2,
                                                    borderRadius: 6
                                                }}>
                                                    <Text style={{ color: textColor, fontSize: 8, fontWeight: '800' }}>
                                                        {textKey}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        <Text style={{
                                            color: isResolved ? "#555" : "#ddd",
                                            fontSize: 13,
                                            lineHeight: 18,
                                            marginTop: 4
                                        }}>
                                            {item.description}
                                        </Text>

                                        {/* Meta Information */}
                                        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', gap: 12 }}>
                                            {item.details?.userId && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <User size={12} color="#444" />
                                                    <Text style={{ color: "#444", fontSize: 10 }}>User {item.details.userId}</Text>
                                                </View>
                                            )}
                                            <Text style={{ color: "#333", fontSize: 10 }}>
                                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>

                                    {!isResolved && (
                                        <Pressable
                                            onPress={() => resolveAlert.mutate(item._id)}
                                            style={({ pressed }) => ({
                                                alignSelf: 'center',
                                                padding: 10,
                                                borderRadius: 12,
                                                backgroundColor: "#000",
                                                borderWidth: 1,
                                                borderColor: "#222",
                                                opacity: pressed ? 0.6 : 1
                                            })}
                                        >
                                            <CheckCircle size={20} color={textColor} />
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}