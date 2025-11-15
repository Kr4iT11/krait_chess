import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import type { AppNotification, ContextValue } from "./types";
import { initialState, reducer } from "./reducer";
import { useSocket } from "./useSocket";
import api from "../lib/api";
import { apiService } from "../service/apiService";
import { apiEndpoints } from "../config/apiEndpoints";


const STORAGE_KEY = 'app_notifications';
const BC_NAME = 'app_notifications_channel';
const NotificationContext = createContext<ContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const bcRef = useRef<BroadcastChannel | null>(null);

    // Initialize BroadcastChannel
    useEffect(() => {
        if (typeof BroadcastChannel !== 'undefined') {
            bcRef.current = new BroadcastChannel(BC_NAME);
            bcRef.current.onmessage = (ev) => {
                const { type, payload } = ev.data || {};
                if (type === 'INIT_STATE') dispatch({ type: 'INIT', items: payload.items });
                if (type === 'NEW') dispatch({ type: 'NEW', item: payload });
                if (type === 'UPDATE') dispatch({ type: 'UPDATE', id: payload.id, patch: payload.patch });
                if (type === 'MARK_ALL_READ') dispatch({ type: 'MARK_ALL_READ' });
            };
        }
        return () => bcRef.current?.close();
    }, []);

    useEffect(() => {
        try {
            // Load initial state from localStorage
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const items = JSON.parse(raw);
                if (Array.isArray(items)) {
                    dispatch({ type: 'INIT', items: items });
                }
            }
        }
        catch (e) {
            console.error("Failed to load notifications from localStorage", e);
        }
    }, []);

    // persist snapshot on items change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items.slice(0, 200) }));
        } catch { /* ignore */ }
    }, [state.items]);

    // socket handlers -> dispatch actions
    useSocket({
        onInitial: (items: AppNotification[]) => {
            dispatch({ type: 'ADD_PAGE', items, page: 1 });
            bcRef.current?.postMessage({ type: 'INIT_STATE', payload: { items } });
        },
        onNew: (item: AppNotification) => {
            console.log('[socket] dispatching NEW notification', item);
            dispatch({ type: 'NEW', item });
            bcRef.current?.postMessage({ type: 'NEW', payload: item });
        },
        onUpdate: (id: string, patch: Partial<AppNotification>) => {
            dispatch({ type: 'UPDATE', id: id, patch: patch });
            bcRef.current?.postMessage({ type: 'UPDATE', payload: { id: id, patch: patch } });
        },
        onAllRead: () => {
            dispatch({ type: 'MARK_ALL_READ' });
            bcRef.current?.postMessage({ type: 'MARK_ALL_READ' });
        },
        onConnect: (socketId: string) => {
            console.log('Socket connected with id:', socketId);
        },
        onError: (err: any) => {
            console.log(err);
            console.error('Socket Error', err);
        },
    })

    const fetchPage = useCallback(async (page = 1) => {
        dispatch({ type: 'SET_LOADING', loading: true });
        try {
            // const res = await api.get<{ items: AppNotification[]; total: number }>(`/notifications?page=${page}`);
            const res = await apiService.get(apiEndpoints.realtime.notifications + "?page=" + page);
            dispatch({ type: 'ADD_PAGE', items: res.items, page })
        } catch (error) {
            console.error('fetch notifications failed', error);
            dispatch({ type: 'SET_LOADING', loading: false });
        }
    }, [state.pageSize]);

    const markAsRead = useCallback(async (id: string) => {
        dispatch({ type: 'UPDATE', id: id, patch: { isRead: true } });
        try {
            await api.post(`/notifications/${id}/mark_read`);
        } catch (error) {
            console.error('markAsRead failed', error);
            fetchPage(1);
        }
    }, [fetchPage]);

    const openDropdown = useCallback((open: boolean) => {
        dispatch({ type: 'OPEN_DROPDOWN', open })
    }, []);

    const markAllRead = useCallback(async () => {
        dispatch({ type: 'MARK_ALL_READ' });
        try {
            console.log('markAllRead called');
            // await api.markAllRead();
        } catch (err) {
            console.error('markAllRead failed', err);
            fetchPage(1);
        }
    }, [fetchPage]);

    const ctx: ContextValue = {
        notifications: state.items,
        unreadCount: state.unreadCount,
        loading: state.loading,
        dropdownOpen: state.dropdownOpen,
        fetchPage,
        markAsRead,
        markAllRead,
        openDropdown,
    };

    return React.createElement(NotificationContext.Provider, { value: ctx }, children);
};

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}