import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      category,
      lowest_price,
      highest_price,
      rarity,
      path,
      description,
    } = body;

    const result = await pool.query(
      `UPDATE products
            SET name = $1,
            category = $2,
            lowest_price = $3,
            highest_price = $4,
            rarity = $5,
            path = $6,
            description = $7

            WHERE id = $8 
            RETURNING *`,
      [
        name,
        category,
        lowest_price,
        highest_price,
        rarity,
        path,
        description,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    if (isNaN(Number(id))) {
      const result = await pool.query(
        "SELECT * FROM products WHERE name = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      if (result.rows.length > 1) {
        return NextResponse.json(
          { error: "Product not found, ambiguous name." },
          { status: 404 }
        );
      }
      return NextResponse.json({ product: result.rows[0] });
    }

    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product: result.rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
