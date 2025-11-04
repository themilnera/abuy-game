import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest){
    try {
        const body = await request.json();
        const { token } = body; 
        const result = await pool.query(`
            SELECT * FROM token_types 
            WHERE token ILIKE $1 
            ORDER BY LENGTH(token) ASC 
            LIMIT 1`,[`${token}%`]);
        if(result.rows.length != 0){
            console.log(result.rows);
            return NextResponse.json(result.rows);
        }
        else{
            return NextResponse.json({ rows:[{types:"neutral"}]})
        }
    } catch (error) {
        console.error("Failed to check token type: ", error);
    }
}