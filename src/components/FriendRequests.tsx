'use client'

import { Check, UserPlus, X } from 'lucide-react'
import { FC, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface FriendRequestsProps { 
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({
    incomingFriendRequests,
    sessionId
}) => {
    const router = useRouter();
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    )

    const acceptFriend = async(senderId: string) =>{
        await axios.post('/api/friends/accept', {id: senderId});

        setFriendRequests((prev)=>prev.filter((request)=>request.senderId !== senderId));

        router.refresh()
    }

    const denyFriend = async(senderId: string) =>{
        await axios.post('/api/friends/deny', {id: senderId});

        setFriendRequests((prev)=>prev.filter((request)=>request.senderId !== senderId));

        router.refresh();
    }
  
    return(
        <>
        {friendRequests.length === 0 ? (
            <p className='text-sm text-zinc-500'>Nothing to show here...</p>
        ) : (
            friendRequests.map((request)=>(
                <div 
                key={request.senderId}
                className='flex gap-4 items-center'
                >
                    <UserPlus className='text-black' />
                    <p className='font-medium text-lg'>{request.senderEmail}</p>
                    <button
                    aria-label='accept friend'
                    className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'
                    onClick={()=>acceptFriend(request?.senderId)}
                    >
                        <Check className='font-semibold text-white w-3/4 h-3/4'/>
                    </button>
                    
                    <button
                    aria-label='deny friend'
                    className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'
                    onClick={()=>denyFriend(request?.senderId)}
                    >
                        <X className='font-semibold text-white w-3/4 h-3/4'/>
                    </button>
                </div>
            ))
        )}
        </>
    )
}

export default FriendRequests