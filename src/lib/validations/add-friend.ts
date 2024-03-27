import {z} from 'zod';

export const addFriendValidtor = z.object({
    email: z.string().email()
})

