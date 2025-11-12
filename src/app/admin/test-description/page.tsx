"use client";
import { Button, Textarea } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

const strip = (word: string): string => {
  return word.replace(/[^\w\s]/g, "");
};

interface Score {
  literate: number;
  brash: number;
  casual: number;
  smooth: number;
  professional: number;
  warm: number;
  grandiose: number;
  cringe: number;
  insane: number;
}

export default function TestDescription() {
  const [score, setScore] = useState<Score>({
    literate: 0,
    brash: 0,
    casual: 0,
    smooth: 0,
    professional: 0,
    warm: 0,
    grandiose: 0,
    cringe: 0,
    insane: 0,
  });
  const [descriptionText, setDescriptionText] = useState("");
  const [allResults, setAllResults] = useState<string[]>();
  const [finishedScoring, setFinishedScoring] = useState(false);
  const [analyzeButtonEnabled, setAnalyzeButtonEnabled] = useState(true);

  const analyzeText = async () => {
    setFinishedScoring(false);
    setAnalyzeButtonEnabled(false);
    if (strip(descriptionText.trim()) !== "") {
      try {
        const words = strip(descriptionText.toLowerCase())
          .split(/\s+/)
          .filter((word) => word.length > 0);
        const checkWords = words.map(async (word) => {
          try {
            const result = await axios.post("/api/token-type/check", {
              token: word,
            });
            if (result?.data?.[0]?.types) {
              return result.data[0].types;
            }
            return "neutral";
          } catch (error) {
            console.error("Error checking token for word: ", error);
          }
        });
        const types = await Promise.all(checkWords);
        const valid: string[] = types.filter((type) => type !== null);
        setAllResults(valid);
      } catch (error) {
        console.error("Failed to check types: ", error);
      }
    } else {
      setAnalyzeButtonEnabled(true);
    }
  };
  const scoreResults = async () => {
    let newScore: Score = {
      literate: 0,
      brash: 0,
      casual: 0,
      smooth: 0,
      professional: 0,
      warm: 0,
      grandiose: 0,
      cringe: 0,
      insane: 0,
    };

    if (allResults && allResults.length > 0) {
      allResults.forEach((tokens) => {
        const terms = tokens.split(" ");
        for (let i = 0; i < terms.length; i++) {
          let d = i + 1;
          if (terms[i] === "literate") {
            newScore.literate += Math.ceil(2 / d);
          } else if (terms[i] === "professional") {
            newScore.professional += Math.ceil(2 / d);
          } else if (terms[i] === "casual") {
            newScore.casual += Math.ceil(3 / d);
          } else if (terms[i] === "grandiose") {
            newScore.grandiose += Math.ceil(2 / d);
          } else if (terms[i] === "smooth") {
            newScore.smooth += Math.ceil(4 / d);
          } else if (terms[i] === "brash") {
            newScore.brash += Math.ceil(4 / d);
          } else if (terms[i] === "warm") {
            newScore.warm += Math.ceil(4 / d);
          } else if (terms[i] === "cringe") {
            newScore.cringe += Math.ceil(4 / d);
          } else if (terms[i] == "insane") {
            newScore.insane += Math.ceil(6 / d);
          }
        }
      });
      setScore(newScore);
      setFinishedScoring(true);
      setAnalyzeButtonEnabled(true);
    }
  };

  useEffect(() => {
    scoreResults();
  }, [allResults]);

  return (
    <>
      <div className="flex flex-col items-center mt-50">
        <span className="mb-5 font-semibold text-xl">Description Analyzer</span>

        <span className="flex flex-col items-center h-[400px] w-[70%]">
          <Textarea
            placeholder="Enter some text"
            w={400}
            rows={5}
            size="md"
            radius={"md"}
            value={descriptionText}
            onChange={(e) => {
              setDescriptionText(e.target.value);
            }}></Textarea>
          {analyzeButtonEnabled ? (
            <Button onClick={analyzeText} size="md" className="mt-5 mb-5 bg-amber-800!">
              Analyze
            </Button>
          ) : (
            <div className="loader mt-5"></div>
          )}
          {finishedScoring ? (
            <div className="flex flex-wrap justify-center w-130 gap-3 mt-5">
              {score.brash > 0 ? <div className="bg-red-400 p-5">Brash: {score.brash}</div> : <></>}
              {score.casual > 0 ? <div className="bg-blue-400 p-5">Casual: {score.casual}</div> : <></>}
              {score.warm > 0 ? <div className="bg-orange-400 p-5">Warm: {score.warm}</div> : <></>}
              {score.smooth > 0 ? <div className="bg-pink-400 p-5">Smooth: {score.smooth}</div> : <></>}
              {score.cringe > 0 ? <div className="bg-purple-400 p-5">Cringe: {score.cringe}</div> : <></>}
              {score.grandiose > 0 ? <div className="bg-emerald-400 p-5">Grandiose: {score.grandiose}</div> : <></>}
              {score.insane > 0 ? <div className="bg-indigo-500 p-5">Insane: {score.insane}</div> : <></>}
              {score.literate > 0 ? <div className="bg-green-600 p-5">Literate: {score.literate}</div> : <></>}
              {score.professional > 0 ? <div className="bg-gray-400 p-5">Professional: {score.professional}</div> : <></>}
              {/* Neutral */}
              {score.brash === 0 &&
              score.warm === 0 &&
              score.smooth === 0 &&
              score.cringe === 0 &&
              score.grandiose === 0 &&
              score.casual === 0 &&
              score.insane === 0 &&
              score.literate === 0 &&
              score.professional === 0 ? (
                <div className="bg-teal-400 p-5">NEUTRAL</div>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
        </span>
      </div>
    </>
  );
}
