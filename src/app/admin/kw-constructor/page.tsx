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

  const loadTokenType = async (id?: number) => {
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
    <div className="flex flex-col items-center mt-40">
      <div className="w-[60%] flex flex-col items-center gap-1">
        <span className="mb-5 font-semibold text-xl">Keyword Constructor</span>
        <span className="flex gap-3 items-center! mb-8">
          <TextInput
            placeholder="id"
            w={100}
            value={!loadId ? "" : loadId.toString()}
            radius={"md"}
            onChange={(e) => {
              setLoadId(Number(e.target.value));
            }}
          ></TextInput>
          <Button
            onClick={() => {
              loadTokenType(loadId);
            }}
            className="bg-red-900!"
          >
            Load
          </Button>
        </span>
        <span><span className="font-bold tracking-wide text-lg underline">ID:</span> {line.toString()}</span>
        <TextInput
          className="flex! tracking-wide! flex-col text-center mt-2"
          radius={"md"}
          value={!token ? "" : token}
          fw={650}
          onChange={(e) => setToken(e.target.value)}
        ></TextInput>
        <Stack className="mt-5 flex! flex-row! border-1 border-red-300 p-5 rounded-2xl bg-red-100">
          <span className="flex flex-col gap-4">
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
              fw={600}
            />
            <Checkbox
              checked={selectedTypes.includes("casual")}
              onChange={(e) => toggleType("casual", e.target.checked)}
              fw={600}
              label="Casual"
            />
            <Checkbox
              checked={selectedTypes.includes("professional")}
              onChange={(e) => toggleType("professional", e.target.checked)}
              fw={600}
              label="Professional"
            />
            <Checkbox
              checked={selectedTypes.includes("grandiose")}
              onChange={(e) => toggleType("grandiose", e.target.checked)}
              fw={600}
              label="Grandiose"
            />
          </span>
          <span className="flex flex-col gap-2">
            <Checkbox
              checked={selectedTypes.includes("brash")}
              onChange={(e) => toggleType("brash", e.target.checked)}
              fw={600}
              label="Brash"
            />
            <Checkbox
              checked={selectedTypes.includes("smooth")}
              onChange={(e) => toggleType("smooth", e.target.checked)}
              fw={600}
              label="Smooth"
            />
            <Checkbox
              checked={selectedTypes.includes("warm")}
              onChange={(e) => toggleType("warm", e.target.checked)}
              fw={600}
              label="Warm"
            />
            <Checkbox
              checked={selectedTypes.includes("cringe")}
              onChange={(e) => toggleType("cringe", e.target.checked)}
              fw={600}
              label="Cringe"
            />
            <Checkbox
              checked={selectedTypes.includes("insane")}
              onChange={(e) => toggleType("insane", e.target.checked)}
              fw={600}
              label="Insane"
            />
          </span>
        </Stack>
        <Textarea
          className="mt-5 font-semibold text-center"
          p={1}
          label="Types List"
          value={!selectedTypes ? "" : selectedTypes.join(" ")}
          labelProps={{
            className: "mb-2 font-semibold! tracking-wide!"
          }}
          onChange={(e) => {
            setSelectedTypes(e.target.value.split(" ").filter((t) => t.trim()));
          }}
          radius={"md"}
        ></Textarea>
        <div className="flex gap-3">
          <Button className="mt-5 bg-amber-950!">Remove</Button>
          <Button className="mt-5 bg-blue-600!" onClick={pushAndNextToken}>
            Push and Next Token
          </Button>
        </div>
      </div>
    </div>
  );
}
