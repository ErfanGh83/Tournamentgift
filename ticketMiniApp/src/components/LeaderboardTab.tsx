"use client"

import React, { useEffect, useState } from 'react'
import LeaderboardTable from './leaderboard/LeaderboardTable'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  launched: boolean
}

const LeaderboardTab = ({ launched }: Props) => {
  const [table, setTable] = useState<string>('live')
  const [error, setError] = useState<string | null>(null)
  const [errorTime,] = useState<number>(3000)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, errorTime)
      return () => clearTimeout(timer)
    }
  }, [error, errorTime])

  return (
    <div className="size-full flex flex-col bg-gradient-to-b from-blue-900 to-blue-950 relative pb-20 pt-12 overflow-hidden">
      {/* Dropdown top-left */}
      <div className="absolute top-[6%] left-5 right-5 z-10 flex justify-between">
        <button
          onClick={() => setTable("live")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${table === "live"
            ? "border-2 border-blue-500 text-blue-500 bg-slate-900"
            : "border border-slate-600 text-white bg-slate-800 hover:border-blue-400"
            }`}
        >
          Live
        </button>
        
        <button
          onClick={() => setTable("whales")}
          className={`px-4 py-2 rounded-lg font-semibold transition ${table === "whales"
            ? "border-2 border-blue-500 text-blue-500 bg-slate-900"
            : "border border-slate-600 text-white bg-slate-800 hover:border-blue-400"
            }`}
        >
          Whales
        </button>
      </div>

      <LeaderboardTable table={table} setError={setError} launched={launched} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[600px] h-12 flex items-center justify-center bg-red-500 text-white text-xl z-30"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LeaderboardTab
