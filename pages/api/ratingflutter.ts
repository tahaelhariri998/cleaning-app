// pages/api/rating.ts

import prisma from '../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface RatingRequestBody {
    name: string;
    email: string;
    customerNumber: string;
    rating: string;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    if (req.method === 'GET') {
        // Handle the GET method if needed (for fetching ratings or specific rating)
        try {
            const { email } = req.query;

            if (!email || typeof email !== 'string') {
                const ratings = await prisma.rating.findMany();
                return res.status(200).json(ratings);
                
            }

            // Fetch the ratings by email (if needed)
            const ratings = await prisma.rating.findMany({
                where: { email },
            });

            if (!ratings) {
                return res.status(404).json({ error: 'Ratings not found' } as ErrorResponse);
            }

            return res.status(200).json(ratings);
        } catch (error) {
            console.error('Failed to fetch ratings', error);
            return res.status(500).json({ error: 'Failed to fetch ratings' } as ErrorResponse);
        }
    } else if (req.method === 'POST') {
        try {
            const { name, email, customerNumber, rating }: RatingRequestBody = req.body;

            if (!name || !email || !customerNumber || rating === undefined) {
                return res.status(400).json({ error: 'Name, email, customer number, and rating are required' } as ErrorResponse);
            }
            const parsedRating = rating;
            // Insert a new rating entry into the Rating table
            const newRating = await prisma.rating.create({
                data: {
                    name,
                    email,
                    customerNumber,
                    rating: parseInt(parsedRating),
                },
            });

            return res.status(200).json(newRating);
        } catch (error) {
            console.error('Failed to create rating', error);
            return res.status(500).json({ error: 'Failed to create rating' } as ErrorResponse);
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' } as ErrorResponse);
    }
}
