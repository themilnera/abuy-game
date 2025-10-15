"use client"

import { Button, Menu, NavLink, TextInput } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="header w-[70vw] h-[15vh] border-2 border-solid text-sm">
        {/* Top of header (links) */}
        <div className="header-top w-[100%] h-[25%] pl-3 pt-1 bg-white flex flex-row gap-10 border-b border-b-stone-400">
          <div className="flex gap-1.5">
            <Link href="/" className="text-blue-800 underline">
              Sign-In
            </Link>
            <p>or</p>
            <Link href="/" className="text-blue-800 underline">
              Register
            </Link>
          </div>

          <div className="flex gap-10">
            <Link href="/">Deals of the Day</Link>
            <Link href="/">Need Help?</Link>
          </div>

          <div className="flex gap-5 ml-auto mr-5">
            <Link href="/">My Listings</Link>
            <Link href="/">My Bids</Link>
            <Link href="/">News</Link>
            <Link href="/">Cart</Link>
          </div>
        </div>

        {/* Bottom of header */}
        <div className="header-bottom w-[100%] h-[60%] flex items-center">
          <Link href="/">
            <Image
              src={`/ABUY_logo.png`}
              alt="ABUY logo"
              width={180}
              height={10}
            ></Image>
          </Link>
          <Menu width={100}>
            <Menu.Target>
              <Button>Categories</Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item>Electronics</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <TextInput placeholder="Search for something" aria-label="Search field" radius="lg" size="md" className="flex-7 mr-1"/>
          <NavLink href="#search-category" label="Category" className="flex-1"></NavLink>
        </div>
      </div>
      <div className="middle"></div>
      <div className="footer"></div>
    </>
  );
}
