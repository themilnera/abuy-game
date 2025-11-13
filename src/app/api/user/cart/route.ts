import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, cart_item_id } = body;

    //We're trying to concatenate the cart items into a string here,
    //cart_items || $2 works if there's already a string there, but it's null by default
    //COALESCE is just here to make sure there's a string if it's null
    const result = await pool.query(
      `
      UPDATE users
      SET cart_items = COALESCE(cart_items, '') || $2
      WHERE user_id = $1
      RETURNING *
      `,
      [user_id, ` ${cart_item_id}`]
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
     `SELECT cart_items FROM users WHERE user_id = $1`,[user_id] 
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Post failed: ", error);
  }
}
