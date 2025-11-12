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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, query, page, userId } = body;

    let whereLine = " ";
    let countLine = " ";
    let paramArray: (string | number)[] = [];

    if (!query && !category) {
      whereLine = " ";
      countLine = " ";
      paramArray = [];
    } else if (query && !category) {
      whereLine = " WHERE name ILIKE $2 ";
      countLine = " WHERE name ILIKE $1 ";
      paramArray = [`%${query}%`];
    } else if (category && !query) {
      whereLine = " WHERE category ILIKE $2 ";
      countLine = " WHERE category ILIKE $1 ";
      paramArray = [`%${category}%`];
    } else {
      whereLine = " WHERE name ILIKE $2 AND category ILIKE $3 ";
      countLine = " WHERE name ILIKE $1 AND category ILIKE $2 ";
      paramArray = [`%${query}%`, `%${category}%`];
    }
    const userResult = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);

    let result, count;
    if (userResult.rows.length === 0) {
      result = await pool.query(
        `SELECT * FROM products
          ${whereLine}
          ORDER BY rarity DESC
          LIMIT 12 OFFSET (($1-1) * 12)`,
        [page, ...paramArray]
      );
      count = await pool.query(
        `SELECT COUNT(*) FROM products
          ${countLine}
          `,
        paramArray
      );

      if (result.rows.length === 0) {
        return NextResponse.json([]);
      }
    } else {
      const seed = userResult.rows[0].current_day_seed;
      const seedString = `$${paramArray.length + 2}`;
      result = await pool.query(
        `SELECT *, ROUND(lowest_price + (highest_price - lowest_price) * ((hashtext(id::text || ${seedString}) & 2147483647) / 2147483647.0)) AS current_price 
          FROM products
          ${whereLine}
          ORDER BY rarity DESC
          LIMIT 12 OFFSET (($1-1) * 12)`,
        [page, ...paramArray, seed]
      );
      count = await pool.query(
        `SELECT COUNT(*) FROM products
          ${countLine}
          `,
        paramArray
      );

      if (result.rows.length === 0) {
        return NextResponse.json([]);
      }
    }
    const results = {
      products: result.rows,
      count: count.rows[0].count,
    };
    return NextResponse.json(results);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
