import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import { db } from '@/lib/db';
import { fetchRedis } from '@/helpers/redis';
import { messageArrayValidator } from '@/lib/validations/message';

interface pageProps {
  params: {
    chatId: string
  }
}

async function getChatMessages(chatId: string){
  try{
    const results: string[] = await fetchRedis(
      'zrange',
      `chat:${chatId}:message`,
      0,
      -1 
    ) as any as string[];

    const dbMessages = results.map((message)=>JSON.parse(message) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch(err){
    notFound();
  }
}

const page: FC<pageProps> = async ({params}: pageProps) => {
  const {chatId} = params;
  const session = await getServerSession(authOptions);

  if(!session){
    notFound();
  }

  const {user} = session;

  const [userId1, userId2] = chatId.split('--');

  if(user.id !== userId1 && user.id !== userId2){
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2: userId1;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as any as User;
  const initialMessages = await getChatMessages(chatId);

  return <div>{params.chatId}</div>
}

export default page