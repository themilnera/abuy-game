import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { ListedItem } from "@/interfaces";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest, { params }: { params: { user_id: string } }) {
  try {
    const { user_id } = await params;
    const result = await pool.query(`
      SELECT * FROM listed_items 
      WHERE user_id = $1`, [user_id]);
    
    return NextResponse.json(result);
  }
  catch(error){
    console.error("Failed to get listed items: ", error);
    return NextResponse.json({error: "Failed to fetch listed items by user_id"}, {status: 500})
  }
}

