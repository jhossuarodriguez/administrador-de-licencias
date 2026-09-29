'use client';

import { useState, createContext, useContext } from 'react';
import { SidebarContextType } from '@/types';

const SidebarContext = createContext<SidebarContextType>({
    isSidebarOpen: true,
    toggleSidebar: () => { },
});

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const useSidebarProvider = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return {
        isSidebarOpen,
        toggleSidebar,
        SidebarContext,
    };
};

export { SidebarContext };