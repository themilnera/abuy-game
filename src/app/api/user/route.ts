import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, seller_name, seller_image_url, current_day, money } = body;
  const current_day_seed = generateSeed();
  try {
    const result = await pool.query(
      `
            INSERT INTO users (user_id, seller_name, seller_image_url, current_day, current_day_seed, money)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
      [user_id, seller_name, seller_image_url, current_day, current_day_seed, money]
    );
    console.log("Inserted: ", result.rows);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to add user object to database: ", error);
  }
}

export async function PUT(request: NextRequest){
  const body = await request.json();
  const { user_id, current_day, current_day_seed, money } = body;
  try {
    const result = await pool.query(
      `UPDATE users
      SET current_day = $2,
      current_day_seed = $3,
      money = $4
      WHERE user_id = $1`
    ,[user_id, current_day, current_day_seed, money]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update user object: ", error);
  }
}

function generateSeed() {
  let finalResults = [];
  const possibleCharacters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  const length = Math.floor(Math.random() * 15) + 5;
  for (let i = 0; i < length; i++) {
    let choice = Math.floor(Math.random() * possibleCharacters.length);
    finalResults.push(possibleCharacters[choice]);
  }
  return finalResults.join("");
}
