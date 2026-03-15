import { type ApiService } from './api.interface';
import { auctionService } from './auction.service';
import { userService } from './user.service';
import { orderService } from './order.service';
import { paymentService } from './payment.service';
import { settlementService } from './settlement.service';
import { cartService } from './cart.service';
import { notificationService } from './notification.service';
import { searchService } from './search.service';
import { isUserAuthenticated } from './auth.utils';

export const realApi: ApiService = {
    ...auctionService,
    ...userService,
    ...orderService,
    ...paymentService,
    ...settlementService,
    ...cartService,
    ...notificationService,
    ...searchService,

    // Maintain interface compatibility for isAuthenticated and getCurrentUser
    isAuthenticated: () => isUserAuthenticated(),

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
};
