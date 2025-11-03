import { NextRequest, NextResponse } from 'next/server';
import { Pool } from "pg";
import seedrandom from 'seedrandom';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest){
    const seed = generateSeed();
    try {
        //query for count of each category
        //random amount of items picked between 1/3 of total - all
        //random chance of rarity for each item
        //pick randomly (with offset and limit) an item based on the rarity
        //if more than one of the same item come back, that's quantity
        //or if item rarity is < 3, they get a random quantity by default
        
        //assign to sellers?
        //return products{}, seed
    } catch (error) {
        
    }
    return NextResponse.json({ result: "success", seed: seed });
}

function generateDayProducts(seed: string){
    const rng = seedrandom(seed);
    //use rng instead of Math.random()

}

function generateSeed(){
    let finalResults = [];
    const possibleCharacters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
    const length = Math.floor((Math.random()*15)) + 5;
    for(let i = 0; i < length; i++){
        let choice = Math.floor(Math.random()*possibleCharacters.length);
        finalResults.push(possibleCharacters[choice]);
    } 
    return finalResults.join('');
}