import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSocket } from '@/hooks/SocketContext';
import { DECISION_GATE_ENTRY_EMIT, VERIFYING_PLATE_GATE_ENTRY } from '@/constants/constants';
import { StyledText } from '@/components/ui/styledText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { InsideGarageUI } from '../insideGarage/InsideGarage';
import { GateScannerUI } from './GateScannerUI';
import { useQueryClient } from '@tanstack/react-query';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { ParkingSession } from '@/constants/types';

type SessionStatus =
    | 'WAITING_FOR_SCAN'
    | 'VERIFYING'
    | 'GATE_OPENED'
    | 'ACCESS_DENIED';

interface ActiveSessionManagerProps {
    reservation: any;
    session: ParkingSession | null;
    bottomSheetRef: React.RefObject<BottomSheet>;
}

export const ActiveSessionManager = ({
    reservation,
    bottomSheetRef,
    session
}: ActiveSessionManagerProps) => {

    // ============================================================================
    // 📊 State Management
    // ============================================================================
    const [status, setStatus] = useState<SessionStatus>(
        session ? 'GATE_OPENED' : 'WAITING_FOR_SCAN'
    );
    const [gateMessage, setGateMessage] = useState('');
    const [latestSlot, setLatestSlot] = useState<string>('');

    const socket = useSocket();
    const queryClient = useQueryClient();

    // ============================================================================
    // 🔌 Socket Event Listeners
    // ============================================================================
    useEffect(() => {
        if (!socket) return;

        // 1. Plate Verification Started
        const handleVerifying = (data: any) => {
            console.log(`👀 Camera caught the plate: ${data.plate}`);
            setStatus('VERIFYING');
        };

        // 2. Gate Decision Received
        const handleDecision = (data: any) => {
            console.log("🚦 Gate Decision Received:", data);

            if (data.status === 'DECISION_MADE' && data.decision === 'ALLOW_ENTRY') {
                setStatus('GATE_OPENED');
                setLatestSlot(data.slotName);

                // Invalidate queries to refresh reservation & session data
                queryClient.invalidateQueries({ queryKey: ["userReservations"] });
                queryClient.invalidateQueries({ queryKey: ["userSessions"] });
            } else {
                setStatus('ACCESS_DENIED');
                setGateMessage(data.message || 'Access denied');
            }
        };

        socket.on(VERIFYING_PLATE_GATE_ENTRY, handleVerifying);
        socket.on(DECISION_GATE_ENTRY_EMIT, handleDecision);

        return () => {
            socket.off(VERIFYING_PLATE_GATE_ENTRY, handleVerifying);
            socket.off(DECISION_GATE_ENTRY_EMIT, handleDecision);
        };
    }, [socket, queryClient]);

    // ============================================================================
    // 🎨 Render Content Based on Status
    // ============================================================================
    const renderContent = () => {
        switch (status) {
            case 'WAITING_FOR_SCAN':
            case 'VERIFYING':
                return (
                    <GateScannerUI
                        gateMessage={gateMessage}
                        latestSlot={latestSlot}
                        status={status}
                        reservation={reservation}
                    />
                );

            case 'GATE_OPENED':
                if (session) {
                    return <InsideGarageUI session={session} />;
                }

                // Gate opened but session not created yet
                return (
                    <View className="flex-1 items-center justify-center p-6">
                        <View className="bg-green-500/20 p-6 rounded-full mb-4">
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={60}
                                color="#10b981"
                            />
                        </View>
                        <StyledText className="text-white text-2xl font-titillium-bold mb-2">
                            Gate Opening
                        </StyledText>
                        <StyledText className="text-garage-400 text-center">
                            Please drive through. Your session will start automatically.
                        </StyledText>
                        {latestSlot && (
                            <View className="mt-4 bg-garage-900 border-2 border-green-500 rounded-2xl p-4">
                                <StyledText className="text-garage-400 text-xs uppercase text-center mb-1">
                                    Assigned Slot
                                </StyledText>
                                <StyledText className="text-white text-3xl font-titillium-bold text-center">
                                    {latestSlot}
                                </StyledText>
                            </View>
                        )}
                    </View>
                );

            case 'ACCESS_DENIED':
                return (
                    <View className="flex-1 items-center justify-center p-6">
                        <View className="bg-red-500/20 p-6 rounded-full mb-4">
                            <MaterialCommunityIcons
                                name="cancel"
                                size={60}
                                color="#ef4444"
                            />
                        </View>
                        <StyledText className="text-white text-2xl font-titillium-bold mb-2">
                            Access Denied
                        </StyledText>
                        <StyledText className="text-garage-400 text-center">
                            {gateMessage}
                        </StyledText>
                        <View className="mt-6 bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-4 w-full">
                            <StyledText className="text-red-400 text-sm text-center">
                                Please contact support if you believe this is an error
                            </StyledText>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    // ============================================================================
    // 🎨 Render
    // ============================================================================
    return (


        <BottomSheetScrollView
            contentContainerStyle={{ paddingHorizontal: 2, paddingBottom: 48 }}
        >
            {renderContent()}
        </BottomSheetScrollView>
    );
};
