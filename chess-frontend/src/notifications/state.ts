import type { AppNotification } from "./types";
export type State = {
    items: AppNotification[];
    unreadCount: number;
    page: number;
    pageSize: number;
    loading: boolean;
    dropdownOpen: boolean;
}