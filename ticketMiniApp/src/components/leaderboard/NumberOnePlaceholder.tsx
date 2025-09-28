import Image from 'next/image'
import React from 'react'
import { BiUser } from 'react-icons/bi'
import { FaMedal } from 'react-icons/fa'
import StickerPlayer from '../StickerPlayer'

type Props = {
    username: string
    profilePic?: string
    tickets: number
    totalTickets: number
    refs: number
    type: string
    prize?: string
}

const NumberOnePlaceholder = ({ username, profilePic, tickets, totalTickets, refs, type, prize }: Props) => {
    return (
        <div
            className='size-full flex flex-col items-center relative'
        >
            <div
                className='min-w-32 min-h-32 size-32 flex items-center justify-center rounded-full bg-white border-2 shadow-md shadow-yellow-300 border-yellow-400 relative'
            >
                {
                    profilePic ?
                        <Image
                            src={profilePic}
                            alt="profile picture"
                            fill
                            className="object-cover rounded-full"
                        />
                        :
                        <div className='size-16 rounded-full flex items-center justify-center'>
                            <BiUser size={56} />
                        </div>
                }
                <div
                    className='size-8 flex items-center justify-center rounded-full absolute bottom-5 left-0 -mb-6 bg-amber-300'
                >

                    <p className='text-3xl font-bold text-white'>1</p>
                </div>
                <div
                    className='size-10 flex items-center justify-center rounded-full absolute bottom-0 -mb-6'
                >

                    <FaMedal className='text-6xl text-yellow-300' />
                </div>
                {
                    type === "live" &&
                    <div
                        className="size-12 flex items-center justify-center mx-2 absolute bottom-5 right-0 
             -mb-8 -mr-4 p-2 rounded-md backdrop-blur-md bg-gradient-to-br from-white/20 via-transparent to-transparent"
                    >
                        {prize && (
                            <StickerPlayer src={prize} />
                        )}
                    </div>
                }
            </div>

            <div
                className='w-full h-full flex flex-col mt-6 items-center justify-center'
            >
                <div className='w-fit h-fit'>
                    <p className='text-4xl  text-white font-bold'>{username}</p>
                </div>

                {
                    type === 'whales' ?
                        <div className='w-fit h-fit flex flex-row items-center gap-1'>
                            <p className='text-lg font-semibold text-yellow-400'>{totalTickets}</p>
                            <p className='text-lg text-white font-semibold'>tickets</p>
                        </div>
                        :
                        type === 'referrals' ?
                            <div className='w-fit h-fit flex flex-row items-center gap-1'>
                                <p className='text-lg font-semibold text-blue-400'>{refs}</p>
                                <p className='text-lg text-white font-semibold'>referrals</p>
                            </div>
                            :
                            <div className='w-fit h-fit flex flex-row items-center gap-1'>
                                <p className='text-lg font-semibold text-yellow-400'>{tickets}</p>
                                <p className='text-lg text-white font-semibold'>tickets</p>
                            </div>
                }

            </div>
        </div>
    )
}

export default NumberOnePlaceholder