"use client";
import { TextInput, Checkbox, Stack, Button, Textarea } from "@mantine/core";
import { useState } from "react";
import axios from "axios";
//make a db table with the tokens, leave the type field blank
export default function KeywordConstructor() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loadId, setLoadId] = useState<number>();
  const [line, setLine] = useState(0);
  const [token, setToken] = useState<string>();
  const lastLine = 79999;
  const [data, setData] = useState<string[]>([]);

  const toggleType = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    }
  };

  const loadTokenType = async (id? : number) => {
    if (id) {
      try {
        const result = await axios.get(`/api/token-type/${id}`);
        const tkn = result.data.result.rows[0];
        setLine(tkn.id);
        setToken(tkn.token);
        setSelectedTypes(
          tkn.types.split(" ").filter((t: string) => t !== "neutral")
        );
        setLoadId(undefined);
      } catch (error) {
        console.error("Failed ot load token type: ", error);
      }
    }
  };

  const pushAndNextToken = async () => {
    try {
      const result = await axios.put(`/api/token-type/${line}`, {
        token: token,
        types: selectedTypes.join(" "),
      });
      if (line <= lastLine) {
        await loadTokenType(line + 1);
      }
    } catch (error) {
      console.error("Failed to push token to DB:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-[60%] flex flex-col items-center">
        <span className="flex gap-2 items-center! mb-10">
          <TextInput
            placeholder="id"
            w={100}
            value={!loadId ? "" : loadId.toString()}
            onChange={(e) => {
              setLoadId(Number(e.target.value));
            }}
          ></TextInput>
          <Button onClick={()=>{loadTokenType(loadId)}} className="bg-red-900!">
            Load
          </Button>
        </span>
        <TextInput
          contentEditable={false}
          label="Row ID"
          value={!line ? "" : line.toString()}
          onChange={(e) => {
            e.target.value = line.toString();
          }}
        ></TextInput>
        <TextInput
          label="Token"
          value={!token ? "" : token}
          onChange={(e) => setToken(e.target.value)}
        ></TextInput>
        <Stack className="mt-5 flex! flex-row!">
          <span className="flex flex-col gap-2">
            {/* <Checkbox
              onChange={(e) => toggleType("neutral", e.target.checked)}
              label="Neutral"
            /> 
            Maybe we don't need this, neutral means no other selection
            */}
            <Checkbox
              checked={selectedTypes.includes("literate")}
              onChange={(e) => toggleType("literate", e.target.checked)}
              label="Literate"
            />
            <Checkbox
              checked={selectedTypes.includes("casual")}
              onChange={(e) => toggleType("casual", e.target.checked)}
              label="Casual"
            />
            <Checkbox
              checked={selectedTypes.includes("professional")}
              onChange={(e) => toggleType("professional", e.target.checked)}
              label="Professional"
            />
            <Checkbox
              checked={selectedTypes.includes("grandiose")}
              onChange={(e) => toggleType("grandiose", e.target.checked)}
              label="Grandiose"
            />
          </span>
          <span className="flex flex-col gap-2">
            <Checkbox
              checked={selectedTypes.includes("brash")}
              onChange={(e) => toggleType("brash", e.target.checked)}
              label="Brash"
            />
            <Checkbox
              checked={selectedTypes.includes("smooth")}
              onChange={(e) => toggleType("smooth", e.target.checked)}
              label="Smooth"
            />
            <Checkbox
              checked={selectedTypes.includes("warm")}
              onChange={(e) => toggleType("warm", e.target.checked)}
              label="Warm"
            />
            <Checkbox
              checked={selectedTypes.includes("cringe")}
              onChange={(e) => toggleType("cringe", e.target.checked)}
              label="Cringe"
            />
            <Checkbox
              checked={selectedTypes.includes("insane")}
              onChange={(e) => toggleType("insane", e.target.checked)}
              label="Insane"
            />
          </span>
        </Stack>
        <Textarea
          className="mt-5"
          label="Types"
          value={!selectedTypes ? "" : selectedTypes.join(" ")}
          onChange={(e) => {
            setSelectedTypes(e.target.value.split(" ").filter((t) => t.trim()));
          }}
        ></Textarea>
        <div className="flex gap-3">
          <Button className="mt-5 bg-amber-950!">Remove</Button>
          <Button className="mt-5" onClick={pushAndNextToken}>
            Push and Next Token
          </Button>
        </div>
      </div>
    </div>
  );
}
