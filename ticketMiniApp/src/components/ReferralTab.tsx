"use client"

import { LaunchResponse } from '@/lib/api/auth'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { BiCopy } from 'react-icons/bi'
import ReferralsLeaderboard from './ReferralsLeaderboard'
import { LeaderboardResponse } from '@/types'
import { fetchLeaderboard } from '@/lib/api/leaderboard'
import { CgSpinner } from 'react-icons/cg'
import Image from 'next/image'

interface userInfo {
    telegramId: string
    username: string
    tickets: number
    refs: number
    rank: number
    totalTickets: number
}

type Props = {
    launched: boolean
}

const ReferralTab = ({ launched }: Props) => {
    const [ReferralLink, setReferralLink] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [errorTime,] = useState<number>(3000)
    const [message, setMessage] = useState<string | null>(null)
    const [messageTime,] = useState<number>(3000)
    const [userInfo, setUserInfo] = useState<LaunchResponse | null>(null)
    const [list, setList] = useState<userInfo[] | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true)
            if (userInfo) {
                try {
                    const data: LeaderboardResponse = await fetchLeaderboard(
                        "referrals",
                        10,
                        userInfo.telegramId
                    );

                    if (data.type !== "referrals") return;

                    let mapped: userInfo[] = data.leaderboard.map((entry, idx) => ({
                        telegramId: entry.telegramId,
                        username: entry.username || entry.telegramId,
                        tickets: entry.yellowTickets,
                        refs: entry.referralsCount,
                        totalTickets: entry.totalTicketsBought,
                        rank: idx + 1,
                    }));

                    // 🛠 Fix: If backend sent 11 elements, drop the last one
                    if (mapped.length > 10) {
                        mapped = mapped.slice(0, 10);
                    }

                    setList(mapped);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (err: any) {
                    console.log(err);
                    setError(err?.message || "Failed to load leaderboard");
                }
            }

            setLoading(false)
        };

        loadLeaderboard();
    }, [userInfo,]);

    useEffect(() => {
        if (launched === true) {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserInfo(parsedUser.user)
            }
        }

    }, [launched,])

    useEffect(() => {
        if (userInfo) {
            setReferralLink(`https://t.me/tournamentgift_bot?start=${userInfo.refralCode}`)
        }

    }, [userInfo])

    const handleCopy = () => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ReferralLink)
                .then(() => console.log("Copied!"))
                .catch((err) => { setError("Copy failed"); console.error(err) })
        } else {
            // fallback: create temporary textarea
            const textArea = document.createElement("textarea")
            textArea.value = ReferralLink
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand("copy")
            } catch (err) {
                console.error(err)
                setError("Failed to copy")
            }
            document.body.removeChild(textArea)
        }
        setMessage("Copied!")
    }

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null)
            }, errorTime)

            return () => clearTimeout(timer)
        }
        else if (message) {
            const timer = setTimeout(() => {
                setMessage(null)
            }, messageTime)

            return () => clearTimeout(timer)
        }
    }, [error, errorTime, message, messageTime])

    return (
        <div className="bg-gradient-to-b from-blue-800 to-green-600 w-full h-full pb-20 overflow-hidden flex flex-col items-center relative pt-16">

            <div className="w-fit h-fit flex flex-row items-center gap-4 mx-auto mb-4">
                <p className="text-4xl font-bold text-white">1000 TON</p>
                <Image
                    src="/images/ton.png"
                    alt="ton"
                    width={40}  // similar to text height
                    height={40}
                    className="object-contain"
                />
            </div>
            <div className="flex flex-col justify-center p-4 text-white mb-5 
                rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-blue-300/20">

                <p className="text-lg">🎯 Only 200,000 Seats</p>
                <p className="text-lg">👥 1 Friend = 1 Black ticket</p>
                <p className="text-lg">🏆 Top 10 Winhuse prizes!</p>
                <p className="text-lg">🚀 Invite &amp; Climb the board!</p>
            </div>



            <h2 className="text-2xl sm:text-3xl font-bold text-white py-2 text-center sm:text-left">
                Your referral link
            </h2>

            <div className="w-[300px] sm:w-[350px] h-10 sm:h-12 flex items-center border bg-gray-800/70 border-slate-700 shadow-sm rounded-full overflow-hidden px-1 sm:px-2">
                {/* Scrollable link container */}
                <div className="flex-1 overflow-x-auto px-2 sm:px-4">
                    <p className="whitespace-nowrap text-white text-xs sm:text-sm font-semibold">
                        {ReferralLink}
                    </p>
                </div>

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl text-white font-semibold cursor-pointer"
                >
                    <BiCopy />
                </button>
            </div>


            <div className="w-full h-fit mt-4">
                <h2 className="w-fit text-3xl font-bold text-white mx-auto my-2">
                    Closing Soon...
                </h2>

                {list?.length ? (
                    <ReferralsLeaderboard users={list} />
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <CgSpinner className="animate-spin text-white" size={30} />
                            <h3 className="font-semibold text-white text-3xl">Loading...</h3>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Image
                            src={"/images/leaderboardEmpty.png"}
                            alt={"empty leaderboard icon"}
                            width={150}
                            height={150}
                            className="invert"
                        />
                        <h3 className="font-semibold text-white text-xl">
                            Leaderboard is empty.
                        </h3>
                    </div>
                )}
            </div>


            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="w-full h-12 flex flex-row items-center justify-center bg-red-500 text-white text-xl overflow-x-auto fixed top-0 left-0 z-50"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="w-full h-12 flex flex-row items-center justify-center bg-green-500 text-white text-xl overflow-x-auto fixed top-0 left-0 z-50"
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ReferralTab
