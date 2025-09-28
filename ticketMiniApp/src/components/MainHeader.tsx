"use client"
import React, { Dispatch, SetStateAction } from "react"
import { AiFillHome } from "react-icons/ai"
import { BiTrophy } from "react-icons/bi"
import { FaUserGroup } from "react-icons/fa6"

type Props = {
  tab: string
  setTab: Dispatch<SetStateAction<string>>
}

const MainHeader = ({ tab, setTab }: Props) => {
  const tabs = [
    { key: "home", label: "Home", icon: <AiFillHome size={20} /> },
    { key: "leaderboard", label: "Leaderboard", icon: <BiTrophy size={20} /> },
    { key: "referral", label: "Referral", icon: <FaUserGroup size={20} /> },
  ]

  return (
    <header className="w-full md:h-full md:w-[600px] flex items-center justify-between shadow-md bg-transparent text-white relative">

      {/* Bottom nav */}
      <nav className="w-full h-fit md:w-[600px] mx-auto flex flex-row items-center justify-around fixed bottom-0 left-0 md:left-1/2 md:-translate-x-1/2 z-30 bg-gray-700/40 backdrop-blur-sm">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
              tab === key
                ? "text-blue-400"
                : "text-white hover:text-blue-300"
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}

export default MainHeader
