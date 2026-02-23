"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    whatsapp?: string;
    isPremium: boolean;
    role: "admin" | "user";
    status: "active" | "blocked" | "pending";
    createdAt: string;
}

const ADMIN_EMAIL = "diegomaximo47@gmail.com";

interface AuthContextType {
    user: User | null;
    login: (email: string, password?: string) => { success: boolean; message?: string };
    register: (userData: Omit<User, "id" | "isPremium" | "role" | "status" | "createdAt">) => { success: boolean; message?: string };
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    getAllUsers: () => User[];
    updateUserStatus: (email: string, status: "active" | "blocked", isPremium: boolean) => void;
    deleteUser: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Initialize mock DB if empty
        const storedUsers = localStorage.getItem("loto-premio-users-db");
        if (!storedUsers) {
            const initialAdmin: User = {
                id: "admin-1",
                name: "Admin",
                email: ADMIN_EMAIL,
                password: "123", // Basic password for initial access
                isPremium: true,
                role: "admin",
                status: "active",
                createdAt: new Date().toISOString()
            };
            localStorage.setItem("loto-premio-users-db", JSON.stringify([initialAdmin]));
        }

        const stored = localStorage.getItem("loto-premio-user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const getUsers = (): User[] => {
        const stored = localStorage.getItem("loto-premio-users-db");
        return stored ? JSON.parse(stored) : [];
    };

    const saveUsers = (users: User[]) => {
        localStorage.setItem("loto-premio-users-db", JSON.stringify(users));
    };

    const login = (email: string, password?: string) => {
        const users = getUsers();
        const found = users.find(u => u.email === email);

        if (!found) return { success: false, message: "Usuário não encontrado." };
        if (password && found.password !== password) return { success: false, message: "Senha incorreta." };
        if (found.status === "blocked") return { success: false, message: "Sua conta está bloqueada. Entre em contato com o suporte." };
        if (found.status === "pending") return { success: false, message: "Sua conta está aguardando aprovação administrativa. Por favor, aguarde." };

        setUser(found);
        localStorage.setItem("loto-premio-user", JSON.stringify(found));
        router.push("/");
        return { success: true };
    };

    const register = (userData: any) => {
        const users = getUsers();
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: "Email já cadastrado." };
        }

        const newUser: User = {
            ...userData,
            id: Math.random().toString(36).substr(2, 9),
            isPremium: false,
            role: userData.email === ADMIN_EMAIL ? "admin" : "user",
            status: userData.email === ADMIN_EMAIL ? "active" : "pending",
            createdAt: new Date().toISOString()
        };

        const updatedUsers = [...users, newUser];
        saveUsers(updatedUsers);

        if (newUser.role === "admin") {
            setUser(newUser);
            localStorage.setItem("loto-premio-user", JSON.stringify(newUser));
            router.push("/");
        } else {
            router.push("/login?pending=true");
        }

        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("loto-premio-user");
        router.push("/login");
    };

    const getAllUsers = () => getUsers();

    const updateUserStatus = (email: string, status: "active" | "blocked", isPremium: boolean) => {
        const users = getUsers();
        const updatedUsers = users.map(u => u.email === email ? { ...u, status, isPremium } : u);
        saveUsers(updatedUsers);

        // Update current user if it's the one being modified
        if (user?.email === email) {
            const updatedUser = { ...user, status, isPremium };
            setUser(updatedUser);
            localStorage.setItem("loto-premio-user", JSON.stringify(updatedUser));
        }
    };

    const deleteUser = (email: string) => {
        const users = getUsers();
        const updatedUsers = users.filter(u => u.email !== email);
        saveUsers(updatedUsers);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isAuthenticated: !!user,
            isAdmin: user?.email === ADMIN_EMAIL,
            getAllUsers,
            updateUserStatus,
            deleteUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
