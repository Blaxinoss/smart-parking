import { CheckCircle, CreditCard } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
// استيراد الـ Hooks (تأكد من مسار الاستيراد الصحيح عندك)
import { useAdminTransactions, useUpdateTransactionStatus } from "../../services/useAdminApi";
// استيراد الـ Enum لو موجود عندك، أو ممكن نستخدم النصوص العادية "COMPLETED" و "REFUNDED"
import { TransactionStatus } from "../../constants/types";

const STATUS_UI: Record<string, { color: string; bg: string }> = {
    COMPLETED: { color: "#50c882", bg: "rgba(80,200,130,0.12)" },
    PENDING: { color: "#E7872E", bg: "rgba(231,135,46,0.12)" },
    REFUNDED: { color: "#64a0ff", bg: "rgba(100,160,255,0.12)" },
    CANCELLED: { color: "#F97C7C", bg: "rgba(249,124,124,0.1)" },
};

export default function TransactionsSection() {
    const { data: transactions, isLoading } = useAdminTransactions();
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateTransactionStatus();

    return (
        <View style={{ flex: 1, backgroundColor: "#0a0a0a", paddingHorizontal: 16, paddingTop: 16 }}>
            <View style={{
                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                borderRadius: 20, padding: 16, marginBottom: 12,
            }}>
                <Text style={{ color: "#e8e8e8", fontSize: 18, fontFamily: "Titillium_700Bold" }}>Transactions</Text>
                <Text style={{ color: "#555", fontSize: 11, fontFamily: "Titillium_400Regular", marginTop: 2 }}>
                    Monitor and confirm payments
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
                        // بنستخدم transactionStatus بدل type عشان ده اللي بيعبر عن الحالة الحقيقية
                        const statusUI = STATUS_UI[item.transactionStatus] ?? { color: "#555", bg: "#1a1a1a" };

                        return (
                            <View style={{
                                backgroundColor: "#111", borderWidth: 0.5, borderColor: "#1e1e1e",
                                borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
                                marginBottom: 6, gap: 12,
                            }}>
                                {/* معلومات الترانزاكشن الأساسية */}
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                    <View style={{
                                        width: 38, height: 38, borderRadius: 12,
                                        backgroundColor: statusUI.bg,
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <CreditCard size={18} color={statusUI.color} />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: "#d0d0d0", fontSize: 13, fontFamily: "Titillium_700Bold" }}>
                                            #{item.id} · ${item.amount}
                                        </Text>
                                        <Text style={{ color: "#444", fontSize: 10, fontFamily: "Titillium_400Regular", marginTop: 1 }}>
                                            {new Date(item.createdAt).toLocaleString()} · {item.paymentMethod}
                                        </Text>
                                    </View>

                                    <View style={{
                                        backgroundColor: statusUI.bg, borderRadius: 20,
                                        paddingHorizontal: 10, paddingVertical: 4,
                                    }}>
                                        <Text style={{ color: statusUI.color, fontSize: 10, fontFamily: "Titillium_700Bold" }}>
                                            {item.transactionStatus}
                                        </Text>
                                    </View>
                                </View>

                                {/* ─── أزرار الإجراءات (Actions) تظهر فقط لو الحالة محتاجة تدخل ─── */}
                                {item.transactionStatus === "PENDING" && (
                                    <View style={{ borderTopWidth: 0.5, borderColor: "#1e1e1e", paddingTop: 10, flexDirection: "row", gap: 8 }}>
                                        <TouchableOpacity
                                            disabled={isUpdating}
                                            onPress={() => updateStatus({ id: item.id, status: TransactionStatus.COMPLETED })}
                                            style={{
                                                flex: 1, backgroundColor: "rgba(80,200,130,0.15)", borderRadius: 12,
                                                paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6
                                            }}
                                        >
                                            <CheckCircle size={14} color="#50c882" />
                                            <Text style={{ color: "#50c882", fontSize: 12, fontFamily: "Titillium_700Bold" }}>
                                                Confirm Cash & Open Gate
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* {item.transactionStatus === "COMPLETED" && (
                                    <View style={{ borderTopWidth: 0.5, borderColor: "#1e1e1e", paddingTop: 10, flexDirection: "row", gap: 8 }}>
                                        <TouchableOpacity
                                            disabled={isUpdating}
                                            onPress={() => updateStatus({ id: item.id, status: TransactionStatus.REFUNDED })}
                                            style={{
                                                backgroundColor: "rgba(249,124,124,0.1)", borderRadius: 12,
                                                paddingVertical: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 6
                                            }}
                                        >
                                            <RotateCcw size={12} color="#F97C7C" />
                                            <Text style={{ color: "#F97C7C", fontSize: 11, fontFamily: "Titillium_700Bold" }}>
                                                Issue Refund
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )} */}
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