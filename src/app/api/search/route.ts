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

    if (!category && !query) {
      return NextResponse.json([]);
    }


    if (!category) {
      const result = await pool.query(
        `SELECT * FROM products
        WHERE name ILIKE $1
        ORDER BY rarity DESC
        LIMIT 12 OFFSET (($2-1) * 12)`,
        [`%${query}%`, page]
      );
      const count = await pool.query(
        `SELECT COUNT(*) FROM products
        WHERE name ILIKE $1
        `
        , [`%${query}%`]
      );
      if (result.rows.length === 0) {
        return NextResponse.json([]);
      }
      const results = {
        products: result.rows,
        count: count.rows[0].count
      }
      return NextResponse.json(results);
    } 
    
    
    else {
      const result = await pool.query(
        `SELECT * FROM products
        WHERE category ILIKE $2
        AND name ILIKE $1
        ORDER BY rarity DESC
        LIMIT 12 OFFSET (($3-1) * 12)
        `,
        [`%${query}%`, category, page]
      );
      const count = await pool.query(
        `SELECT COUNT(*) FROM products
        WHERE category ILIKE $2
        AND name ILIKE $1
        
        `,
        [`%${query}%`, category]
      );
      if (result.rows.length === 0) {
        return NextResponse.json([]);
      }
      const results = {
        products: result.rows,
        count: count.rows[0].count
      }
      return NextResponse.json(results);
    }


  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
