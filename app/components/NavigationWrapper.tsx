"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function NavigationWrapper() {
  const pathname = usePathname();

  const hideNav = [
    "/",
    "/login",
    "/register",
    "/signup",
    "/terms",
    "/privacy",
    "/how-it-works",
    "/review",
  ];

  if (hideNav.includes(pathname)) {
    return null;
  }

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <BottomNav />;
}