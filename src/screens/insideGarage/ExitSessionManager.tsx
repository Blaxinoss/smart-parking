import React, { useEffect } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation
} from 'react-native-reanimated';
import { StyledText } from '@/components/ui/styledText';
import { Icon } from '@/components/ui/icon';
import { LogOut, Receipt, CheckCircle2, Info, Clock, AlertTriangle, Cross, Banknote, XCircle } from 'lucide-react-native';
import { ParkingSession, TransactionStatus } from '@/constants/types';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MINIMUM_CHARGE } from '@/constants/constants';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

interface gateStateInterface {
    decision: string,
    reason: string,
    message: string,
}
interface ExitSessionManagerProps {
    session: ParkingSession;
    bottomSheetRef?: any;
}

export const ExitSessionManager = ({ session, bottomSheetRef }: ExitSessionManagerProps) => {
    const queryClient = useQueryClient();
    const { data: gateState } = useQuery<gateStateInterface | null>({
        queryKey: ["exitGateState"],
        enabled: false,
        initialData: null,
        queryFn: async () => null,
    });
    // ============================================================================
    // 💸 Payment & Session Data Extraction
    // ============================================================================
    const latestTx = session?.paymentTransaction?.[0];
    const billAmount = latestTx?.amount ? (latestTx.amount) / 100 : '0.00';
    const isPaid = latestTx?.transactionStatus === TransactionStatus.COMPLETED;
    const isFailed = latestTx?.transactionStatus === TransactionStatus.FAILED;

    // هل اليوزر عمل مخالفة؟
    const hasConflict = session?.involvedInConflict === true;

    // حساب الوقت اللي قضاه جوه الجراج (ساعات ودقائق)
    const calculateDuration = () => {
        if (!session?.entryTime || !session?.exitTime) return '0h 0m';
        const entry = new Date(session.entryTime).getTime();
        const exit = new Date(session.exitTime).getTime();
        const diffMs = Math.max(0, exit - entry);

        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };
    const totalDuration = calculateDuration();

    // ============================================================================
    // 🌊 Pulse Animation
    // ============================================================================
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.5);

    useEffect(() => {
        pulseScale.value = withRepeat(withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false);
        pulseOpacity.value = withRepeat(withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, false);

        return () => {
            cancelAnimation(pulseScale);
            cancelAnimation(pulseOpacity);
        };
    }, []);

    const animatedPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    useEffect(() => {
        let timer: number // استخدمنا NodeJS.Timeout عشان ميعملش Error في Typescript

        if (gateState?.decision === "ALLOW_EXIT") {
            timer = setTimeout(() => {
                // 1. نفرمت الداتا عشان لو فتح الشاشة تاني ميلاقيش الرسالة الخضراء
                queryClient.setQueryData(["exitGateState"], null);

                // 2. نقفل الـ Bottom Sheet خالص (لو الـ Ref متاح)
                if (bottomSheetRef?.current) {
                    bottomSheetRef.current.snapToIndex(0);
                }
            }, 5000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [gateState, queryClient, bottomSheetRef]); // ضفناهم هنا كـ Best Practice
    // ============================================================================
    // 🎨 UI Variables
    // ============================================================================
    const statusColor = isPaid ? '#10b981' : isFailed ? '#ef4444' : '#E7872E';
    const statusBg = isPaid ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-main-900';
    const statusBorder = isPaid ? 'border-green-500' : isFailed ? 'border-red-500' : 'border-main-900';
    const isAllowed = gateState?.decision === 'ALLOW_EXIT';
    const isDenied = gateState?.decision === 'DENY_EXIT';

    // 2. تحديد اللون الصريح (Hex)
    const exitingColor = isAllowed ? '#10b981' : isDenied ? '#ef4444' : '#E7872E';

    // 3. تحديد كلاسات Tailwind صريحة بالكامل (عشان الـ Compiler يقرأها صح)
    const statusContainerClass = isAllowed
        ? "bg-green-500/10 border-green-500/30"
        : isDenied
            ? "bg-red-500/10 border-red-500/30"
            : "bg-orange-500/10 border-orange-500/30";

    // 4. اختيار الأيقونة
    const StatusIcon = isAllowed ? CheckCircle2 : isDenied ? XCircle : Clock;

    // 5. النص اللي هيظهر
    const statusText = isAllowed ? "ALLOWED" : isDenied ? "DENIED" : "PENDING";

    let centerText = "Proceed to Exit Gate";
    let CenterIcon = LogOut;
    let centerIconColor = statusColor;
    let centerBg = statusBg;
    if (isAllowed) {
        centerText = "Gate Opened!\nHave a safe trip.";
        CenterIcon = CheckCircle2;
        centerIconColor = "#10b981"; // أخضر
        centerBg = "bg-green-500";
    } else if (isDenied) {
        centerText = gateState?.reason === 'CASH_PAYMENT_PENDING'
            ? "Cash Payment Required"
            : "Access Denied";
        CenterIcon = gateState?.reason === 'CASH_PAYMENT_PENDING' ? Banknote : XCircle;
        centerIconColor = "#ef4444"; // أحمر
        centerBg = "bg-red-500";
    }
    return (
        <BottomSheetScrollView>
            <View className="flex-1 w-full px-6 py-8 justify-between">

                {/* ========== 1. Header Section ========== */}
                <View className="flex-row justify-between">
                    <View>
                        <StyledText className='text-garage-400 font-titillium-bold text-sm uppercase tracking-wide mb-2'>
                            Session Status
                        </StyledText>
                        <View className={`flex-row items-center gap-2 ${statusBg}/10 self-start px-4 py-2 rounded-full border border-${statusBorder}/30`}>
                            <Icon as={CheckCircle2} size={18} color={statusColor} />
                            <StyledText style={{ color: statusColor }} className="font-titillium-bold text-base">
                                COMPLETED
                            </StyledText>
                        </View>
                    </View>
                    <View>
                        <StyledText className='text-garage-400 font-titillium-bold text-sm uppercase tracking-wide mb-2 text-right'>
                            Exit Status
                        </StyledText>
                        <View className={`flex-row items-center gap-2 self-start px-4 py-2 rounded-full border ${statusContainerClass}`}>
                            <Icon as={StatusIcon} size={18} color={exitingColor} />
                            <StyledText style={{ color: exitingColor }} className="font-titillium-bold text-base">
                                {statusText}
                            </StyledText>
                        </View>
                    </View>
                </View>

                {/* ========== 2. Visual Center ========== */}
                <View className="items-center justify-center my-8 relative h-48">
                    <StyledText className="text-white text-3xl font-titillium-bold mb-6 text-center">
                        {centerText}
                    </StyledText>

                    <View className="relative items-center justify-center">
                        <Animated.View style={animatedPulseStyle} className={`absolute w-28 h-28 ${centerBg}/30 rounded-full`} />
                        <View className={`w-28 h-28 rounded-full items-center justify-center border-4 ${centerBg}/20 bg-garage-900 shadow-2xl z-10`}>
                            <View className={`${centerBg}/20 p-4 rounded-full`}>
                                <Icon as={CenterIcon} size={40} color={centerIconColor} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* ========== 3. Bottom Section (Flushed completely on ALLOW_EXIT) ========== */}
                {!isAllowed && (
                    <View className="w-full gap-3 mt-4">

                        {/* Row 1: Bill & Duration */}
                        <View className="flex-row gap-3">
                            {/* Bill Card - Always visible if not allowed */}
                            <View className="flex-1 bg-garage-900 rounded-2xl border-2 border-garage-700 p-4 shadow-xl">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <View className={`${statusBg}/20 p-2 rounded-full`}>
                                        <Icon as={Receipt} size={18} color={statusColor} />
                                    </View>
                                    <StyledText className="text-garage-400 text-xs uppercase font-titillium-bold">Total Bill</StyledText>
                                </View>
                                <StyledText className="text-white text-2xl font-titillium-bold tracking-wider">
                                    {billAmount} <StyledText className="text-sm text-garage-400">EGP</StyledText>
                                </StyledText>
                                {+billAmount === MINIMUM_CHARGE && (
                                    <StyledText className="text-xs text-garage-400 mt-1">Minimum charge applied</StyledText>
                                )}
                            </View>

                            {/* Duration Card - Hidden if Denied (e.g., waiting for cash) */}
                            {!isDenied && (
                                <View className="flex-1 bg-garage-900 rounded-2xl border-2 border-garage-700 p-4 shadow-xl">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <View className="bg-purple-500/20 p-2 rounded-full">
                                            <Icon as={Clock} size={18} color="#a855f7" />
                                        </View>
                                        <StyledText className="text-garage-400 text-xs uppercase font-titillium-bold">Duration</StyledText>
                                    </View>
                                    <StyledText className="text-white text-2xl font-titillium-bold tracking-wider">
                                        {totalDuration}
                                    </StyledText>
                                </View>
                            )}
                        </View>

                        {/* Row 2: Vehicle & Conflict (Hidden if Denied) */}
                        {!isDenied && (
                            <>
                                <View className="flex-row gap-3">
                                    <View className="flex-1 bg-garage-900 rounded-2xl border-2 border-garage-700 p-4 shadow-xl">
                                        <View className="flex-row items-center gap-2 mb-2">
                                            <View className="bg-blue-500/20 p-2 rounded-full">
                                                <MaterialCommunityIcons name="license" size={18} color="#3b82f6" />
                                            </View>
                                            <StyledText className="text-garage-400 text-xs uppercase font-titillium-bold">Vehicle</StyledText>
                                        </View>
                                        <StyledText className="text-white text-xl font-titillium-bold tracking-widest">
                                            {session?.vehicle?.plate || 'N/A'}
                                        </StyledText>
                                    </View>
                                </View>

                                {/* Conflict Banner */}
                                {hasConflict && (
                                    <View className="bg-main-900/10 border-2 border-main-900/40 rounded-2xl p-4 mt-1">
                                        <View className="flex-row items-start gap-3">
                                            <View className="bg-main-900/20 p-2 rounded-full mt-1">
                                                <Icon as={AlertTriangle} size={20} color="#E7872E" />
                                            </View>
                                            <StyledText containerClassName="flex-1" className="text-main-900 text-sm font-titillium-bold leading-5">
                                                A penalty fee was added to your bill because you parked in a slot different from your assigned reservation.
                                            </StyledText>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}

                        {/* ========== Instruction Banner ========== */}
                        {isDenied ? (
                            <View className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 mt-1 mb-10">
                                <View className="flex-row items-center gap-3">
                                    <View className="bg-red-500/20 p-2 rounded-full">
                                        <Icon as={AlertTriangle} size={20} color="#ef4444" />
                                    </View>
                                    <StyledText containerClassName="flex-1" className="text-red-400 text-sm font-titillium-regular leading-5">
                                        {gateState?.message || "Please pay the attendant in cash to open the gate."}
                                    </StyledText>
                                </View>
                            </View>
                        ) : (
                            <View className="bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl p-4 mt-1 mb-10">
                                <View className="flex-row items-center gap-3">
                                    <View className="bg-blue-500/20 p-2 rounded-full">
                                        <Icon as={Info} size={20} color="#3b82f6" />
                                    </View>
                                    <StyledText containerClassName="flex-1" className="text-blue-400 text-sm font-titillium-regular leading-5">
                                        {isPaid
                                            ? "Your bill is paid. Please drive to the gate and wait for the camera to verify your plate."
                                            : isFailed
                                                ? "Payment failed. Please head to the gate to pay in cash or update your payment method."
                                                : "Drive safely to the exit barrier. Processing your final bill..."
                                        }
                                    </StyledText>
                                </View>
                            </View>
                        )}

                    </View>
                )}
            </View>
        </BottomSheetScrollView>
    );
};