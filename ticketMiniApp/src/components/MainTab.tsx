"use client"

import { AnimatePresence, motion } from "framer-motion"
import React, { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { BiMinus, BiPlus } from "react-icons/bi"
import { buyTickets, verifyPayment } from "@/lib/api/payment"
import { AxiosError } from "axios"
import { LaunchResponse } from "@/lib/api/auth"
import { SendTransactionRequest, useTonConnectUI } from "@tonconnect/ui-react"
import { CHAIN } from "@tonconnect/protocol";
import { Address } from "ton"
import WebApp from "@twa-dev/sdk"
import {
    initTournamentSocket,
    closeTournamentSocket,
    TournamentState,
} from "@/lib/socket/tournamentSocket";

type Props = {
    launched: boolean
}

const MainTab = ({ launched }: Props) => {
    const [availableGoldenTickets, setAvailableGoldenTickets] = useState<number>(0)
    const [refsCount, setRefsCount] = useState<number>(0)
    const [storedTickets, setStoredTickets] = useState<number>(0)
    const [inCartTickets, setInCartTickets] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)
    const [errorTime] = useState<number>(3000)
    const [message, setMessage] = useState<string | null>(null)
    const [messageTime] = useState<number>(3000)
    const [userInfo, setUserInfo] = useState<LaunchResponse | null>(null)
    const [tonConnectUI] = useTonConnectUI()
    const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [state, setState] = useState<TournamentState>({
        totalTickets: 0,
        ticketsSold: 0,
    });
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (launched) {
            initTournamentSocket((newState: TournamentState) => {
                setState(newState);
            });

            return () => {
                closeTournamentSocket();
            };
        }
    }, [launched,]);

    useEffect(() => {
        if (state) {
            updateTotalTickets(state.totalTickets, state.ticketsSold)
        }
    }, [state])

    const handleWalletConnection = useCallback((address: string) => {
        setTonWalletAddress(address);
        console.log("wallet connected successfully!")
        setIsLoading(false)
    }, [])

    const handleWalletDiconnection = useCallback(() => {
        setTonWalletAddress(null);
        console.log("wallet disconnected successfully!")
        setIsLoading(false)
    }, [])

    useEffect(() => {
        const checkWalletConnection = async () => {
            if (tonConnectUI.account?.address) {
                handleWalletConnection(tonConnectUI.account.address)
            }
            else {
                handleWalletDiconnection()
            }
        }

        checkWalletConnection()

        const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
            if (wallet) {
                handleWalletConnection(wallet?.account.address)
            }
            else {
                handleWalletDiconnection()
            }
        })

        return () => {
            unsubscribe()
        }
    }, [tonConnectUI, handleWalletConnection, handleWalletDiconnection])

    const handleWalletAction = async () => {
        if (tonConnectUI.connected) {
            setIsLoading(true);
            await tonConnectUI.disconnect()
        }
        else {
            await tonConnectUI.openModal()
        }
    }

    const formatAddress = (address: string) => {
        const tempAddress = Address.parse(address).toString();
        return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    }

    useEffect(() => {
        if (launched === true) {
            const storedUser = localStorage.getItem("user");
            const orderId = localStorage.getItem("orderId")
            const status = localStorage.getItem("status")

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setAvailableGoldenTickets(Number(parsedUser.totalTickets) - Number(parsedUser.ticketsSold))
                setUserInfo(parsedUser.user)
            }

            if (orderId && status) {
                runVerification(status as "paid" | "failed");
                localStorage.removeItem("orderId")
                localStorage.removeItem("paymentLink")
                localStorage.removeItem("status")
                localStorage.removeItem("inCartTickets")
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [launched,])

    function updateYellowTickets(amount: number) {
        setStoredTickets(prev => prev + amount)
        // Get the stored user object from localStorage
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            // Parse the JSON string into an object
            const parsedUser = JSON.parse(storedUser);

            // Add the amount to the existing yellowTickets value
            parsedUser.user.yellowTickets += amount;

            // Save the updated user object back to localStorage
            localStorage.setItem("user", JSON.stringify(parsedUser));
        } else {
            console.error("No user found in localStorage.");
        }
    }

    function updateTotalTickets(totalTickets: number, ticketsSold: number) {
        setAvailableGoldenTickets(totalTickets - ticketsSold)
        // Get the stored user object from localStorage
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            // Parse the JSON string into an object
            const parsedUser = JSON.parse(storedUser);

            // Add the amount to the existing yellowTickets value
            parsedUser.totalTickets = totalTickets;
            parsedUser.ticketsSold = ticketsSold;

            // Save the updated user object back to localStorage
            localStorage.setItem("user", JSON.stringify(parsedUser));
        } else {
            console.error("No user found in localStorage.");
        }
    }

    useEffect(() => {
        if (userInfo) {
            setStoredTickets(userInfo.yellowTickets)
            setRefsCount(userInfo.referralsCount)
        }
    }, [userInfo])

    const runVerification = async (status: "paid" | "failed") => {
        const orderId = localStorage.getItem('orderId')
        const storedInCartTickets = localStorage.getItem("inCartTickets")

        if (orderId) {
            try {
                const resp = await verifyPayment(orderId, status)
                console.log(resp)
                if (status === "paid") {
                    setMessage("Payment successful! Tickets added.")

                    if (storedInCartTickets) {
                        updateYellowTickets(Number(storedInCartTickets))
                    }

                    setIsPaymentModalOpen(false)
                }
                else {
                    setError("Your last payment failed or cancelled.")
                }

                localStorage.removeItem("orderId")
                localStorage.removeItem("paymentLink")
                localStorage.removeItem("status")
                localStorage.removeItem("inCartTickets")
            } catch (err) {
                console.error(err)
                if (err instanceof AxiosError) {
                    if (err.status === 422) {
                        setError("Couldn't verify, please try again.")
                    }
                }
                else {
                    setError("Verification failed, please try again or contact support.")
                }
            }
        }
        else {
            return
        }
    }

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), errorTime)
            return () => clearTimeout(timer)
        } else if (message) {
            const timer = setTimeout(() => setMessage(null), messageTime)
            return () => clearTimeout(timer)
        }
    }, [error, errorTime, message, messageTime])

    const handleTicketIncrement = () => {
        if (availableGoldenTickets - inCartTickets <= 0) {
            setError("No more tickets available to add")
            return
        }
        setInCartTickets((prev) => prev + 1)
    }

    const handleTicketDecrement = () => {
        if (inCartTickets <= 0) {
            setError("No tickets in cart to remove")
            return
        }
        setInCartTickets((prev) => prev - 1)
    }

    const handleBuy = async (method: "stars" | "ton") => {
        if (inCartTickets <= 0) {
            setError("Add tickets before buying")
            return
        }
        else if (inCartTickets > availableGoldenTickets) {
            setError("You’re trying to buy more tickets than are available.");
            setInCartTickets(availableGoldenTickets)
            return
        }

        try {
            // 🟢 Flow for TON
            if (method === "ton") {
                // 1. Call backend to create TON link
                const resp = await buyTickets(userInfo!.telegramId, "ton", inCartTickets);

                if (resp.paymentLink && resp.orderId) {
                    localStorage.setItem("orderId", resp.orderId)
                    localStorage.setItem("inCartTickets", JSON.stringify(inCartTickets))
                    setCurrentOrderId(resp.orderId); // 🟢 NEW
                    setIsPaymentModalOpen(true);
                    try {
                        // Extract address, amount, and payload from paymentLink messages
                        // @ts-expect-error: Ignore TypeScript error for this line
                        const { messages } = resp.paymentLink;


                        if (messages && messages.length > 0) {
                            const { address, amount, payload } = messages[0];

                            // Build SendTransactionRequest
                            const tx: SendTransactionRequest = {
                                validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes validity
                                network: CHAIN.MAINNET,  // or CHAIN.TESTNET
                                messages: [
                                    { address, amount, payload }
                                ]
                            }

                            // 2. Ask wallet to send transaction
                            const result = await tonConnectUI.sendTransaction(tx);
                            // 3. Wallet returns transaction info
                            const txHash = result?.boc ?? null; // `boc` is raw transaction body
                            if (txHash) {
                                localStorage.setItem("status", "paid")
                                runVerification("paid")
                                setInCartTickets(0)
                            } else {
                                localStorage.setItem("status", "failed")
                                runVerification("failed")
                                setInCartTickets(0)
                            }
                        } else {
                            setError("Invalid payment link details.");
                        }
                    } catch (walletErr) {
                        console.error(walletErr);
                        setError("Wallet rejected or failed.");
                    }
                } else {
                    setError("Could not start TON payment.");
                }

                return;
            }

            // 🟡 Flow for Stars (unchanged)
            if (method === "stars") {
                const resp = await buyTickets(userInfo!.telegramId, "stars", inCartTickets)
                if (resp.paymentLink) {
                    localStorage.removeItem("orderId")
                    localStorage.removeItem("paymentLink")
                    localStorage.removeItem("status")
                    localStorage.removeItem("inCartTickets")

                    WebApp.openInvoice(resp.paymentLink, (status) => {
                        if (status === "paid") {
                            setMessage("Payment was successful!")
                            updateYellowTickets(inCartTickets)
                            setInCartTickets(0)
                        }
                        else {
                            setError("Payment failed.")
                            setInCartTickets(0)
                        }
                    })
                } else {
                    setError("Network error.")
                }
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                if (err.status === 500) {
                    setError("Error processing ticket purchase")
                }
                else if (err.status === 400) {
                    setError("Some values seem incorrect. Please check and try again.");
                }
                else {
                    setError("Failed to start payment")
                }
            }
        }
    }

    return (
        <div className="bg-gradient-to-b from-blue-900 to-purple-700 size-full overflow-hidden flex flex-col items-center pb-20 pt-10 relative">
            {/* Tickets overview */}
            <div className="h-72 w-full flex flex-col items-center">
                <div className="w-full h-20 flex flex-row items-center justify-between px-2">
                    <button className="w-fit flex flex-row items-center justify-center pr-2 py-1 rounded-md m-1 backdrop-blur-md">
                        <Image
                            src="/images/black-ticket.png"
                            alt="golden ticket"
                            width={100}
                            height={60}
                            className=""
                        />

                        <p className="text-xl font-bold bg-gradient-to-r from-gray-300 via-white to-gray-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                            {refsCount.toString().length > 5
                                ? Intl.NumberFormat("en", { notation: "compact" }).format(refsCount)
                                : refsCount}
                        </p>
                    </button>

                    <div className="w-fit flex flex-row items-center justify-center pr-2 py-1 rounded-md m-1 backdrop-blur-md">
                        <Image
                            src="/images/golden-ticket.png"
                            alt="golden ticket"
                            width={100}
                            height={60}
                            className=""
                        />

                        <p className="text-xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                            {storedTickets.toString().length > 5
                                ? Intl.NumberFormat("en", { notation: "compact" }).format(storedTickets)
                                : storedTickets}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => handleTicketIncrement()}
                    className="h-72 w-11/12 mt-6 relative cursor-pointer"
                >
                    {/* Ticket Image */}
                    <Image
                        src="/images/big-golden-ticket.png"
                        alt="golden ticket"
                        fill
                        className="object-contain drop-shadow-[0_0_20px_rgba(250,204,21,1)]"
                    />

                    {/* Overlay Ticket Count */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                            {availableGoldenTickets.toString().length > 6
                                ? Intl.NumberFormat("en", { notation: "compact" }).format(availableGoldenTickets)
                                : availableGoldenTickets}
                        </p>
                    </div>
                </button>
            </div>


            {/* Cart + payment */}
            <div className="w-full h-fit flex flex-col items-center gap-4 mt-8">
                {/* Row above: ticket amount */}
                <div className="h-12 min-w-20 px-4 flex items-center justify-center rounded-full bg-gray-800/50 backdrop-blur-md border border-slate-700">
                    <input
                        type="number"
                        value={inCartTickets}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10)
                            if (!isNaN(value)) {
                                setInCartTickets(Math.min(value, 9999))
                            } else {
                                setInCartTickets(0)
                            }
                        }}
                        min={0}
                        max={9999}
                        className="text-2xl text-white bg-transparent text-center outline-none w-full"
                    />
                </div>

                {/* Main row */}
                <div className="w-fit flex flex-row items-center justify-between px-2 py-1 gap-2">
                    {/* Minus */}
                    <button
                        onClick={handleTicketDecrement}
                        className="size-12 flex items-center justify-center text-3xl text-white font-semibold bg-gray-800 border border-slate-500 rounded-full"
                    >
                        <BiMinus />
                    </button>

                    {/* Payment icons */}
                    <div className="flex flex-row items-center justify-center gap-2 mx-2">
                        <Image
                            src="/images/tel-star.png"
                            alt="telegram star"
                            width={60}
                            height={60}
                            className="cursor-pointer rounded-xl bg-gray-800 border border-yellow-500"
                            onClick={() => handleBuy("stars")}
                        />
                        <Image
                            src="/images/ton.png"
                            alt="ton coin"
                            width={60}
                            height={60}
                            className="cursor-pointer rounded-xl bg-gray-800 border border-blue-500 p-2"
                            onClick={() => handleBuy("ton")}
                        />
                    </div>

                    {/* Plus */}
                    <button
                        onClick={handleTicketIncrement}
                        className="size-12 flex items-center justify-center text-3xl text-white font-semibold bg-gray-800 border border-slate-500 rounded-full"
                    >
                        <BiPlus />
                    </button>
                </div>

                <div className="size-fit">
                    {
                        tonWalletAddress ? (
                            <div className="w-full h-fit flex flex-col items-center justify-center gap-3">
                                <button
                                    onClick={handleWalletAction}
                                    className="bg-red-500 text-white text-md font-bold py-2 px-4 rounded-md"
                                >
                                    {isLoading ? 'Loading...' : 'Disconnect Wallet'}
                                </button>
                                <p className="text-gray-400">Connected {formatAddress(tonWalletAddress)}</p>
                            </div>
                        ) : (
                            <button
                                onClick={handleWalletAction}
                                className="bg-blue-500 text-white text-md font-bold py-2 px-4 rounded-md"
                            >
                                {isLoading ? 'Loading...' : 'Connect TON Wallet'}
                            </button>
                        )
                    }
                </div>
            </div>
            <AnimatePresence>
                {isPaymentModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl text-center"
                        >
                            <h2 className="text-xl font-bold text-gray-800 mb-4">TON Payment Status</h2>
                            <p className="text-gray-600 mb-6">
                                Order ID: <span className="font-mono text-black">{currentOrderId}</span>
                                <br />
                                Please check the order status by clicking the <b>Check Status</b> button. <br />
                                If you tried multiple times and it didn’t succeed, please contact support for a refund.
                            </p>

                            {/* Note section */}
                            <p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                                ⚠️ TON transactions may take some time. Please check every 5 seconds until you see a
                                successful message.
                            </p>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => runVerification("paid")}
                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Check Status
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error & success messages */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[600px] h-12 flex items-center justify-center bg-red-500 text-white text-xl z-50"
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
                        className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[600px] h-12 flex items-center justify-center bg-green-500 text-white text-xl z-50"
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MainTab
