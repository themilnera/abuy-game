"use client"
import { Button, Textarea } from "@mantine/core";
import { useState } from "react";
import Sentiment from 'sentiment';
import sentiment from 'wink-sentiment';


export default function TestDescription(){
    //SENTIMENT
    const sent = new Sentiment();


    const [descriptionText, setDescriptionText] = useState("");
    const [allResults, setAllResults] = useState();

    const analyzeText = ()=>{
        if(descriptionText.trim() !== ""){
            
        }
    }

    return(<>
    
    <div className="flex flex-col items-center">
        
        <span className="flex flex-col items-center h-[400px] w-[70%]">
            <Textarea placeholder="Enter some text" w={600} value={descriptionText} onChange={(e)=>{setDescriptionText(e.target.value)}}></Textarea>
            <Button onClick={analyzeText} className="mt-3">Analyze</Button>
            { allResults ? (
                <>
                    <div>:</div>
                    <div></div>
                </>
            ) : (
                <></>
            )
            }
        </span>
    </div>
    
    
    </>);
}