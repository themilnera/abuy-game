import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


export async function POST(req: NextRequest){
    try {
        const body = await req.json();
        const { name, category, lowest_price, highest_price, rarity, path, description } = body;

        const result = await pool.query(
            `INSERT INTO products (name, category, lowest_price, highest_price, rarity, path, description) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [name, category, lowest_price, highest_price, rarity, path, description]
        );

        return NextResponse.json(
            { success: true, product: result.rows[0] },
            { status: 201 }
        );

    } catch (error) {
        console.error('Database error: ', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}