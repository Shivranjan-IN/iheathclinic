import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PageView } from '../common/types';

interface NavigationContextType {
    currentView: PageView;
    navigateTo: (view: PageView) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<PageView>(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        const view = urlParams.get('view');
        
        if (view === 'reset-password' || (token && email && !urlParams.has('user'))) {
            return 'reset-password';
        }
        return 'home';
    });

    const navigateTo = (view: PageView) => {
        setCurrentView(view);
        // Optional: Update URL without reloading for better UX (simulating routing)
        // window.history.pushState({}, '', `/${view === 'home' ? '' : view}`); 
        // Commented out to strictly ensure "Do NOT change functionality" unless requested.
    };

    return (
        <NavigationContext.Provider value={{ currentView, navigateTo }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (context === undefined) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
