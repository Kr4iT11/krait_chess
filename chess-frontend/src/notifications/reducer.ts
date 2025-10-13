import type { State } from "./state";
import type { AppNotification } from "./types";
/**
 * Initial UI state.
 */
export const initialState: State = {
    items: [],
    unreadCount: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    dropdownOpen: false,
}

/**
 * Actions that change state.
 */

export type Action =
    | { type: 'INIT', items: AppNotification[] } // seed items (from localStorage or initial fetch)
    | { type: 'ADD_PAGE', item: AppNotification, page: number } // add a page of items (from fetch)
    | { type: 'NEW', item: AppNotification } // add a new item (from websocket)
    | { type: 'UPDATE'; id: string; patch: Partial<AppNotification> } // update an item (e.g. mark as read)
    | { type: 'MARK_ALL_READ' }                                 // mark all read locally
    | { type: 'SET_LOADING'; loading: boolean } // set loading state
    | { type: 'OPEN_DROPDOWN'; open: boolean }; // set dropdown open state



/**
* Merge helper:
* - incoming wins (they override)
* - existing kept if missing
* - returns newest-first sorted array
*/

export function dedupeAndMerge(existing: AppNotification[], incoming: AppNotification[]): AppNotification[] {
    const map = new Map<string, AppNotification>();
    // Insert incoming first so they override the existing
    for (const n of incoming) map.set(String(n.id), n);
    // add existing only if missing 
    for (const n of existing) {
        if (!map.has(String(n.id))) {
            map.set(String(n.id), n);
        }
    }
    //convert back to array and sort by createdAt desc
    return Array.from(map.values()).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); // newest first
}

/**
 * Reducer: pure state transitions
 */
export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'INIT': {
            const unread = action.items.filter(x => !x.isRead).length; // get unread count of incoming items
            return { ...state, items: action.items, unreadCount: unread };
        }
        case 'ADD_PAGE': {
            const items = dedupeAndMerge(state.items, [action.item]);
            const unread = items.filter(x => !x.isRead).length;
            return { ...state, items: items, page: action.page, unreadCount: unread, loading: false };
        }
        case 'NEW':
            // ignore duplicate notifications 
            if (state.items.some(x => x.id === action.item.id)) return state;
            const items = [action.item, ...state.items].slice(0, 500); // cap the list
            return { ...state, items, unreadCount: state.unreadCount + (action.item.isRead ? 0 : 1) };


        case 'UPDATE': {
            const items = [];
            for (let i = 0; i < state.items.length; i++) {
                const current = state.items[i];
                // Check if the current item's ID matches the one we want to update
                if (String(current.id) === String(action.id)) {
                    // Create a new updated item by merging current and patch
                    const updated = { ...current, ...action.patch };
                    items.push(updated);
                } else {
                    items.push(current);
                }
            }
            const unreadCount = items.filter(x => !x.isRead).length;
            return { ...state, items, unreadCount: unreadCount };
        }
        case 'MARK_ALL_READ': {
            const items = state.items.map(x => ({ ...x, isRead: true })); // marking all read locally 
            // as {...x, isRead: true} 
            // for example
            //  will be like x = {
            // id: 1,
            // type: 'friend_request',
            // } this code will convert it to
            // {
            // id: 1,
            // type: 'friend_request',
            // isRead: true
            // }
            return { ...state, items, unreadCount: 0 }; // since all are read now
        }
        case 'SET_LOADING': {
            return { ...state, loading: action.loading };
        }
        case 'OPEN_DROPDOWN': {
            return { ...state, dropdownOpen: action.open };
        }
        default:
            return state;
    }
}