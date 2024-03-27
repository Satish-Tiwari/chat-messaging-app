import {FC} from 'react'
import Button from '@/components/ui/Button'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

interface pageProps {}

const page : FC<pageProps> = async ({})=>{
  
  const session = await getServerSession(authOptions);

  return <pre>{JSON.stringify(session)}</pre>
}

export default page;