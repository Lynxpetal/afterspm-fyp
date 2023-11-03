"use client"

import { Sidebar } from "flowbite-react";
import {
    HiArrowSmRight, HiChartPie,
    HiInbox, HiShoppingBag, HiTable,
    HiUser, HiViewBoards
}
    from "react-icons/hi";
import Link from "next/link";
import React, {useEffect, useState} from 'react';


export default function compSidebar() {
    const [isLogin, setLogin] = useState(true)
    useEffect(() => {
        fetch('https://my-api.com/data')
          .then(response => response.json())
          .then(json => setData(json));
      }, []);

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
                    <Sidebar.Collapse icon={HiShoppingBag} label="Career Reccomend">
                        <Sidebar.Item href="./Career/Holland">1. Holland's Test</Sidebar.Item>
                        <Sidebar.Item href=".">2. Big Five Test</Sidebar.Item>
                        <Sidebar.Item href="#">3. Test Result</Sidebar.Item>
                        <Sidebar.Item href="#">4. Reccomendation</Sidebar.Item>
                    </Sidebar.Collapse>
                    <Sidebar.Item href="/chat" icon={HiViewBoards}>
                        Chat
                    </Sidebar.Item>
                    <Sidebar.Item href="#" icon={HiInbox}>
                        Course Reccomend
                    </Sidebar.Item>
                    <Sidebar.Item href="#" icon={HiUser}>
                        Institute Filter
                    </Sidebar.Item>
                </Sidebar.ItemGroup>
                <Sidebar.ItemGroup>
                    {isLogin ? <Sidebar.Item href="/login" icon={HiArrowSmRight}>
                        Sign In
                    </Sidebar.Item> : <Sidebar.Item href="#" icon={HiArrowSmRight}>
                        Sign Out
                    </Sidebar.Item>}
                    <Sidebar.Item href="/register" icon={HiTable}>
                        Register
                    </Sidebar.Item>
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    )
}