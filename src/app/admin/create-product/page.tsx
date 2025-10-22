"use client";
import Image from "next/image";

import {
  TextInput,
  Button,
  Textarea,
  Modal,
  Select,
  Input,
} from "@mantine/core";
import {
  IconArrowsRightLeft,
  IconCurrency,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { useState } from "react";
import axios from "axios";
import { useDisclosure } from "@mantine/hooks";

interface Product {
  id: string;
  name: string;
  category: string;
  lowest_price: number;
  highest_price: number;
  rarity: number;
  path: string;
  description: string;
}

export default function CreateProduct() {
  //CREATE PRODUCT
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [lowestPrice, setLowestPrice] = useState<number>(0);
  const [highestPrice, setHighestPrice] = useState<number>(0);
  const [rarity, setRarity] = useState<number>(0);
  const [path, setPath] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [submitText, setSubmitText] = useState<string>("Create Product");
  const [newProduct, setNewProduct] = useState<boolean>(true);

  //MODAL
  const [opened, { open, close }] = useDisclosure(false);
  const [results, setResults] = useState(false);
  const [resultData, setResultData] = useState<Product | null>(null);

  const [productId, setProductId] = useState<number>(0);
  const [productName, setProductName] = useState<string>("");

  const clearAllFields = () => {
    setName("");
    setCategory("");
    setLowestPrice(0);
    setHighestPrice(0);
    setRarity(0);
    setPath("");
    setDescription("");
    setSubmitText("Create Product");
    setNewProduct(true);
    setProductId(0);
  };

  const submitProduct = async () => {
    try {
      if (newProduct) {
        const result = await axios.post("/api/products", {
          name: name,
          category: category,
          lowest_price: lowestPrice,
          highest_price: highestPrice,
          rarity: rarity,
          path: path,
          description: description,
        });
        setResultData(result.data);

        setResults(true);
        open();
        clearAllFields();

        console.log("Submitted product to database: ", result);
      } else {
        const result = await axios.put(`/api/products/${productId}`, {
          name: name,
          category: category,
          lowest_price: lowestPrice,
          highest_price: highestPrice,
          rarity: rarity,
          path: path,
          description: description,
        });
        console.log("Updated product in database: ", result);
        setResultData(result.data);
        setResults(true);
        open();
        clearAllFields();
      }
    } catch (error) {
      console.error("POST failed: ", error);
    }
  };

  const loadProduct = async () => {
    try {
      close();
      const result = await axios.get(
        `/api/products/${productId ? productId : productName}`
      );
      const product = await result.data.product;
      setName(product.name);
      setCategory(product.category);
      setLowestPrice(product.lowest_price);
      setHighestPrice(product.highest_price);
      setRarity(product.rarity);
      setPath(product.path);
      setDescription(product.description);
      setSubmitText("Update Product");
      setNewProduct(false);
    } catch (error) {
      console.error("Failed to load product: ", error);
    }
  };

  return (
    <>
      <Modal
        size={!results ? "sm" : "lg"}
        opened={opened}
        onClose={() => {
          if (results) {
            setResultData(null);
            setResults(false);
          }
          close();
        }}
        withCloseButton={true}
        centered
      >
        {!results ? (
          <div className="flex flex-col items-center gap-5">
            <div className="flex gap-3 items-center">
              <TextInput
                onFocus={(e) => {
                  e.target.select();
                }}
                type="number"
                onChange={(e) => setProductId(Number(e.target.value))}
                value={productId}
                label="Product ID?"
                placeholder="id"
              ></TextInput>
              <TextInput
                type="text"
                onChange={(e) => setProductName(e.target.value)}
                value={productName}
                label="Product Name?"
                placeholder="name"
              ></TextInput>
            </div>
            <Button
              onClick={loadProduct}
              disabled={
                productId === 0 && productName.trim() === "" ? true : false
              }
              color="#5b2c2c"
              className="w-35! mt-3"
            >
              Load Product
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 justify-center">
            <span className="text-2xl text-center mb-5 font-bold">
              RESULT FROM DB:
            </span>
            <span className="bg-[#f4f4f4] rounded-md font-semibold flex justify-between items-center mr-5 ml-5 p-2">
              Product Id:{" "}
              <span className="text-[#751111] font-semibold text-lg">
                {resultData?.id}
              </span>
            </span>
            <span className="bg-[#f4f4f4] rounded-md font-semibold flex justify-between items-center mr-5 ml-5 p-2">
              Product Name:{" "}
              <span className="text-[#116729] font-semibold text-lg">
                {resultData?.name}
              </span>
            </span>
            <span className="bg-[#f4f4f4] rounded-md font-semibold flex justify-between items-center mr-5 ml-5 p-2">
              Category:{" "}
              <span className="text-[#116729] font-semibold text-lg">
                {resultData?.category}
              </span>
            </span>
            <span className="bg-[#f4f4f4] rounded-md font-semibold flex justify-between items-center mr-5 ml-5 p-2">
              Highest Price:{" "}
              <span className="text-[#751111] font-semibold text-lg">
                {resultData?.highest_price}
              </span>
            </span>
            <span className="bg-[#f4f4f4] rounded-md font-semibold flex justify-between items-center mr-5 ml-5 p-2">
              Lowest Price:{" "}
              <span className="text-[#751111] font-semibold text-lg">
                {resultData?.lowest_price}
              </span>
            </span>
            <span className="bg-[#f4f4f4] rounded-md font-semibold flex justify-between items-center mr-5 ml-5 p-2">
              Rarity:{" "}
              <span className="text-[#751111] font-semibold text-lg">
                {resultData?.rarity}
              </span>
            </span>
            <span className="bg-[#f4f4f4] rounded-md font-semibold flex justify-between mr-5 ml-5 p-2">
              <span className="self-start">Path:</span>
              <span className="text-[#116729] font-semibold text-md ml-10">
                {resultData?.path}
              </span>
            </span>
            <span className="bg-[#f4f4f4] rounded-md font-semibold flex justify-between items-center mr-5 ml-5 p-2">
              <span className="self-start">Description:</span>{" "}
              <span className="text-[#116729] font-semibold text-sm ml-10">
                {resultData?.description}
              </span>
            </span>
            <Button
              size="md"
              onClick={() => {
                if (results) {
                  setResultData(null);
                  setResults(false);
                }
                close();
              }}
              className="w-30! bg-[#5b2c2c]! hover:bg-[#422020]!  self-center mt-5"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
      <div className="flex flex-col items-center mb-5 mt-15">
        <h1 className="text-2xl font-extrabold underline tracking-wider">
          Add/Edit Product
        </h1>

        <div className="flex flex-col gap-3 md:w-150 w-100 items-center">
          <TextInput
            withAsterisk
            onChange={(e) => setName(e.target.value)}
            value={name}
            radius={"md"}
            label="Item Name"
            className="w-[100%]"
            placeholder="name"
          />
          <TextInput
            withAsterisk
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            radius={"md"}
            label="Item Category"
            className="w-[100%]"
            placeholder="category"
          />
          <div className="flex gap-6 items-center justify-center">
            <TextInput
              withAsterisk
              type="number"
              onFocus={(e) => {
                e.target.select();
              }}
              onChange={(e) => setLowestPrice(Number(e.target.value))}
              value={lowestPrice}
              radius={"md"}
              label="Lowest Price"
              className="w-[100%]"
              placeholder="lowest_price"
              rightSection={<IconCurrencyDollar />}
            />
            <IconArrowsRightLeft className="w-20 self-end mb-2" />
            <TextInput
              withAsterisk
              type="number"
              onFocus={(e) => {
                e.target.select();
              }}
              onChange={(e) => setHighestPrice(Number(e.target.value))}
              value={highestPrice}
              radius={"md"}
              label="Highest Price"
              className="w-[100%]"
              placeholder="highest_price"
              rightSection={<IconCurrencyDollar />}
            />
          </div>
          <TextInput
            withAsterisk
            type="number"
            onFocus={(e) => {
              e.target.select();
            }}
            onChange={(e) => setRarity(Number(e.target.value))}
            value={rarity}
            radius={"md"}
            label="Item Rarity (0-5)"
            className="w-[100%]"
            placeholder="rarity"
          />
          <TextInput
            withAsterisk
            onChange={(e) => setPath(e.target.value)}
            value={path}
            radius={"md"}
            label="Image Path (Ex: category/file-name.jpg)"
            className="w-[100%]"
            placeholder="path"
          />
          {(path.trim() !== "" && path.match(/.jpg/)) ||
          path.match(/.png/) ||
          path.match(/.tiff/) ||
          path.match(/.avif/) ||
          path.match(/.svg/) ? (
            <Image
              src={`/images${path}`}
              alt="product"
              width={200}
              height={10}
              className="mt-5"
            ></Image>
          ) : (
            <></>
          )}
          <Textarea
            withAsterisk
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            radius={"md"}
            label="Item Description"
            className="w-[100%]"
            placeholder="description..."
            autosize
            minRows={5}
          />
          <div className="flex gap-5">
            <Button onClick={open} color="#5b2c2c">
              Load Product...
            </Button>
            <Button
              w={300}
              disabled={
                name?.trim() == "" ||
                category?.trim() == "" ||
                lowestPrice === 0 ||
                highestPrice === 0 ||
                path?.trim() === "" ||
                description?.trim() === ""
                  ? true
                  : false
              }
              onClick={submitProduct}
            >
              {submitText}
            </Button>
            { 
          !newProduct ? (
            <Button onClick={clearAllFields} color="#6d6234">Reset</Button>
            )
          : 
           (<>
           
           </>)
          }
          </div>
          
        </div>
      </div>
    </>
  );
}
