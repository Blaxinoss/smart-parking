import { CreditCard } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useAdminTransactions } from "./useAdminApi";

const TYPE: Record<string, { color: string; bg: string }> = {
    PAYMENT: { color: "#50c882", bg: "rgba(80,200,130,0.12)" },
    REFUND: { color: "#64a0ff", bg: "rgba(100,160,255,0.12)" },
    DEBT: { color: "#F97C7C", bg: "rgba(249,124,124,0.1)" },
};

export default function TransactionsSection() {
    const { data: transactions, isLoading } = useAdminTransactions();

    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            <View style={{
                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 20, padding: 16, marginBottom: 12,
            }}>
                <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Transactions</Text>
                <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                    Monitor payments, refunds and debts
                </Text>
            </View>

            {isLoading ? (
                <ActivityIndicator color="#E7872E" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <EmptyState title="No transactions yet" subtitle="Once payments are processed they will appear here." />
                    }
                    renderItem={({ item }) => {
                        const tc = TYPE[item.type] ?? { color: "#555", bg: "#1a1a1a" };
                        return (
                            <View style={{
                                flexDirection: "row", alignItems: "center",
                                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                                borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
                                marginBottom: 6, gap: 12,
                            }}>
                                <View style={{
                                    width: 38, height: 38, borderRadius: 12,
                                    backgroundColor: tc.bg,
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <CreditCard size={18} color={tc.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: "#d0d0d0", fontSize: 13, fontFamily: "Titillium_700Bold" }}>
                                        #{item.id} · ${item.amount}
                                    </Text>
                                    <Text style={{ color: "#444", fontSize: 10, fontFamily: "Titillium_400Regular", marginTop: 1 }}>
                                        {new Date(item.createdAt).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={{
                                    backgroundColor: tc.bg, borderRadius: 20,
                                    paddingHorizontal: 10, paddingVertical: 4,
                                }}>
                                    <Text style={{ color: tc.color, fontSize: 10, fontFamily: "Titillium_700Bold" }}>{item.type}</Text>
                                </View>
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