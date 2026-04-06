import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Reservation } from '@/constants/types';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { AnimatedView } from 'react-native-reanimated/lib/typescript/component/View';
import { StyledText } from '@/components/ui/styledText';
import { boolean } from 'zod';
import { Check, CheckCheck, CheckCircle2, Flag, LucideCheckCircle2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useUserReservations } from '@/hooks/useReservations';
type SessionStatus = 'WAITING_FOR_SCAN' | 'VERIFYING' | 'GATE_OPENED' | 'PARKED' | 'BEFORE_PROCESSING' | 'DECISION_MADE' | 'ACCESS_DENIED';

export const GateScannerUI = ({ status, gateMessage, latestSlot, reservation }: { gateMessage: any, status: any, latestSlot: string, reservation: Reservation }) => {
    const isVerifying = status === 'VERIFYING';
    const isAllowed = status === 'GATE_OPENED'
    const isDenied = status === 'ACCESS_DENIED'
    const isWaiting = status === 'WAITING_FOR_SCAN'
    const stateTranslate = useSharedValue(0);
    const [timer, setTimer] = useState<string | null>(null)
    const [isTimerShown, setIsTimerShown] = useState(true);



    const AnimatedStyle = useAnimatedStyle(() => {
        return {
            "transform": [{ translateY: stateTranslate.value }]
        }
    })

    useEffect(() => {
        const duration = isVerifying ? 600 : 2000;

        stateTranslate.value = withRepeat(
            withTiming(200, { duration: duration, easing: Easing.ease }),
            -1,
            true
        );

        return () => cancelAnimation(stateTranslate);
    }, [isVerifying]);



    //1 compoentn mount 
    //2 start and end are calculated
    //3 all things are done
    //4 useEffect start
    //5 diffinMillis is calucated 
    //6 hours minutes and seconds too
    //7 an interval is initialized to run every 1 second 
    // when the one second pass the setTimer is recalculated so the wholhe componetn rerender
    // concers : 1- if it's already rerendringe very 1 second then don't do the -1000 yourself it will be recalculated
    // 2- why the timer don't change on my front altought it's in the use effect debug
    // 3- I see that the timer is on the dep array so the useEffect should rerun or the whole thing should rerender when the time state change
    // then what's wrong?
    let endTime = new Date(reservation.startTime).getTime();

    useEffect(() => {

        let flag = false;

        const timerMe = setInterval(() => {
            let diffinMillis = endTime - new Date().getTime();

            if (diffinMillis <= 0 && flag === false) {
                flag = true
                endTime += 10 * 60 * 1000
                diffinMillis = endTime - new Date().getTime();
            }
            else if (diffinMillis <= 0 && flag) {
                clearInterval(timerMe);
                setIsTimerShown(false);
                setTimer("Expired")
                return;
            }


            const hours = Math.floor(diffinMillis / 3600000);
            const minutes = Math.floor((diffinMillis % 3600000) / 60000);
            const seconds = Math.floor((diffinMillis % 60000) / 1000);

            setTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timerMe);

    }, [endTime])



    return (
        <View className="flex-1 w-full px-6 py-8">
            {/* 1. Header Section */}
            <View className="mb-8">
                <View className="flex-row justify-between items-start mb-6">
                    {/* Status */}
                    <View className="flex-1">
                        <StyledText className='text-main-900 font-titillium-bold text-sm uppercase tracking-wide mb-2'>
                            Reservation Status
                        </StyledText>
                        <View className='flex-row items-center gap-2 bg-green-500/10 self-start px-4 py-2 rounded-full border border-green-500/30'>
                            <Icon as={LucideCheckCircle2} size={18} color="green" />
                            <StyledText className="text-green-400 font-titillium-bold text-base">
                                {reservation.status}
                            </StyledText>
                        </View>
                    </View>

                    {/* Timer */}
                    {isTimerShown && <View className="items-center bg-garage-900 px-4 py-3 rounded-2xl border-2 border-main-900">
                        <StyledText className="text-main-900 font-titillium-bold text-2xl mb-1">
                            {timer}
                        </StyledText>
                        <StyledText className="text-garage-400 text-xs uppercase tracking-wider">
                            Time Remaining
                        </StyledText>
                    </View>}
                </View>

                {/* Progress Indicator */}
                <View className="flex-row items-center gap-2 mb-2">
                    <View className={`flex-1 h-2 ${isVerifying || isWaiting || isAllowed ? "bg-main-900" : "bg-garage-800 "} rounded-full`} />
                    <View className={`flex-1 h-2 ${isAllowed || isDenied ? "bg-main-900" : "bg-garage-800 "} rounded-full* `} />
                    <View className="flex-1 h-2 bg-garage-800 rounded-full" />
                </View>
                <StyledText className="text-garage-400 text-sm font-titillium-bold">
                    {`Step ${isAllowed || isDenied ? 2 : 1} of 3`}
                </StyledText>
            </View>

            {/* 2. Scanner Animation Section */}
            <View className="items-center mb-5">
                <StyledText className={`text-3xl font-titillium-bold mb-8 text-center
                
                ${isVerifying ? 'text-main-900' : 'text-white'
                    }`}>
                    {isVerifying ? 'Verifying Plate...' : isAllowed ? "The gate is opened for you to enter!" :
                        isDenied ? `Access denied with message ${gateMessage}` : 'Waiting for Vehicle Scan'}


                </StyledText>

                {/* Scanner Circle */}
                <View className="relative">
                    {/* Outer Glow Ring */}
                    <View className={`absolute inset-0 w-24 h-24 z-10 rounded-full ${isVerifying ? 'bg-main-900/20' : isAllowed ? "bg-green-600/40" : isDenied ? "bg-red-700/40" : "bg-blue-500/20"} blur-2xl`} />

                    {/* Main Scanner Circle */}
                    <View className={`w-24 h-24 rounded-full items-center justify-center border-4 bg-garage-900 ${isVerifying ? 'border-main-900' :
                        isAllowed ? 'border-green-600' :
                            isDenied ? 'border-red-700' :
                                'border-garage-700'
                        } shadow-2xl relative overflow-hidden`}>
                        {/* Car Icon */}
                        <FontAwesome5
                            name="car-alt"
                            size={50}
                            color={
                                isVerifying ? "#E7872E" :
                                    isAllowed ? "#10B981" : // أخضر
                                        isDenied ? "#EF4444" : // أحمر
                                            "#ffffff" // أبيض في حالة الانتظار
                            }
                        />


                        {/* Scanning Line */}
                        {isVerifying || isWaiting && <Animated.View
                            style={[{ top: -10 }, AnimatedStyle]}
                            className={`absolute w-full h-1 shadow-2xl ${isVerifying
                                ? 'bg-main-900 shadow-main-900'
                                : 'bg-blue-500 shadow-blue-500'
                                }`}
                        />}

                    </View>

                    {/* Status Indicator */}
                    {isVerifying && (
                        <View className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-main-900 px-4 py-2 rounded-full flex-row items-center gap-2">
                            <ActivityIndicator size="small" color="white" />
                            <StyledText className="text-white text-sm font-titillium-bold">
                                Scanning...
                            </StyledText>
                        </View>
                    )}
                </View>
            </View>

            {/* 3. Information Cards */}
            <View className="gap-4 flex-row flex-wrap">
                {/* Plate Card */}
                <View className="flex-1 bg-garage-900 rounded-2xl border-2 border-garage-700 overflow-hidden shadow-xl ">
                    <View className="flex-row items-center justify-between py-5 px-4">
                        <View className="flex-1">
                            <View className="flex-row items-center gap-1 mb-2">
                                <MaterialCommunityIcons name="license" size={20} color="#E7872E" />
                                <StyledText className="text-garage-400 text-xs uppercase tracking-wide font-titillium-bold">
                                    Registered Plate
                                </StyledText>
                            </View>
                            <StyledText className="text-white text-2xl font-titillium-bold tracking-widest">
                                {reservation.vehicle?.plate || 'N/A'}
                            </StyledText>
                        </View>

                        {/* Plate Icon Badge */}

                    </View>
                </View>

                {/* Slot Card */}
                <View className="flex-1 bg-garage-900 rounded-2xl border-2 border-garage-700 overflow-hidden shadow-xl">
                    <View className="flex-row items-center justify-between py-5 px-4">
                        <View className="flex-1">
                            <View className="flex-row items-center gap-1 mb-2">
                                <MaterialCommunityIcons name="parking" size={20} color="#3b82f6" />
                                <StyledText className="text-garage-400 text-xs uppercase tracking-wide font-titillium-bold">
                                    Assigned Slot
                                </StyledText>
                            </View>
                            <StyledText className="text-white text-3xl font-titillium-bold">
                                {isAllowed && latestSlot ? `#${latestSlot}` : `#${reservation.slotId}`}
                            </StyledText>
                        </View>


                    </View>
                </View>

                {/* Additional Info Card (Optional) */}

            </View>
            <View className="bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl p-4 mt-4" >
                <View className="flex-row items-center gap-3">
                    <View className="bg-blue-500/20 p-2 rounded-full">
                        <MaterialCommunityIcons name="information" size={20} color="#3b82f6" />
                    </View>

                    <StyledText className="flex-1 text-blue-400 text-sm font-titillium-regular">
                        {isVerifying ? "Please wait while we verify your plate." :
                            isAllowed ? "Proceed safely to your assigned slot." :
                                isDenied ? "Please check your reservation or contact support." :
                                    "Drive to the gate and wait for it to open"}
                    </StyledText>
                </View>
            </View>
        </View>

    );
};