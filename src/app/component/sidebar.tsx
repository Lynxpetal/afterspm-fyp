"use client"

import { Sidebar } from "flowbite-react";
import {
    HiArrowSmRight, HiChartPie,
    HiInbox, HiShoppingBag, HiTable,
    HiUser, HiViewBoards
}
    from "react-icons/hi";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../FirebaseConfig/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";


export default function compSidebar() {
    const router = useRouter()
    const [isLogin, setLogin] = useState("user") //change to await apiroute to fetch user status
    // useEffect(() => {
    //     fetch('https://my-api.com/data')
    //       .then(response => response.json())
    //       .then(json => setData(json));
    //   }, []);

    useEffect(() => {
        setLogin("admin")
        //add listener to listen login or logout
    }, []);

    //logout function
    const logout = async () => {
        await signOut(auth)
        alert("Signed out successfully")//change to toast later
        router.push("/") //push to home page
    }

    return (
        <Sidebar aria-label="Sidebar with logo branding example" className="w-full">
            <Sidebar.Logo href="#" img="/vercel.svg" imgAlt="Flowbite logo">
                AfterSPM
            </Sidebar.Logo>
            <Sidebar.Items>
                {isLogin === "admin" ? <Sidebar.ItemGroup>
                    <Sidebar.Item href="/" icon={HiChartPie}>
                        Home
                    </Sidebar.Item>
                    <Sidebar.Item href="/instituteAdmin" icon={HiUser}>
                        Institute Info
                    </Sidebar.Item>
                    <Sidebar.Item href="/Prog" icon={HiUser}>
                        Manage Programme<br />Information
                    </Sidebar.Item>
                </Sidebar.ItemGroup> : <Sidebar.ItemGroup>
                    <Sidebar.Item href="/" icon={HiChartPie}>
                        Home
                    </Sidebar.Item>
                    <Sidebar.Collapse icon={HiShoppingBag} label="Career Reccomend" disabled={isLogin === "guest"}>
                        <Sidebar.Item href="./Career/Holland">1. Holland's Test</Sidebar.Item>
                        <Sidebar.Item href=".">2. Big Five Test</Sidebar.Item>
                        <Sidebar.Item href="#">3. Test Result</Sidebar.Item>
                        <Sidebar.Item href="#">4. Recommendation</Sidebar.Item>
                    </Sidebar.Collapse>
                    <Sidebar.Item href="/chat" icon={HiViewBoards} disabled={isLogin === "guest"}>
                        Chat
                    </Sidebar.Item>
                    <Sidebar.Item href="#" icon={HiInbox} disabled={isLogin === "guest"}>
                        Course Recommend
                    </Sidebar.Item>
                    <Sidebar.Item href="#" icon={HiUser} disabled={isLogin === "guest"}>
                        Institute Filter
                    </Sidebar.Item>
                </Sidebar.ItemGroup>}
                <Sidebar.ItemGroup>
                    {isLogin === "guest" ? <Sidebar.Item href="/login" icon={HiArrowSmRight}>
                        Sign In
                    </Sidebar.Item> : <Sidebar.Item href="#" icon={HiArrowSmRight} onClick={logout}>
                        Sign Out
                    </Sidebar.Item>}
                    <Sidebar.Item href="/register" icon={HiArrowSmRight} onClick={logout}>
                        Register
                    </Sidebar.Item>
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    )
}