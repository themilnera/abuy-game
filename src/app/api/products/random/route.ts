import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function seedToFloat(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return (hash % 1000) / 1000;
}

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY RANDOM() LIMIT 1");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch random product" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, userId } = body;

    const userResult = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);

    let result;
    if (userResult.rows.length == 0) {
      console.log("No user id found");
      result = await pool.query("SELECT * FROM products ORDER BY RANDOM() LIMIT $1", [amount]);
    } else {
      console.log("User id found");
      const seed = userResult.rows[0].current_day_seed;
      await pool.query(`SELECT setseed($1)`, [seedToFloat(seed)]);
      result = await pool.query(
        `SELECT *, 
        ROUND(lowest_price + (highest_price - lowest_price) * 
  ((hashtext(id::text || $2) & 2147483647) / 2147483647.0)) AS current_price
        FROM products 
        ORDER BY RANDOM() 
        LIMIT $1`,
        [amount, seed]
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch random product" }, { status: 500 });
  }
}
