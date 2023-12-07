"use client"

import { Button, Modal, Sidebar } from "flowbite-react";
import {
    HiArrowSmRight, HiChartPie,
    HiExclamation,
    HiInbox, HiShoppingBag, HiTable,
    HiUser, HiViewBoards
}
    from "react-icons/hi";
import Link from "next/link";
import React, { use, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../FirebaseConfig/firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getDocs, query, where } from "firebase/firestore";
import { secretCollection } from "../lib/controller";
import { FaFilter } from "react-icons/fa"
import { MdRecommend } from "react-icons/md"


export default function compSidebar() {
    const router = useRouter()
    const [uid, setUID] = useState("guest") //change to await apiroute to fetch user status
    const [isAdmin, setAdmin] = useState<boolean>(false)
    const [openModal, setOpenModal] = useState<boolean>(false)
    useEffect(() => {
        
        const auth = getAuth()
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("runned")
                if (user.uid != uid) {
                    console.log(user.uid)
                    setUID(user.uid)
                    const secret = query(secretCollection, where("UserID", "==", user.uid))
                    const snapshot = await getDocs(secret)
                    if (snapshot.size != 0) {
                        setAdmin(true)
                    }
                }
            }
            else {
                setUID("guest")
            }
        })
    })

    //logout function
    const logout = async () => {
        console.log(isAdmin)
        console.log(uid)
        await signOut(auth).then(() => {
            setAdmin(false)
        }).catch((error) => { console.log("not signed out") })
    }

    return (
        <Sidebar aria-label="Sidebar with logo branding example" className="w-full">

            <Sidebar.Logo href="#" img="/vercel.svg" imgAlt="Flowbite logo">
                AfterSPM
            </Sidebar.Logo>
            <Sidebar.Items>
            <Sidebar.ItemGroup>
                    <Sidebar.Item href="/" icon={HiChartPie}>
                        Home
                    </Sidebar.Item>
                {uid != "guest" ? 
                <Sidebar.ItemGroup>
                    <Sidebar.Collapse icon={HiShoppingBag} label="Career Reccomend">
                        <Sidebar.Item href="/career/Holland">1. Holland's Test</Sidebar.Item>
                        <Sidebar.Item href="/career/BigFive">2. Big Five Test</Sidebar.Item>
                        <Sidebar.Item href="/career/Reccomend">3. Test Result and Reccomend</Sidebar.Item>
                        <Sidebar.Item href="/career/Course">4. Course Recommendation</Sidebar.Item>
                    </Sidebar.Collapse>
                    <Sidebar.Item href="/newChat" icon={HiViewBoards}>
                        Chat
                    </Sidebar.Item>
                    <Sidebar.Item href="/filterInstituteProgramme" icon={FaFilter}>
                        Institute Filter
                    </Sidebar.Item>
                    <Sidebar.Item href="/uploadResult" icon={MdRecommend}>
                        Programme <br /> Recommendation
                    </Sidebar.Item>
                </Sidebar.ItemGroup>: <></>}
                </Sidebar.ItemGroup>
                {isAdmin ?
                    //add selection here for more admin option
                    <Sidebar.ItemGroup>
                        <Sidebar.Item href="/instituteAdmin" icon={HiUser}>
                            Manage Institute<br />Information
                        </Sidebar.Item>
                        <Sidebar.Item href="/programmeAdmin" icon={HiUser}>
                            Manage Programme<br />Information
                        </Sidebar.Item>
                    </Sidebar.ItemGroup> : <></>
                }
                <Sidebar.ItemGroup>
                    {uid == "guest" ? <Sidebar.Item href="/login" icon={HiArrowSmRight}>
                        Sign In
                    </Sidebar.Item> : <Sidebar.Item href="#" icon={HiArrowSmRight} onClick={logout}>
                        Sign Out
                    </Sidebar.Item>}
                    <Sidebar.Item href="/register" icon={HiArrowSmRight}>
                        Register
                    </Sidebar.Item>
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    )
}