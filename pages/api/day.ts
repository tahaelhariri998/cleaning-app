// pages/api/day.ts  (Assuming you renamed it to /api/day)

import prisma from '../../lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const reports = await prisma.daylyReports.findMany();
            return res.status(200).json(reports);
        } catch (error) {
            console.error('Failed to fetch reports', error);
            return res.status(500).json({ error: 'Failed to fetch reports' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, email, compleated, createdAt } = req.body;  // Add createdAt to the destructured variables

            if (!name || !email || compleated === undefined || !createdAt) {  // Validate createdAt also
                return res.status(400).json({ error: 'Name, email, completed status, and createdAt are required' });
            }

            const newReport = await prisma.daylyReports.create({
                data: {
                    name,
                    email,
                    compleated,
                    createdAt: new Date(createdAt),  // Parse the date string
                },
            });

            return res.status(201).json(newReport);
        } catch (error) {
            console.error('Failed to create report', error);
            return res.status(500).json({ error: 'Failed to create report' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}