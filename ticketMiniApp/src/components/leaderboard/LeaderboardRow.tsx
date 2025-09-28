import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { BiUser } from 'react-icons/bi'
import StickerPlayer from '../StickerPlayer'



type Props = {
    username: string
    profilePic?: string
    rank: number | string
    tickets: number
    totalTickets: number
    refs: number
    type: string
    prizes: Record<string, string> | null
    currentUser?: string
}

const LeaderboardRow = ({
    username,
    profilePic,
    rank,
    tickets,
    totalTickets,
    refs,
    type,
    prizes,
    currentUser,
}: Props) => {
    const isCurrentUser = username === currentUser
    const [prize, setPrize] = useState("")

    useEffect(() => {
        if (type === "live") {
            const prizeImage = prizes ? prizes[`rank${rank}`] || prizes.default : "";
            setPrize(prizeImage);
        }
    }, [prizes, rank, type])

    return (
        <div
            className={`w-full h-20 rounded-xl flex flex-row items-center px-3 justify-between text-white backdrop-blur-md shadow-lg 
        ${isCurrentUser
                    ? 'border-[1px] border-white relative'
                    : ''} ${rank === 2
                        ? 'bg-amber-500/50 border-[1px] border-amber-500'
                        : rank === 3
                            ? 'bg-gray-500/50 border-[1px] border-gray-500'
                            : 'bg-slate-700/70'
                }`}
        >
            {/* "You" badge if current user */}
            {isCurrentUser && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 -mt-4 bg-gray-700 rounded-3xl px-2 border-[1px] border-white">
                    <p className="text-md font-semibold text-white">You</p>
                </div>
            )}

            <div className='w-fit flex flex-row gap-2 items-center justify-center'>
                <div
                    className={`size-10 overflow-hidden flex items-center justify-center rounded-full border-[1px] 
                    ${rank === 2
                            ? 'border-amber-500 bg-amber-600 shadow-sm shadow-amber-700'
                            : rank === 3
                                ? 'border-gray-300 bg-gray-400 shadow-gray-500'
                                : 'border-blue-400 bg-blue-500'
                        }`}
                >
                    <p className="font-bold text-xl">{rank}</p>
                </div>
                <div className="w-fit h-16 flex items-center justify-center relative">
                    {profilePic ? (
                        <Image
                            src={profilePic}
                            alt="profile picture"
                            width={110}
                            height={110}
                            className="object-cover rounded-full"
                        />
                    ) : (
                        <div className="size-12 rounded-full flex items-center justify-center bg-gray-600">
                            <BiUser size={32} />
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full max-w-[120px] overflow-hidden h-full pt-4 px-2">
                <p className="text-lg font-bold truncate">
                    {username}
                </p>
            </div>

            <div className="w-fit h-full flex items-center justify-center">
                { type === "live" &&
                    <div className="size-12 flex items-center justify-center mx-2 relative bg-slate-500/50 backdrop-blur-md rounded-lg p-1">
                        {prize && (
                            <StickerPlayer src={prize} />
                        )}
                    </div>
                }

                {type === 'whales' ? (
                    <div className="w-16 h-12 flex items-center justify-center relative bg-slate-500/50 backdrop-blur-md rounded-lg p-1">
                        <p className="text-lg font-semibold text-yellow-400">{totalTickets?.toString().length > 6 ? Intl.NumberFormat("en", { notation: "compact" }).format(totalTickets) : totalTickets}</p>
                    </div>
                ) : type === 'referrals' ? (
                    <div className="w-16 h-12 flex items-center justify-center relative bg-slate-500/50 backdrop-blur-md rounded-lg p-1">
                        <p className="text-lg font-semibold text-blue-400">{refs?.toString().length > 6 ? Intl.NumberFormat("en", { notation: "compact" }).format(refs) : refs}</p>
                    </div>
                ) : (
                    <div className="w-16 h-12 flex items-center justify-center relative bg-slate-500/50 backdrop-blur-md rounded-lg p-1">
                        <p className="text-lg font-semibold text-yellow-400">{tickets?.toString().length > 6 ? Intl.NumberFormat("en", { notation: "compact" }).format(tickets) : tickets}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeaderboardRow
