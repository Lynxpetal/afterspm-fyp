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
    const [isLogin, setLogin] = useState("")
    // useEffect(() => {
    //     fetch('https://my-api.com/data')
    //       .then(response => response.json())
    //       .then(json => setData(json));
    //   }, []);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                //user is signed in
                //sidebar change to sign out
                if (user.email == '2002calvinmok@gmail.com' || user.email == 'foofooronron@gmail.com') {
                    setLogin("admin")
                }
                else {
                    setLogin("student")
                }

            } else {
                //user is signed out
                //sidebar change to sign in
                setLogin("user")
            }
        });


    }, []);

    //logout function
    const logout = async () => {
        await signOut(auth)
        alert("Signed out successfully")
        //once user logged out then navigate user at login page
        router.push("/login")
        setLogin("user")

    }

    return (
        <Sidebar aria-label="Sidebar with logo branding example">
            <Sidebar.Logo href="#" img="/vercel.svg" imgAlt="Flowbite logo">
                AfterSPM
            </Sidebar.Logo>
            <Sidebar.Items>
                <Sidebar.ItemGroup>
                    <Sidebar.Item href="/" icon={HiChartPie}>
                        Home
                    </Sidebar.Item>
                    {isLogin == "student" && (
                        <Sidebar.Collapse icon={HiShoppingBag} label="Career Reccomend">
                            <Sidebar.Item href="./Career/Holland">1. Holland's Test</Sidebar.Item>
                            <Sidebar.Item href=".">2. Big Five Test</Sidebar.Item>
                            <Sidebar.Item href="#">3. Test Result</Sidebar.Item>
                            <Sidebar.Item href="#">4. Recommendation</Sidebar.Item>
                        </Sidebar.Collapse>
                    )}

                    {isLogin == "student" && (
                        <Sidebar.Item href="/chat" icon={HiViewBoards}>
                            Chat
                        </Sidebar.Item>
                    )}

                    {isLogin == "student" && (
                        <Sidebar.Item href="#" icon={HiInbox}>
                            Course Recommend
                        </Sidebar.Item>
                    )}

                    {isLogin == "student" && (
                        <Sidebar.Item href="#" icon={HiUser}>
                            Institute Filter
                        </Sidebar.Item>
                    )}


                    {isLogin == "admin" && (
                        <Sidebar.Item href="/instituteAdmin" icon={HiUser}>
                            Manage Institute<br />Information
                        </Sidebar.Item>
                    )}

                    {isLogin == "admin" && (
                        <Sidebar.Item href="/Prog" icon={HiUser}>
                            Manage Programme<br />Information
                        </Sidebar.Item>
                    )}
                </Sidebar.ItemGroup>
                <Sidebar.ItemGroup>
                    {isLogin ? <Sidebar.Item href="/login" icon={HiArrowSmRight}>
                        Sign In
                    </Sidebar.Item> : <Sidebar.Item href="#" icon={HiArrowSmRight} onClick={logout}>
                        Sign Out
                    </Sidebar.Item>}
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    )
}