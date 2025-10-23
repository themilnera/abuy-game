import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, query } = body;

    if (!category && !query) {
      return NextResponse.json([]);
    }

    if (!category) {
      const result = await pool.query(
        `SELECT * FROM products
        WHERE name ILIKE $1`,
        [`%${query}%`]
      );
      if (result.rows.length === 0) {
        return NextResponse.json([]);
      }
      return NextResponse.json(result.rows);
    } else {
      const result = await pool.query(
        `SELECT * FROM products
        WHERE category = $2
        AND name ILIKE $1`,
        [`%${query}%`, category]
      );
      if (result.rows.length === 0) {
        return NextResponse.json([]);
      }
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
