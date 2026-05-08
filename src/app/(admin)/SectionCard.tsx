import { ChevronRight, LucideIcon } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface SectionCardProps {
    title: string;
    subtitle?: string;
    count?: number;
    Icon: LucideIcon;
    iconColor?: string;
    iconBg?: string;
    onPress: () => void;
    badge?: string;
    badgeColor?: string;
}

export default function SectionCard({
    title,
    subtitle,
    count,
    Icon,
    iconColor = "#E7872E",
    iconBg = "rgba(231,135,46,0.15)",
    onPress,
    badge,
    badgeColor = "#E7872E",
}: SectionCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center",
                backgroundColor: pressed ? "#161616" : "#111111",
                borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 18,
                paddingHorizontal: 14, paddingVertical: 13,
                marginBottom: 6, gap: 12,
            })}
        >
            <View style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: iconBg,
                alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}>
                <Icon size={18} color={iconColor} />
            </View>

            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: "#d0d0d0", fontSize: 14, fontFamily: "Titillium_700Bold" }}>{title}</Text>
                    {badge && (
                        <View style={{
                            backgroundColor: "rgba(249,124,124,0.12)",
                            borderWidth: 0.5, borderColor: "rgba(249,124,124,0.3)",
                            borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2,
                        }}>
                            <Text style={{ color: "#F97C7C", fontSize: 9, fontFamily: "Titillium_700Bold" }}>{badge}</Text>
                        </View>
                    )}
                </View>
                {subtitle && (
                    <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 1 }}>{subtitle}</Text>
                )}
                {count !== undefined && (
                    <Text style={{ color: "#3a3a3a", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 1 }}>{count} records</Text>
                )}
            </View>

            <ChevronRight size={16} color="#2a2a2a" />
        </Pressable>
    );
}