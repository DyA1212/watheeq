"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";


export default function NavigationWrapper(){

  const pathname = usePathname();


  const hideNav = [
    "/",
    "/login",
    "/register"
  ];


  if(hideNav.includes(pathname)){
    return null;
  }


  return <BottomNav />;

}