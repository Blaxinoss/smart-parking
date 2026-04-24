import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
import {
    MapPin,
    Clock,
    LogOut,
    Car,
    Timer,
    Zap,
    XCircle,
    AlertTriangle,
    Info
} from 'lucide-react-native';
import { ParkingSession, SlotStatus } from '@/constants/types';

import { useExtendUserSession } from '@/hooks/useSessions';

import { useSlots } from '@/hooks/useSlots';
import { useQuery } from '@tanstack/react-query';

interface InsideGarageUIProps {
    session: ParkingSession;
}

export const InsideGarageUI = ({ session }: InsideGarageUIProps) => {


    // ============================================================================
    // 📊 State & Data
    // ============================================================================
    const [parkedDuration, setParkedDuration] = useState<string>('00:00:00');
    const [timeRemaining, setTimeRemaining] = useState<string>('00:00:00');
    const [isOvertime, setIsOvertime] = useState(false);
    const { data: slots } = useSlots()
    // console.log("session of the vicitim is", session.id);
    const { data: isVictim } = useQuery({
        queryKey: ["isVictim", session.id],
        enabled: false,
        initialData: false,
        queryFn: () => false,
    })
    const currentSlot = slots?.find(slot => slot._id === session.slotId);

    const hasParkedSuccessfully: boolean | null =
        currentSlot?.status === SlotStatus.OCCUPIED
            ? true
            : (currentSlot?.status === SlotStatus.CONFLICT ? false : null);

    const { mutate: extendSession, isPending: isExtending } = useExtendUserSession();
    // ============================================================================
    // ⏱️ Parked Duration Timer (Counting Up)
    // ============================================================================
    useEffect(() => {
        if (!session.entryTime) return;

        const updateDuration = () => {
            const startTime = new Date(session.entryTime).getTime();
            const now = Date.now();
            const diff = Math.max(0, now - startTime);

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setParkedDuration(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        updateDuration();
        const interval = setInterval(updateDuration, 1000);
        return () => clearInterval(interval);
    }, [session.entryTime]);

    // ============================================================================
    // ⏰ Time Remaining Timer (Counting Down)
    // ============================================================================
    useEffect(() => {
        if (!session.expectedExitTime) return;

        const updateTimer = () => {
            const endTime = new Date(session.expectedExitTime!).getTime();
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeRemaining('OVERTIME');
                setIsOvertime(true);
                return;
            }

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setTimeRemaining(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
            setIsOvertime(false);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [session.expectedExitTime]);


    // useEffect(() => {
    //     if (!socket) return;



    //     return () => { socket?.off(HANDLE_SLOT_ENTER_EMIT) }
    // }, [socket])

    // ============================================================================
    // 🌊 Pulse Animation
    // ============================================================================
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.5);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.6, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );
        pulseOpacity.value = withRepeat(
            withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );

        return () => {
            cancelAnimation(pulseScale)
            cancelAnimation(pulseOpacity)
        }
    }, []);

    const animatedPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    // ============================================================================
    // 🎯 Extension Handler
    // ============================================================================
    const handleExtend = (minutes: number) => {

        extendSession({
            sessionId: session.id,
            minutes: minutes
        });
    };

    // ============================================================================
    // 🎨 UI Config
    // ============================================================================
    const statusBg = isOvertime ? 'bg-red-500' : 'bg-green-500';
    const statusBorder = isOvertime ? 'border-red-500' : 'border-green-500';
    const statusText = isOvertime ? 'text-red-400' : 'text-green-400';
    const statusColor = isOvertime ? '#ef4444' : '#10b981';
    const isWaiting = hasParkedSuccessfully === null;
    const isWrong = hasParkedSuccessfully === false;
    const circleBorderColor = isWaiting ? 'border-amber-500' : isWrong ? 'border-red-500' : 'border-green-500';
    const circleBg = isWaiting ? 'bg-amber-500/40' : isWrong ? 'bg-red-500/10' : 'bg-green-500/10';
    const iconColor = isWaiting ? '#f59e0b' : isWrong ? '#ef4444' : '#10b981';
    const isViolator = session.involvedInConflict === true;
    // ============================================================================
    // console.log(isVictim, isWaiting)
    // 🎨 Render UI
    // ============================================================================
    return (
        <View className="flex-1 w-full px-6 py-8 justify-between">
            {/* ========== Header: Status Badge ========== */}
            <View className="items-center mb-6">
                <View className={`flex-row items-center gap-2 ${statusBg}/10 px-5 py-3 rounded-full border-2 ${statusBorder}/30`}>
                    <Icon
                        as={isViolator ? AlertTriangle : isOvertime ? Timer : MapPin}
                        size={22}
                        color={statusColor}
                    />

                    <StyledText className={`${statusText} font-titillium-bold text-lg`}>
                        {isViolator ? 'Active & violation Detected' : isOvertime ? 'Overtime Session' : hasParkedSuccessfully ? "Successfully Parked" : "Waiting occupation"}
                    </StyledText>

                </View>
                <StyledText className={`text-center text-sm mt-2 ${isWrong || isViolator ? "text-red-500 font-bold" : "text-garage-400"}`}>
                    {isViolator
                        ? 'You occupied the wrong slot, All yours but extra penalties will be applied'
                        : hasParkedSuccessfully === true
                            ? 'Your vehicle is safely parked'
                            : hasParkedSuccessfully === null
                                ? 'Waiting for your vehicle to occupy the slot...'
                                : 'Warning: Vehicle mismatch or wrong slot!'}
                </StyledText>
            </View>

            {/* ========== Center: Slot Circle with Pulse ========== */}
            <View className="items-center justify-center my-8 relative h-64">
                {!isViolator && (
                    <Animated.View style={animatedPulseStyle} className={`absolute w-44 h-44 ${statusBg}/30 rounded-full`} />
                )}


                <View className={`w-56 h-56 rounded-full items-center justify-center bg-garage-900 border-4 ${circleBorderColor} shadow-2xl z-10`}>                    <View className="items-center">
                    <Animated.View style={{
                        animationName: {
                            '0%': {
                                transform: [{ scale: 1 }]
                            },
                            '100%': {
                                transform: [{ scale: 1.1 }]
                            }

                        },
                        animationDuration: '1500ms',
                        animationIterationCount: 'infinite',
                        animationDirection: "alternate"
                    }} className={`${circleBg} p-4 rounded-full mb-3 `}>
                        {isViolator ? (
                            <AlertTriangle size={36} color={iconColor} />
                        ) : isWaiting ? (
                            <ActivityIndicator size="small" color={iconColor} />
                        ) : isWrong ? (
                            <XCircle size={36} color={iconColor} />
                        ) : (
                            <Car size={36} color={iconColor} />
                        )}

                    </Animated.View >
                    <StyledText className="text-garage-400 text-xs uppercase tracking-widest mb-1">
                        {isViolator ? "Violated Slot" : isWaiting ? "Approaching" : "Current Slot"}
                    </StyledText>
                    <StyledText className="text-white text-5xl font-titillium-bold">
                        {session.slotId}
                    </StyledText>
                </View>
                </View>
            </View>

            {/* ========== Bottom: Info Cards ========== */}
            <View className="w-full gap-4">

                {isVictim && isWaiting && (
                    <View className="bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl p-4 flex-row items-start gap-3">
                        <Info size={24} color="#3b82f6" />
                        <View className="flex-1">
                            <StyledText className="text-blue-400 text-sm font-titillium-bold mb-1">
                                We Apologize
                            </StyledText>
                            <StyledText className="text-blue-400/80 text-xs font-titillium-regular">
                                Your original slot was taken by another vehicle. We have redirected you to slot {session.slotId}.
                            </StyledText>
                        </View>
                    </View>
                )}


                {/* Duration & Remaining Time Cards */}
                <View className="flex-row gap-3">
                    {/* Parked Duration */}
                    <View className="flex-1 bg-garage-900 rounded-2xl border-2 border-garage-700 p-4 shadow-xl">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="bg-blue-500/20 p-2 rounded-full">
                                <Clock size={18} color="#3b82f6" />
                            </View>
                            <StyledText className="text-garage-400 text-xs uppercase font-titillium-bold">
                                Duration
                            </StyledText>
                        </View>
                        <StyledText className="text-white text-xl font-titillium-bold tracking-wider">
                            {parkedDuration}
                        </StyledText>
                    </View>

                    {/* Time Remaining */}
                    <View className={`flex-1 rounded-2xl border-2 p-4 shadow-xl ${isOvertime
                        ? 'bg-red-500/10 border-red-500'
                        : 'bg-green-500/10 border-green-500'
                        }`}>
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className={`${statusBg}/20 p-2 rounded-full`}>
                                <Timer size={18} color={statusColor} />
                            </View>
                            <StyledText className={`${statusText} text-xs uppercase font-titillium-bold`}>
                                {isOvertime ? 'Overtime' : 'Remaining'}
                            </StyledText>
                        </View>
                        <StyledText className={`${statusText} text-xl font-titillium-bold tracking-wider`}>
                            {timeRemaining}
                        </StyledText>
                    </View>
                </View>

                {/* Extended Badge */}
                {session.isExtended && (
                    <View className="bg-main-900/10 border-2 border-main-900/30 rounded-2xl p-3">
                        <View className="flex-row items-center gap-2">
                            <Zap size={18} color="#E7872E" />
                            <StyledText className="text-main-900 text-sm font-titillium-bold">
                                Session Extended
                            </StyledText>
                        </View>
                    </View>
                )}

                {isViolator && (
                    <View className="bg-main-900/10 border-2 border-main-900/30 rounded-2xl p-3">
                        <View className="flex-row items-center gap-2">
                            <Zap size={18} color="#E7872E" />
                            <StyledText className="text-main-900 text-sm font-titillium-bold">
                                You have Violated a slot that is not yours, you are free to park, but extra penalties will be applied.
                            </StyledText>
                        </View>
                    </View>
                )}


                {/* Extension Options */}
                {!isOvertime && (
                    <View className="bg-garage-900 rounded-2xl border-2 border-garage-700 p-4">
                        <StyledText className="text-garage-300 text-sm font-titillium-bold mb-3">
                            Need More Time?
                        </StyledText>
                        <View className="flex-row gap-2">
                            {[15, 30, 60].map((minutes) => (
                                <TouchableOpacity
                                    key={minutes}
                                    onPress={() => handleExtend(minutes)}
                                    disabled={isExtending} // دي جاية من الـ Mutator
                                    className="flex-1 bg-main-900 py-3 items-center rounded-xl border border-main-700"
                                >
                                    {isExtending ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <StyledText className="text-garage-100 text-center font-titillium-bold">
                                            +{minutes}m
                                        </StyledText>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Exit Button */}
                <View className="bg-main-900/10 border-2 border-main-900/30 rounded-2xl p-4 flex-row items-center gap-4">
                    <View className="bg-main-900/20 p-3 rounded-full">
                        <Icon as={LogOut} size={24} color="#E7872E" />
                    </View>
                    <View className="flex-1">
                        <StyledText className="text-main-900 font-titillium-bold text-lg mb-1">
                            Ready to leave?
                        </StyledText>
                        <StyledText className="text-garage-300 text-sm font-titillium-regular leading-5">
                            Simply drive your vehicle out of the slot. Your session will end and bill automatically.
                        </StyledText>
                    </View>
                </View>

                {/* Overtime Warning */}
                {isOvertime && session.overtimeStartTime && (
                    <View className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4">
                        <View className="flex-row items-start gap-3">
                            <MaterialCommunityIcons name="alert" size={24} color="#ef4444" />
                            <View className="flex-1">
                                <StyledText className="text-red-400 text-sm font-titillium-bold mb-1">
                                    Overtime Charges Apply
                                </StyledText>
                                <StyledText className="text-red-400/70 text-xs font-titillium-regular">
                                    Started at {new Date(session.overtimeStartTime).toLocaleTimeString()}
                                </StyledText>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};