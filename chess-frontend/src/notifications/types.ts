export type Notificationtype = 'friend_request' | 'friend_accept' | 'friend_decline' | 'invite' | 'invite_cancel';

export interface AppNotification {
    id: string;
    type: Notificationtype;
    payload: any;
    createdAt: string;
    isRead: boolean;
}