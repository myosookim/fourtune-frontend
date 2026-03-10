import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import { getStoredToken, parseJwt, isUserAuthenticated } from '../services/auth.utils';

interface User {
    id?: number;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    updateUserProfile: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(() => {
        const token = getStoredToken();
        const userStr = localStorage.getItem('user');

        if (token) {
            if (userStr) {
                try {
                    setUser(JSON.parse(userStr));
                } catch (e) {
                    console.error('Failed to parse user from localStorage');
                    recoverUserFromToken(token);
                }
            } else {
                // 토큰은 있는데 유저 정보가 없는 경우 (예: 새로고침 또는 타임아웃)
                recoverUserFromToken(token);
            }
        } else {
            setUser(null);
            localStorage.removeItem('user'); // 토큰 없으면 유저 정보도 삭제
        }
        setIsLoading(false);
    }, []);

    const recoverUserFromToken = (token: string) => {
        try {
            const payload = parseJwt(token);
            const recoveredUser = {
                id: payload.sub ? Number(payload.sub) : 0,
                email: payload.email || '',
                name: payload.nickname || payload.name || 'User'
            };
            setUser(recoveredUser);
            localStorage.setItem('user', JSON.stringify(recoveredUser));
        } catch (e) {
            console.error('Failed to recover user from token', e);
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email: string, password?: string) => {
        const result = await userService.login(email, password);
        setUser(result.user);
    };

    const logout = () => {
        userService.logout();
        setUser(null);
    };

    const updateUserProfile = (name: string) => {
        if (user) {
            const updatedUser = { ...user, name };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: isUserAuthenticated(),
            isLoading,
            login,
            logout,
            updateUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
