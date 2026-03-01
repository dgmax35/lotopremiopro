"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthGuard({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth() as any; // isLoading might not exist, checking
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
        if (!user && !isPublicRoute) {
            router.push("/login");
        }
    }, [user, pathname, router]);

    return <>{children}</>;
}
