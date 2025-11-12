import { useEffect, useRef } from "react";
import type { AppNotification, SocketHandlers } from "./types";
import { io, type Socket } from "socket.io-client";

export function useSocket(handlers: SocketHandlers) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const url = 'http://localhost:3000';

        const socket = io(url, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
        socketRef.current = socket;
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            handlers.onConnect?.(socket.id?.toString() || '');
        });

        // notification events
        socket.on('notifications:initial', (items: AppNotification[]) => handlers.onInitial(items));
        socket.on('notifications:new', (item: AppNotification) => handlers.onNew(item));
        socket.on('notifications:update', (id: string, patch: Partial<AppNotification>) => handlers.onUpdate(id, patch));
        socket.on('notifications:all_read', () => handlers.onAllRead());

        socket.on('connect_error', (err: any) => {
            console.error('Socket connect_error:', err);
            handlers.onError?.(err);
        });

        // cleanup on unmount
        return () => {
            socket.off('connect');
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);
}