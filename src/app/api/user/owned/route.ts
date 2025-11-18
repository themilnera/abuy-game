import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, owned_item_ids } = body;
    const result = await pool.query(
      `
      UPDATE users
      SET owned_items = COALESCE(bid_items, '') || $2
      WHERE user_id = $1
      RETURNING *
      `,
      [user_id, ` ${owned_item_ids}`]
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update user database object: ", error);
  }
}

export async function POST(request: NextRequest){
  try {
    const body = await request.json();
    const { user_id } = body;
    const result = await pool.query(
     `SELECT owned_items FROM users WHERE user_id = $1`,[user_id] 
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Post failed: ", error);
  }
}
