import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { ReactChildren } from "react-native-toast-message";
import { io, Socket } from 'socket.io-client'
import { useUser } from "./useUsers";

import { CANCELED_RESERVATION_EMITTER_MESSAGE, ngrok, SLOT_STATUS_CHANGED_MESSAGE } from "@/constants/constants";
import { handleCancel } from "@/onSocketEventsHandlers/onCancelHandler";
import { useQueryClient } from "@tanstack/react-query";
import { handleSlotStatusChange } from "@/onSocketEventsHandlers/onSlotStatusChangeHandler";
import { useRouter } from "expo-router";



const SocketContext = createContext<Socket | null>(null);


export const SocketProvider = ({ children }: { children: React.ReactNode }) => {

    const queryClient = useQueryClient();
    const [socket, setSocket] = useState<Socket | null>(null);
    const router = useRouter();

    const { data: user } = useUser();

    useEffect(() => {

        const mySocket = io(ngrok, {
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