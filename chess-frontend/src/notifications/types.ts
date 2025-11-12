export type Notificationtype = 'friend_request' | 'friend_accept' | 'friend_decline' | 'invite' | 'invite_cancel';

export interface AppNotification {
    id: string;
    type: Notificationtype;
    payload: any;
    createdAt: string;
    isRead: boolean;
}

export type SocketHandlers = {
    // server-> client
    onInitial: (items: AppNotification[]) => void; // notifications:initial 
    onNew: (item: AppNotification) => void; // notifications:new
    onUpdate: (id: string, patch: Partial<AppNotification>) => void; // notifications:update
    onAllRead: () => void; // notifications:all_read
    // optional debug hooks
    onConnect?: (socketId: string) => void;
    onError?: (err: any) => void;
}

export type ContextValue = {
    notifications: AppNotification[];
    unreadCount: number;
    loading: boolean;
    dropdownOpen: boolean;
    fetchPage: (pageNumber: number) => void;
    markAsRead: (id: string) => void;
    markAllRead: () => void;
    openDropdown: (open: boolean) => void;
}