import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
export async function POST(req: Request) {
    try{
        const body = await req.json();
        const {id: idToAdd} = z.object({id: z.string()}).parse(body);
        const session = await getServerSession(authOptions);
        if(!session){
            return new Response('Unauthorized', {status: 401});
        }

        // verify both users not already friend
        const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd);

        if(isAlreadyFriends){
            return new Response('Already friends', {status: 400})
        }

        const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd);

        if(!hasFriendRequest){
            return new Response('No friend requests', {status: 400});
        }

        await db.sadd(`user:${session.user.id}:friends`, idToAdd);
        await db.sadd(`user:${idToAdd}:friends`, session.user.id);

        // await db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id);

        await db.srem(`srem:${session.user.id}:incoming_friend_requests`, idToAdd);

        return new Response('OK');
    } catch(err){
        console.log(err);

        if(err instanceof z.ZodError){
            return new Response('Invalid request payload', {status:402});
        }

        return new Response('Invalid request', {status:400});
    }
}