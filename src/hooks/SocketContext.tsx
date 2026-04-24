import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import Toast, { ReactChildren } from "react-native-toast-message";
import { io, Socket } from 'socket.io-client'
import { useUser } from "./useUsers";
import * as Haptics from 'expo-haptics';

import { CANCELED_RESERVATION_EMITTER_MESSAGE, HANDLE_GATE_EXIT_EMIT, HANDLE_HAS_DONE_VIOLATION, HANDLE_SLOT_ENTER_EMIT, HANDLE_SLOT_EXIT_EMIT, HANDLE_SLOT_HAS_BEEN_OVERTAKEN, ngrok, SESSION_SLOT_NOT_OCCUPIED_BEFORE_TOLERANCETIME, SLOT_STATUS_CHANGED_MESSAGE } from "@/constants/constants";
import { handleCancel } from "@/onSocketEventsHandlers/onCancelHandler";
import { useQueryClient } from "@tanstack/react-query";
import { handleSlotStatusChange } from "@/onSocketEventsHandlers/onSlotStatusChangeHandler";
import { useRouter } from "expo-router";
import { ParkingSession } from "@/constants/types";





const SocketContext = createContext<Socket | null>(null);


export const SocketProvider = ({ children }: { children: React.ReactNode }) => {

    const queryClient = useQueryClient();
    const [socket, setSocket] = useState<Socket | null>(null);



    const router = useRouter();

    const { data: user } = useUser();

    useEffect(() => {

        const mySocket = io(
            ngrok, {
            auth: {
                userId: user?.id,
                plateNumber: user?.Vehicles?.[0]?.plate
            },
            autoConnect: true,
            extraHeaders: {
                'ngrok-skip-browser-warning': 'true'
            }
        });


        setSocket(mySocket);

        mySocket.on("connect", () => {
            console.log("📱 Mobile connected to socket:", mySocket.id);
        });

        mySocket.on("disconnect", (reason) => {
            console.log("📱 Mobile disconnected:", reason);
        });

        mySocket.on(CANCELED_RESERVATION_EMITTER_MESSAGE, async (data) => {
            console.log("🔥 NEW PRIVATE ALERT:", data.title);
            await handleCancel(data, queryClient)
            await queryClient.invalidateQueries({ queryKey: ["userReservations"] })
        })

        mySocket.on(SLOT_STATUS_CHANGED_MESSAGE, (data) => {
            console.log("[SOCKET EVENT] : Slot status changed")
            handleSlotStatusChange(data, queryClient)
        })

        mySocket.on(HANDLE_SLOT_ENTER_EMIT, (data: { type: string, message: string }) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            queryClient.invalidateQueries({ queryKey: ["Slots"] });
            queryClient.invalidateQueries({ queryKey: ["userSessions"] });
            Toast.show({
                type: "success",
                text1: "You have parked to the right slot!",
                text2: data.message || "Your car is safe now",
            })
        })


        mySocket.on(HANDLE_SLOT_EXIT_EMIT, (data: { type: string, message: string, conflictStatus: boolean }) => {
            console.log("[SOCKET EVENT] : Slot status changed someone is exiting")
            Toast.show({
                type: "info",
                text1: data.type || "Slot Exited",
                text2: data.message || "Your session is completed. Please proceed to the exit gate.",
            });

            // 2. تحديث الكاش عشان الـ UI يتغير فوراً
            queryClient.invalidateQueries({ queryKey: ["userSessions"] });
            queryClient.invalidateQueries({ queryKey: ["Slots"] }); // لو محتاجين
        });

        mySocket.on(SESSION_SLOT_NOT_OCCUPIED_BEFORE_TOLERANCETIME, (data: { type: string, message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["Slots"] });
            queryClient.invalidateQueries({ queryKey: ["userSessions"] });

            Toast.show({
                type: "error",
                text1: "Your session has been canceled",
                text2: data.message || "Your session is cancelled",
            })
        })


        mySocket.on(HANDLE_SLOT_HAS_BEEN_OVERTAKEN, (data: { type: string, message: string, title: string, newSlotId: string, sessionId: number }) => {

            console.log("[SOCKET EVENT] : Slot has been overtaken")

            queryClient.setQueryData<ParkingSession>(['userSessions'], (oldSessionCache) => {
                if (!oldSessionCache) {
                    console.log("no sessions in the cahce ")
                    return;
                }

                if (oldSessionCache.id === data.sessionId) {
                    return {
                        ...oldSessionCache,
                        slotId: data.newSlotId,
                    }
                }
                return oldSessionCache;

            }
            )
            console.log("session from the socket is ", data.sessionId)

            queryClient.setQueryData(["isVictim", data.sessionId], true);



            queryClient.invalidateQueries({ queryKey: ["Slots"] });

            Toast.show({
                type: "info",
                text1: data.title,
                text2: data.message || `Your Slot has been overtaken by some violator we appologize for that please move to the new assigned Slot ${data.newSlotId}`,
            })

            queryClient.invalidateQueries({ queryKey: ["userSessions"] });


        })


        mySocket.on(HANDLE_HAS_DONE_VIOLATION, (data: { type: string, message: string, title: string, sessionId: number, newSlotId: string }) => {
            queryClient.invalidateQueries({ queryKey: ["Slots"] });


            queryClient.setQueryData<ParkingSession>(['userSessions'], (oldSessionCache) => {
                if (!oldSessionCache) {
                    console.log("no sessions in the cahce ")
                    return;
                }
                if (oldSessionCache.id === data.sessionId) {
                    return {
                        ...oldSessionCache,
                        involvedInConflict: true,
                        slotId: data.newSlotId,
                    }
                }
                return oldSessionCache;


            }
            )


            Toast.show({
                type: "error",
                text1: data.title,
                text2: data.message || "You have occupied the wrong slot, please LEAVE IT NOW!",
            })

            queryClient.invalidateQueries({ queryKey: ["userSessions"] });

        })


        mySocket.on(HANDLE_GATE_EXIT_EMIT, (data: { decision: string, reason: string, message: string }) => {

            Toast.show({
                type: data.decision === 'ALLOW_EXIT' ? "success" : "error",
                text1: data.decision === 'ALLOW_EXIT' ? "Gate Opened" : "Access Denied",
                text2: data.message,
                visibilityTime: 5000,
            });

            queryClient.setQueryData(["exitGateState"], {
                decision: data.decision,
                reason: data.reason,
                message: data.message,
                timestamp: Date.now(),
            })
            queryClient.invalidateQueries({ queryKey: ["userSessions"] });
        });




        return () => {
            mySocket.disconnect()
            mySocket.off()
        }
    }, [user?.id])


    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        console.warn("Socket is not initialized yet");
    }
    return socket;
}