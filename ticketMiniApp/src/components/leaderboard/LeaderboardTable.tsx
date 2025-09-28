"use client";

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion } from "framer-motion";
import LeaderboardRow from "./LeaderboardRow";
import NumberOnePlaceholder from "./NumberOnePlaceholder";
import LeaderboardHeaderRow from "./LeaderBoardHeader";
import { fetchLeaderboard } from "@/lib/api/leaderboard";
import { LeaderboardResponse } from "@/types";
import Image from "next/image";
import { CgSpinner } from "react-icons/cg";
import { LaunchResponse } from "@/lib/api/auth";
interface userInfo {
    telegramId: string;
    username: string;
    tickets: number;
    refs: number;
    rank: number;
    totalTickets: number;
}

type Props = {
    table: string;
    setError: Dispatch<SetStateAction<string | null>>;
    launched: boolean;
};

const LeaderboardTable = ({ table, setError, launched }: Props) => {
    const [list, setList] = useState<userInfo[] | null>(null);
    const [userInfo, setUserInfo] = useState<LaunchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOnTheLeaderBoard, setIsOnTheLeaderboard] = useState(false);

    const [prizes] = useState({
        rank1: "/stickers/sparta.json",
        rank2: "/stickers/crystall.json",
        rank3: "/stickers/dimond-ring.json",
        rank4: "/stickers/perfume.json",
        rank5: "/stickers/cat-helmet.json",
        rank6: "/stickers/golden-ring.json",
        rank7: "/stickers/frog.json",
        rank8: "/stickers/frog.json",
        rank9: "/stickers/vinyl-player.json",
        rank10: "/stickers/vinyl-player.json",
        default: "/stickers/rocket.json",
    });

    // Load user from localStorage
    useEffect(() => {
        if (launched === true) {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUserInfo(parsedUser.user);
            }
        }
    }, [launched]);

    // Load leaderboard once
    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            if (userInfo) {
                try {
                    let limit = 20;
                    if (table === "whales") limit = 20;
                    if (table === "live") limit = 50;

                    const data: LeaderboardResponse = await fetchLeaderboard(
                        table as "whales" | "live",
                        limit,
                        userInfo.telegramId
                    );

                    if (data.type !== table) return;

                    const mapped: userInfo[] = data.leaderboard.map((entry, idx) => ({
                        telegramId: entry.telegramId,
                        username: entry.username || entry.telegramId,
                        tickets: entry.yellowTickets,
                        refs: entry.referralsCount,
                        totalTickets: entry.totalTicketsBought,
                        rank: idx + 1,
                    }));

                    setList(mapped);

                    const isInList = mapped.some(
                        (u) => u.telegramId === userInfo?.telegramId
                    );
                    setIsOnTheLeaderboard(isInList);
                } catch (err) {
                    console.error(err);
                    setError("Failed to load leaderboard");
                }
            }
            setLoading(false);
        };

        loadLeaderboard();
    }, [table, setError, userInfo]);

    return (
        <div
            className={`w-full mx-auto flex flex-col gap-2 px-4 overflow-y-hidden pt-4 ${!isOnTheLeaderBoard ? "pb-24" : ""
                }`}
        >
            {list?.length ? (
                list.map((user, i) =>
                    user.rank === 1 ? (
                        <motion.div
                            key={user.username}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            className="w-full flex flex-col h-fit"
                        >
                            <NumberOnePlaceholder
                                username={user.username}
                                tickets={user.tickets}
                                totalTickets={user.totalTickets}
                                refs={user.refs}
                                type={table}
                                prize={prizes["rank1"]}
                            />

                            <LeaderboardHeaderRow type={table} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={user.username}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                        >
                            <LeaderboardRow
                                username={user.username}
                                rank={user.rank}
                                tickets={user.tickets}
                                totalTickets={user.totalTickets}
                                refs={user.refs}
                                type={table}
                                currentUser={userInfo?.username}
                                prizes={prizes}
                            />
                        </motion.div>
                    )
                )
            ) : loading ? (
                <div className="size-72 fixed flex flex-col items-center justify-center top-1/2 left-1/2 -mt-16 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-row items-center justify-center gap-2">
                        <CgSpinner className="animate-spin text-white" size={30} />
                        <h3 className="font-semibold text-white text-3xl">Loading...</h3>
                    </div>
                </div>
            ) : (
                <div className="size-72 fixed flex flex-col items-center justify-center top-1/2 left-1/2 -mt-16 transform -translate-x-1/2 -translate-y-1/2">
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

            {
                !isOnTheLeaderBoard && !loading && userInfo && (
                    <div className="w-full max-w-[600px] h-fit -translate-x-1/2 fixed bottom-20 left-1/2 z-20 px-4">
                        <LeaderboardRow
                            username={userInfo.username}
                            rank={table === "live"? '+50' : '+20'}
                            tickets={userInfo.yellowTickets}
                            totalTickets={userInfo.totalTicketsBought}
                            refs={userInfo.referralsCount}
                            type={table}
                            currentUser={userInfo?.username}
                            prizes={null}
                        />
                    </div>
                )
            }
        </div>
    );
};

export default LeaderboardTable;
