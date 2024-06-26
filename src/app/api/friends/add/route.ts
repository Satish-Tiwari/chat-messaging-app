import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidtor } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import {z} from 'zod';

const uri = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
export async function POST(req:Request) {
    try{
        const body = await req.json();
        
        const {email:emailToAdd} = addFriendValidtor.parse(body.email);

        console.log(emailToAdd);
        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as any as string;
 
         if(!idToAdd){
             return new Response('This person does not exists.', {status:401})
         }

        const session = await getServerSession(authOptions);

        if(!session){
            return new Response('Unauthorized', {status:401})
        }

        if(idToAdd === session?.user.id){
            return new Response('You can not add yourself as a friend', {status: 400});
        }


        // check if user is already added
        const isAlreadyAdded = (await fetchRedis(
            'sismember', 
            `user:${idToAdd}:incoming_friend_requests`, 
            session.user.id
            )) as any as 0 | 1

        if(isAlreadyAdded){
            return new Response('Already added this user', {status: 400});
        }

        // check if user is already friend
        const isAlreadyFriend = (await fetchRedis(
            'sismember', 
            `user:${session.user.id}:friends`, 
            idToAdd
            )) as any as 0 | 1

        if(isAlreadyFriend){
            return new Response('Already friend', {status: 400});
        }
        

        // valid request, send friend request
        
        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)
         

       return new Response('OK');
    } catch(err){
        if(err instanceof z.ZodError){
            return new Response('Invalid request payload', {status: 422});
        }
    }
}