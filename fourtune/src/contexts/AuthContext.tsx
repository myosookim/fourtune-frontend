import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import { getStoredToken, parseJwt } from '../services/auth.utils';

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
    signup: (nickname: string, email: string, password?: string, phoneNumber?: string) => Promise<void>;
    checkAuth: () => void;
    updateUserProfile: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                // 토큰은 있는데 유저 정보가 없는 경우 (예: 소셜 로그인 콜백, 새로고침)
                recoverUserFromToken(token);
            }
        } else {
            setUser(null);
            localStorage.removeItem('user');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email: string, password?: string) => {
        const result = await userService.login(email, password);
        setUser(result.user);
    };

    const signup = async (nickname: string, email: string, password?: string, phoneNumber?: string) => {
        const result = await userService.signup(nickname, email, password, phoneNumber);
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
            // user state 기반으로 일원화 — user가 설정되면 인증됨
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            signup,
            checkAuth,
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
