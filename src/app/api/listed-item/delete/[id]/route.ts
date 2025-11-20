import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { ListedItem } from "@/interfaces";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const result = await pool.query(`
      DELETE FROM listed_items 
      WHERE id = $1`, [id]);
    
    return NextResponse.json(result);
  }
  catch(error){
    console.error("Failed to delete listed item: ", error);
    return NextResponse.json({error: "Failed to delete listed item by id"}, {status: 500})
  }
}

