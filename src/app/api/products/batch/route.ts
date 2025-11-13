import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, user_id } = body;
    const userResult = await pool.query(`SELECT current_day_seed FROM users WHERE user_id = $1`, [user_id]);
    const seed = userResult.rows[0].current_day_seed;

    const result = await pool.query(
      `
    SELECT *, 
    ROUND(lowest_price + (highest_price - lowest_price) * ((hashtext(id::text || $2) & 2147483647) / 2147483647.0)) AS current_price 
    FROM products
    WHERE id = ANY($1)
    `,
      [ids, seed]
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to retrieve batch of products: ", error);
  }
}
