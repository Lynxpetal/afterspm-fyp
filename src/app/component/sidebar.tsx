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
import { useLoginStore } from "../lib/hooks/loginState";


export default function compSidebar() {
    const router = useRouter()
    const [isLogin, setLogin] = useState(useLoginStore.getState().loginstate) //change to await apiroute to fetch user status


    useEffect(() => {
        setLogin(useLoginStore.getState().loginstate)
        console.log(useLoginStore.getState().loginstate)
        //add listener to listen login or logout
    },[useLoginStore.getState().loginstate]);

    //logout function
    const logout = async () => {
        await signOut(auth)
        useLoginStore.setState({
            loginstate: "guest",
            username: ""
        })
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
                        Manage Institute<br />Information
                    </Sidebar.Item>
                    <Sidebar.Item href="/Prog" icon={HiUser}>
                        Manage Programme<br />Information
                    </Sidebar.Item>
                </Sidebar.ItemGroup> : <Sidebar.ItemGroup>
                    <Sidebar.Item href="/" icon={HiChartPie}>
                        Home
                    </Sidebar.Item>
                    <Sidebar.Collapse icon={HiShoppingBag} label="Career Reccomend">
                        <Sidebar.Item href="/career/Holland">1. Holland's Test</Sidebar.Item>
                        <Sidebar.Item href="/career/BigFive">2. Big Five Test</Sidebar.Item>
                        <Sidebar.Item href="/career/Reccomend">3. Test Result</Sidebar.Item>
                        <Sidebar.Item href="/career/Course">4. Recommendation</Sidebar.Item>
                    </Sidebar.Collapse>
                    <Sidebar.Item href="/newChat" icon={HiViewBoards} disabled={isLogin === "guest"}>
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