import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const result = await pool.query(`DELETE FROM users WHERE user_id = $1`, [id]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to delete user: ", error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { seller_name, seller_image_url } = body;
    const result = await pool.query(
      `
      UPDATE users
      SET seller_name = $2, seller_image_url = $3
      WHERE user_id = $1
      RETURNING *
      `,
      [id, seller_name, seller_image_url]
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update user database object: ", error);
  }
}
