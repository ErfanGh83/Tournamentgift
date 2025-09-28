import React from "react"

type Props = {
    type: string
}

const LeaderboardHeaderRow = ({ type }: Props) => {
    return (
        <div
            className="w-full h-16 rounded-xl flex flex-row items-center px-3 justify-between 
                       text-white backdrop-blur-md shadow-lg bg-slate-800/40"
        >
            {/* Rank */}
            <div className="w-fit flex flex-row gap-2 items-center justify-center">
                <div className="size-10 flex items-center justify-center">
                    <p className="font-bold text-md text-gray-300">Rank</p>
                </div>
            </div>

            {/* Username */}
            <div className="w-full max-w-[120px] overflow-hidden h-full flex items-center px-2">
                <p className="text-md font-bold text-gray-300 truncate">Username</p>
            </div>

            {/* Prize & Score */}
            <div className="w-fit h-full flex items-center justify-center gap-2">
                {
                    type === "live" &&
                    <div className="w-12 h-9 flex items-center justify-center bg-slate-700/50 rounded-lg">
                        <p className="text-md font-bold text-gray-300">Prize</p>
                    </div>
                }

                <div className="w-16 h-9 flex items-center justify-center bg-slate-700/50 rounded-lg">
                    <p className="text-md font-bold text-gray-300">
                        {
                            type === "whales" || type === "live" ?
                                "tickets"
                                :
                                "referrals"
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LeaderboardHeaderRow
