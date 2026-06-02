import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, PageView } from '../common/types';
import { getUserWithRole, authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    login: (userData: User, token?: string) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check for auth callback parameters
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                const userParam = urlParams.get('user');

                if (token && userParam) {
                    // Handle auth callback from backend
                    localStorage.setItem('auth_token', token);
                    const userData = JSON.parse(decodeURIComponent(userParam));
                    // Validate role
                    const validRoles = ['patient', 'doctor', 'clinic', 'receptionist', 'nurse', 'lab', 'pharmacy', 'admin'];
                    if (!validRoles.includes(userData.role)) {
                        userData.role = 'patient';
                    }
                    const userObj = {
                        id: userData.user_id,
                        full_name: userData.full_name,
                        name: userData.full_name,
                        email: userData.email,
                        role: userData.role as UserRole,
                    };
                    setUser(userObj);
                    // Cache the user in localStorage
                    localStorage.setItem('user', JSON.stringify(userObj));

                    // Clear URL parameters
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    // Check for existing session
                    const userWithRole = await getUserWithRole();
                    if (userWithRole) {
                        console.log("initAuth: got userWithRole:", userWithRole);
                        // Validate role in case it's malformed
                        const validRoles = ['patient', 'doctor', 'clinic', 'receptionist', 'nurse', 'lab', 'pharmacy', 'admin'];
                        if (!userWithRole.role || !validRoles.includes(userWithRole.role)) {
                            userWithRole.role = 'patient';
                        }
                        setUser(userWithRole);
                    }
                }
            } catch (error) {
                console.error("Initial auth error:", error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (userData: User, token?: string) => {
        console.log("🔑 AuthContext: login called with:", userData);
        console.log("🔑 AuthContext: token received:", token ? 'YES' : 'NO');
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // If a token was provided, store it in localStorage
        if (token) {
            localStorage.setItem('auth_token', token);
            console.log("✅ Auth token stored in localStorage");
        }
        
        setUser(userData);
        console.log("✅ AuthContext: setUser called, user state should update on next render");
    };

    const logout = async () => {
        try {
            await authService.signOut();
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            setUser,
            login,
            logout,
            isAuthenticated: !!user
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
