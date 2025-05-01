"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface MenuContextProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <MenuContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </MenuContext.Provider>
    );
}

export function useMenuOpen() {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error("useMenuOpen must be used within a MenuProvider");
    }
    return context;
} 