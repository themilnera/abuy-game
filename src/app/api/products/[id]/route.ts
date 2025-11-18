import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Context {
  params: {
    id: string;
  };
}

function seedToFloat(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return (hash % 1000) / 1000;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, category, lowest_price, highest_price, rarity, path, description } = body;

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
      [name, category, lowest_price, highest_price, rarity, path, description, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

//get product, not create
//needs to be a post so we can get the seed
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (isNaN(Number(id))) {
      const result = await pool.query("SELECT * FROM products WHERE name = $1", [id]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      if (result.rows.length > 1) {
        return NextResponse.json({ error: "Product not found, ambiguous name." }, { status: 404 });
      }
      return NextResponse.json({ product: result.rows[0] });
    }
    let seed;
    if (userId) {
      const userResult = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
      seed = userResult.rows[0].current_day_seed;
    }

    const result = await pool.query(
      `SELECT *, 
        ROUND(lowest_price + (highest_price - lowest_price) * 
  ((hashtext(id::text || $2) & 2147483647) / 2147483647.0)) AS current_price 
        FROM products 
        WHERE id = $1`,
      [id, seed]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product: result.rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

