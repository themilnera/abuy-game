import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY RANDOM() LIMIT 1"
    );

    return NextResponse.json( result );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch random product" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;

    const result = await pool.query(
      "SELECT * FROM products ORDER BY RANDOM() LIMIT $1", [amount]
    );

    return NextResponse.json( result );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch random product" },
      { status: 500 }
    );
  }
}