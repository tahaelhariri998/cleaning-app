// pages/api/user.ts

import prisma from '../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface UserRequestBody {
    name?: string;
    email: string;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    if (req.method === 'GET') {
        try {
            const { email } = req.query;

            if (!email || typeof email !== 'string') {
                return res.status(400).json({ error: 'Email is required' } as ErrorResponse);
            }

            // Fetch the user by email
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' } as ErrorResponse);
            }

            return res.status(200).json(user);
        } catch (error) {
            console.error('Failed to fetch user', error);
            return res.status(500).json({ error: 'Failed to fetch user' } as ErrorResponse);
        }
    } else if (req.method === 'POST') {
        try {
            const { name, email }: UserRequestBody = req.body;

            if (!name || !email) {
                return res.status(400).json({ error: 'Name and email are required' } as ErrorResponse);
            }

            // Create the new user
            const newUser = await prisma.user.create({
                data: { name, email },
            });

            return res.status(200).json(newUser);
        } catch (error) {
            console.error('Failed to create user', error);
            return res.status(500).json({ error: 'Failed to create user' } as ErrorResponse);
        }
    } else if (req.method === 'PUT') {
        try {
            const { name, email }: UserRequestBody = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' } as ErrorResponse);
            }

            // Update the user's name
            const updatedUser = await prisma.user.update({
                where: { email },
                data: { name },
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Failed to update user', error);
            return res.status(500).json({ error: 'Failed to update user' } as ErrorResponse);
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' } as ErrorResponse);
    }
}
