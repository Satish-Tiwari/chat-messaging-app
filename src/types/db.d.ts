interface User {
    name: string,
    email: string,
    image: string,
    id: string
}

interface Chat {
    id: string,
    message: Message[]
}

interface Message {
    id: string,
    senderId: string,
    receiverId: string,
    text: string,
    timestamp: number
}

interface FriendRequests{
    id: string,
    senderId: string,
    receiverId: string
}