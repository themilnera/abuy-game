import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { ListedItem } from "@/interfaces";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listedItem }: { listedItem: ListedItem } = body;
    const result = await pool.query(
      `
        INSERT INTO 
        listed_items (product_name, user_id, product_id, description, price, quantity, gameday_listed, path) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
      [listedItem.product_name, listedItem.user_id, listedItem.product_id, listedItem.description, listedItem.price, listedItem.quantity, listedItem.gameday_listed, listedItem.path]
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to post listed_item to the db: ", error);
    return NextResponse.json({ error: "Failed to create listed item" }, { status: 500 });
  }
}
