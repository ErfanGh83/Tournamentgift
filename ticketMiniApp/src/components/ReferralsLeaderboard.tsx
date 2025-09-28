"use client"

import React from "react"
import Image from "next/image"

interface UserInfo {
    telegramId: string
    username: string
    tickets: number
    refs: number
    rank: number
    totalTickets: number
}

type Props = {
    users: UserInfo[]
}

const ReferralsLeaderboard = ({ users }: Props) => {
    return (
        <div className="w-full flex flex-col gap-2 bg-tranparent rounded-xl p-4">
            {users.map((user) => (
                <div
                    key={user.telegramId}
                    className="flex items-center justify-between bg-black/30 backdrop-blur-md rounded-lg px-3 py-2"
                >
                    {/* Left: Initial circle + username */}
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg uppercase ${user.rank === 1
                                    ? "bg-yellow-400" // gold
                                    : user.rank === 2
                                        ? "bg-orange-500" // bronze
                                        : user.rank === 3
                                            ? "bg-gray-400" // silver
                                            : "bg-blue-500" // default
                                }`}
                        >
                            {user.username.charAt(0)}
                        </div>
                        <span className="text-white font-medium">{user.username}</span>
                    </div>

                    {/* Right: Tickets + Black ticket icon */}
                    <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">
                            {user.refs.toLocaleString()}
                        </span>
                        <Image
                            src="/images/black-ticket.png"
                            alt="Black ticket"
                            width={70}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ReferralsLeaderboard
