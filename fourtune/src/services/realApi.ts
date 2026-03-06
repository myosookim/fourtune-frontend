import { type ApiService } from './api.interface';
import { auctionService } from './auction.service';
import { userService } from './user.service';
import { orderService } from './order.service';
import { cartService } from './cart.service';
import { notificationService } from './notification.service';
import { searchService } from './search.service';

export const realApi: ApiService = ({
    ...auctionService,
    ...userService,
    ...orderService,
    ...cartService,
    ...notificationService,
    ...searchService,

    // Maintain interface compatibility for isAuthenticated and getCurrentUser
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token && token !== 'undefined';
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Failed to parse user from storage');
            }
        }
        return null;
    }
} as any) as ApiService;
