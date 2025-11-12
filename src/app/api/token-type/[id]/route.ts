import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const result = await pool.query(`SELECT * FROM token_types WHERE id = $1`, [id]);
    return NextResponse.json({ result: result });
  } catch (error) {
    console.log("Database error: ", error);
    return NextResponse.json({ error: "Failed to fetch token-type" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const { token, types } = body;
    console.log(types);
    const result = await pool.query(
      `
        UPDATE token_types 
        SET token = $2,
        types = $3  
        WHERE id = $1
        RETURNING *`,
      [id, token, types ? types : "neutral"]
    );
    return NextResponse.json({ result: result, status: "Success" });
  } catch (error) {
    console.log("Database error: ", error);
    return NextResponse.json({ error: "Failed to update token-type" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
}
