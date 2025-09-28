"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AxiosError } from "axios";
import { CgSpinner } from "react-icons/cg";

import MainLayout from "@/components/MainLayout";
import MainTab from "@/components/MainTab";
import LeaderboardTab from "@/components/LeaderboardTab";
import ReferralTab from "@/components/ReferralTab";
import { launchUser } from "@/lib/api/auth";
import Overlay from "@/components/Overlay";

export default function Home() {
  const [tab, setTab] = useState("home");
  const [launched, setLaunched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appIsClosed, setAppIsClosed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // @ts-expect-error Telegram WebApp is injected by Telegram
    const tg = window?.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();

    const run = async () => {
      if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        const initData = tg.initData;

        try {
          const response = await launchUser({
            telegramId: user.id.toString(),
            firstName: user.first_name,
            lastName: user.last_name ?? "",
            username: user.username ?? "",
            initData,
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(response));
          }

          setLaunched(true);
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error.status === 409) {
              alert("app is closed for maintenance");
              setAppIsClosed(true);
            }
          }
          setLaunched(false);
          console.error("Failed to send Telegram user to backend:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLaunched(false);
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <MainLayout tab={tab} setTab={setTab}>
      <div className="size-full md:h-full md:w-[600px] bg-gradient-to-b from-slate-800 to-slate-950 overflow-hidden relative">
        {/* ---- Loading ---- */}
        {loading && (
          <Overlay>
            <div className="size-fit flex flex-row gap-2 items-center justify-center">
              <CgSpinner className="animate-spin text-white text-2xl" />
              <h2>Loading...</h2>
            </div>
          </Overlay>
        )}

        {/* ---- App closed ---- */}
        {!loading && appIsClosed && (
          <Overlay>
            <h2>The app is currently closed!</h2>
            <p className="text-base">But we&apos;ll be back soon!</p>
          </Overlay>
        )}

        {/* ---- Couldn’t launch ---- */}
        {!loading && !appIsClosed && !launched && (
          <Overlay>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              Couldn&apos;t launch the app
            </h2>

            <div className="bg-black/30 rounded-xl p-6 mb-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-3 text-gray-300">
                Possible reasons:
              </h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <i className="fas fa-robot text-blue-400 mt-1 mr-3"></i>
                  <span className="text-base">
                    You didn&apos;t launch the app through the Telegram bot
                  </span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-server text-blue-400 mt-1 mr-3"></i>
                  <span className="text-base">
                    The servers might be temporarily down
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-900/30 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-3 text-gray-300">
                What to do now:
              </h3>
              <ol className="space-y-3 text-left list-decimal list-inside">
                <li className="text-base">
                  Return to Telegram and launch the app through the bot
                </li>
                <li className="text-base">Wait a few minutes and try again</li>
              </ol>
            </div>
          </Overlay>
        )}

        {/* ---- Main app ---- */}
        {!loading && !appIsClosed && launched && (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="h-full w-full"
            >
              {tab === "home" && <MainTab launched={launched} />}
              {tab === "leaderboard" && <LeaderboardTab launched={launched} />}
              {tab === "referral" && <ReferralTab launched={launched} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </MainLayout>
  );
}
