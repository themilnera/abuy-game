import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, bid_items } = body;

    const result = await pool.query(
      `
      UPDATE users
      SET bid_items = $2
      WHERE user_id = $1
      RETURNING *
      `,
      [user_id, bid_items]
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update user database object: ", error);
  }