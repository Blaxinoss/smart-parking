import { StyledText } from '@/components/ui/styledText';
import Colors from '@/constants/Colors';
import { TransactionStatus } from '@/constants/types';
import { usePaymentHistory, usePayTransaction } from '@/hooks/usePayments';
import { AlertCircle, CreditCard, X } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';

interface DebtModalProps {
    visible: boolean;
    onClose: () => void;
}

const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-EG', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatAmount = (amount: number): string => `EGP ${(amount / 100).toFixed(2)}`;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    [TransactionStatus.PENDING]: {
        color: Colors.danger[900],
        label: 'PENDING',
    },
    [TransactionStatus.UNPAID_EXIT]: {
        color: Colors.danger[700],
        label: 'UNPAID - EXIT',
    },
    [TransactionStatus.COMPLETED]: {
        color: Colors.garage[400],
        label: 'PAID',
    },
    [TransactionStatus.FAILED]: {
        color: Colors.garage[400],
        label: 'FAILED',
    },
    [TransactionStatus.CANCELLED]: {
        color: Colors.garage[400],
        label: 'CANCELLED',
    },
};

const getStatusConfig = (status: string) =>
    STATUS_CONFIG[status] ?? { color: Colors.garage[400], label: status };

export default function DebtModal({ visible, onClose }: DebtModalProps) {
    const { data: transactions, isLoading } = usePaymentHistory();
    const { mutate: payTransaction, isPending, variables } = usePayTransaction();
    const unpaidTransactions = useMemo(
        () =>
            transactions?.filter(
                (t) =>
                    t.transactionStatus === TransactionStatus.PENDING ||
                    t.transactionStatus === TransactionStatus.UNPAID_EXIT ||
                    t.transactionStatus === TransactionStatus.FAILED
            ) ?? [],
        [transactions]
    );

    const totalDebt = useMemo(
        () => unpaidTransactions.reduce((sum, t) => sum + (t.amount ?? 0), 0),
        [unpaidTransactions]
    );




    const hasDebt = unpaidTransactions.length > 0;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            >
                <View
                    className="w-11/12 h-full rounded-3xl bg-garage-900 border border-garage-700 overflow-hidden"
                    style={{ maxHeight: '85%' }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 py-4 border-b border-garage-800">
                        <View className="flex-row items-center gap-3">
                            <View
                                className="h-8 w-8 rounded-lg items-center justify-center"
                                style={{ backgroundColor: `${Colors.danger[900]}25` }}
                            >
                                <AlertCircle size={18} color={Colors.danger[700]} />
                            </View>
                            <StyledText className="text-lg font-titillium-bold text-garage-50">
                                Outstanding Debts
                            </StyledText>
                        </View>
                        <Pressable onPress={onClose} className="p-1">
                            <X size={20} color={Colors.garage[400]} />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <ScrollView
                        className="flex-1 flex-grow"
                        contentContainerStyle={{ padding: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {isLoading ? (
                            <View className="items-center justify-center py-8">
                                <ActivityIndicator size="large" color={Colors.main[900]} />
                            </View>
                        ) : (
                            <View className="gap-3">
                                {/* Total Debt Summary — always shown */}
                                <View
                                    className="p-4 rounded-2xl border mb-2"
                                    style={{
                                        backgroundColor: hasDebt
                                            ? `${Colors.danger[900]}15`
                                            : `${Colors.main[900]}10`,
                                        borderColor: hasDebt
                                            ? `${Colors.danger[900]}40`
                                            : `${Colors.main[900]}30`,
                                    }}
                                >
                                    <StyledText className="text-garage-400 text-xs uppercase mb-2">
                                        Total Amount Due
                                    </StyledText>
                                    <StyledText
                                        className="text-3xl font-titillium-bold"
                                        style={{
                                            color: hasDebt ? Colors.danger[700] : Colors.main[900],
                                        }}
                                    >
                                        {formatAmount(totalDebt)}
                                    </StyledText>
                                </View>

                                {!hasDebt ? (
                                    /* Empty state */
                                    <View className="items-center justify-center py-6">
                                        <View
                                            className="h-12 w-12 rounded-full items-center justify-center mb-3"
                                            style={{ backgroundColor: `${Colors.main[900]}20` }}
                                        >
                                            <CreditCard size={24} color={Colors.main[900]} />
                                        </View>
                                        <StyledText className="text-garage-200 font-titillium-bold text-center mb-1">
                                            No Outstanding Debts
                                        </StyledText>
                                        <StyledText className="text-garage-500 text-xs text-center">
                                            Your account is all clear!
                                        </StyledText>
                                    </View>
                                ) : (
                                    <>
                                        {/* Transaction list */}
                                        <View>
                                            <StyledText className="text-garage-400 text-xs uppercase mb-3">
                                                Transaction Details
                                            </StyledText>
                                            {unpaidTransactions.map((transaction) => {
                                                const { color, label } = getStatusConfig(
                                                    transaction.transactionStatus
                                                );
                                                const title = transaction.parkingSessionId
                                                    ? `Session #${transaction.parkingSessionId}`
                                                    : transaction.reservationId
                                                        ? `Reservation #${transaction.reservationId}`
                                                        : `Transaction #${transaction.id}`;


                                                const isPayingThis = variables === transaction.id && isPending;
                                                return (
                                                    <View
                                                        key={transaction.id}
                                                        className="bg-garage-950 border border-garage-700 rounded-2xl p-4 mb-2"
                                                    >
                                                        <View className="flex-row items-center justify-between mb-2">
                                                            <View className="flex-1">
                                                                <View className="flex-row items-center gap-2 mb-1">
                                                                    <StyledText className="text-garage-100 font-titillium-bold">
                                                                        {title}
                                                                    </StyledText>
                                                                    <View
                                                                        className="px-2 py-0.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor: `${color}25`,
                                                                        }}
                                                                    >
                                                                        <StyledText
                                                                            className="text-[10px] font-titillium-bold"
                                                                            style={{ color }}
                                                                        >
                                                                            {label}
                                                                        </StyledText>
                                                                    </View>
                                                                </View>
                                                                <StyledText className="text-garage-500 text-xs">
                                                                    {formatDate(transaction.createdAt)}
                                                                </StyledText>
                                                            </View>
                                                            <StyledText
                                                                className="text-xl font-titillium-bold"
                                                                style={{ color: Colors.danger[700] }}
                                                            >
                                                                {formatAmount(transaction.amount)}
                                                            </StyledText>
                                                        </View>

                                                        {transaction.paymentMethod && (
                                                            <View className="flex-row items-center gap-1 pt-2 border-t border-garage-800">
                                                                <StyledText className="text-garage-500 text-xs">
                                                                    Method:
                                                                </StyledText>
                                                                <StyledText className="text-garage-300 text-xs font-titillium-bold">
                                                                    {transaction.paymentMethod}
                                                                </StyledText>
                                                            </View>
                                                        )}
                                                        {/* pay button */}
                                                        <View className="mt-2 pt-3 border-t border-garage-800 flex-row justify-between items-center">
                                                            <StyledText className="text-garage-400 text-xs">
                                                                Settle this balance
                                                            </StyledText>

                                                            <TouchableOpacity
                                                                disabled={isPending}
                                                                onPress={() => payTransaction(transaction.id)}
                                                                className="bg-main-900 px-4 py-2 rounded-lg flex-row items-center justify-center min-w-[80px]"
                                                            >
                                                                {isPayingThis ? (
                                                                    <ActivityIndicator size="small" color="black" />
                                                                ) : (
                                                                    <StyledText className="text-black font-titillium-bold text-sm">
                                                                        Pay Now
                                                                    </StyledText>
                                                                )}
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>

                                                );
                                            })}
                                        </View>

                                        {/* Payment info hint */}
                                        <View
                                            className="p-3 rounded-xl mt-1"
                                            style={{ backgroundColor: `${Colors.garage[800]}50` }}
                                        >
                                            <StyledText className="text-garage-400 text-xs">
                                                💡 Please settle your outstanding balance to avoid service
                                                restrictions.
                                            </StyledText>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer — unified */}
                    <View className="border-t border-garage-800 px-5 py-4 gap-2">

                        <TouchableOpacity
                            onPress={onClose}
                            className="px-5 py-3 items-center rounded-xl bg-garage-800"
                        >
                            <StyledText className="text-garage-200 font-titillium-bold">
                                {hasDebt ? 'Cancel' : 'Close'}
                            </StyledText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}