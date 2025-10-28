"use client"
import { Button, Textarea } from "@mantine/core";
import { useState } from "react";
import Sentiment from 'sentiment';
import sentiment from 'wink-sentiment';

interface results {
    sentimentScore: number;
    winkScore: number;
}

export default function TestDescription(){
    //SENTIMENT
    const sent = new Sentiment();


    const [descriptionText, setDescriptionText] = useState("");
    const [allResults, setAllResults] = useState<results | null>();

    const analyzeText = ()=>{
        if(descriptionText != ""){
            //SENTIMENT
            const options = {
                extras: {
                    'fuck': 0,
                }
            }
            const res = sent.analyze(descriptionText, options);
            const sentimentScore = res.score.toString();

            //WINK
            const winkScore = sentiment(descriptionText);
            console.log(winkScore);
            setAllResults({
                sentimentScore: Number(sentimentScore),
                winkScore: Number(winkScore.score)
            })
        } 
        else setAllResults(null);
    }

    return(<>
    
    <div className="flex flex-col items-center">
        
        <span className="flex flex-col items-center h-[400px] w-[70%]">
            <Textarea placeholder="Enter some text" w={600} value={descriptionText} onChange={(e)=>{setDescriptionText(e.target.value)}}></Textarea>
            <Button onClick={analyzeText} className="mt-3">Analyze</Button>
            { allResults ? (
                <>
                    <div>Sentiment: {allResults.sentimentScore}</div>
                    <div>Wink: {allResults.winkScore}</div>
                </>
            ) : (
                <></>
            )
            }
        </span>
    </div>
    
    
    </>);
}