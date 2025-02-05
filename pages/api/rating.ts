// pages/api/rating.ts

import prisma from '../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

interface Rating {
    id: number; // Assuming your Rating model has an 'id' field
    name: string;
    email: string;
    customerNumber: string;
    rating: number;
}

interface RatingRequestBody {
    name: string;
    email: string;
    customerNumber: string;
    rating: number;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Rating | Rating[] | ErrorResponse> // Specify possible response types
): Promise<void | NextApiResponse<Rating | Rating[] | ErrorResponse>> {
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

            if (!ratings || ratings.length === 0) {  //Check if the result is empty
                return res.status(404).json({ error: 'Ratings not found' });
            }

            return res.status(200).json(ratings);
        } catch (error) {
            console.error('Failed to fetch ratings', error);
            return res.status(500).json({ error: 'Failed to fetch ratings' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, email, customerNumber, rating }: RatingRequestBody = req.body;

            if (!name || !email || !customerNumber || rating === undefined) {
                return res.status(400).json({ error: 'Name, email, customer number, and rating are required' });
            }

            // Insert a new rating entry into the Rating table
            const newRating = await prisma.rating.create({
                data: {
                    name,
                    email,
                    customerNumber,
                    rating,
                },
            });

            return res.status(200).json(newRating);
        } catch (error) {
            console.error('Failed to create rating', error);
            return res.status(500).json({ error: 'Failed to create rating' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { id } = req.query;
            const { name, email, customerNumber, rating }: RatingRequestBody = req.body;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'ID is required for updating' });
            }

            if (!name || !email || !customerNumber || rating === undefined) {
                return res.status(400).json({ error: 'Name, email, customer number, and rating are required' });
            }


            const updatedRating = await prisma.rating.update({
                where: {
                    id: parseInt(id as string, 10),
                },
                data: {
                    name,
                    email,
                    customerNumber,
                    rating,
                },
            });

            return res.status(200).json(updatedRating);
        } catch (error) {
            console.error('Failed to update rating', error);
            return res.status(500).json({ error: 'Failed to update rating' });
        }
    }
     else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'ID is required for deletion' });
            }

            await prisma.rating.delete({
                where: {
                    id: parseInt(id as string, 10),
                },
            });

            return res.status(204).end(); // No content, successful deletion
        } catch (error) {
            console.error('Failed to delete rating', error);
            return res.status(500).json({ error: 'Failed to delete rating' });
        }
    }
    else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}