"use client"

import React, { Dispatch, ReactNode, SetStateAction } from "react"
import MainHeader from "./MainHeader"

type Props = {
    children: ReactNode
    tab: string
    setTab: Dispatch<SetStateAction<string>>
}

const MainLayout = ({ children, tab, setTab }: Props) => {

    
    return (
        <div className="flex md:flex-col min-h-screen bg-slate-800 md:items-center md:justify-center">
            {/* Header */}
            <MainHeader tab={tab} setTab={setTab}/>

            {/* Main content with optional sidebar */}
            <div className="flex flex-1 w-fit">

                {/* Page content */}
                <main className="w-screen flex-1 min-w-fit md:w-[600px] overflow-hidden">{children}</main>
            </div>

        </div>
    )
}

export default MainLayout
