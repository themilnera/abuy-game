import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, query, page } = body;

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

    const result = await pool.query(
      `SELECT * FROM products
        ${whereLine}
        ORDER BY rarity DESC
        LIMIT 12 OFFSET (($1-1) * 12)`,
      [page, ...paramArray]
    );
    const count = await pool.query(
      `SELECT COUNT(*) FROM products
        ${countLine}
        `,
      paramArray
    );

    if (result.rows.length === 0) {
      return NextResponse.json([]);
    }
    const results = {
      products: result.rows,
      count: count.rows[0].count,
    };
    return NextResponse.json(results);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
