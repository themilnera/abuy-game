"use client";

import { Button, Menu, NavLink, TextInput, Tooltip } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import {
  IconBell,
  IconCaretDownFilled,
  IconShoppingCart,
} from "@tabler/icons-react";

export default function Header() {
  return (
    <>
      <div className="header md:w-[70vw] h-60 text-sm flex flex-col">
        {/* Top of header (links) */}
        <div className="header-top w-[100%] h-9 pl-3 pt-1 pb-1 bg-white flex flex-row gap-10 border-b border-b-stone-400">
          <div className="flex gap-1.5">
            <Link href="/" className="text-blue-800 underline ml-1">
              Sign In
            </Link>
            <p>or</p>
            <Link href="/" className="text-blue-800 underline">
              Register
            </Link>
          </div>

          <div className="flex gap-10 collapse md:visible">
            <Link
              href="/deals"
              className="hover:underline hover:underline-offset-3"
            >
              Deals of the Day
            </Link>
            <Link
              href="/help"
              className="hover:underline hover:underline-offset-3"
            >
              Need Help?
            </Link>
          </div>

          <div className="flex gap-5 ml-auto mr-5">
            <Link href="/sell">Sell</Link>
            <Link href="/my-bids">Bids</Link>
            <Tooltip label="Notifications" offset={1}>
              <Link href="/notifications">
                <IconBell />
              </Link>
            </Tooltip>
            <Tooltip label="My shopping cart" offset={1}>
              <Link href="/cart">
                <IconShoppingCart />
              </Link>
            </Tooltip>
          </div>
        </div>

        {/* Bottom of header */}
        <div className="header-bottom w-[100%] h-[100%] flex flex-col md:flex-row items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src={`/ABUY_logo.png`}
                alt="ABUY logo"
                width={180}
                height={10}
              ></Image>
            </Link>
            <Menu
              width={110}
              transitionProps={{ transition: "fade-down", duration: 150 }}
            >
              <Menu.Target>
                <Button className="browse-button mr-2 " radius="sm">
                  <span className="text-lg flex items-center mr-5">Browse<IconCaretDownFilled width={"20px"} height={"20px"} /></span>
                  
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item>
                  <Link href="/browse/apparel" className="text-sm">
                    Apparel
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link href="/browse/electronics" className="text-sm">
                    Electronics
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link href="/browse/books" className="text-sm">
                    Books
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link href="/browse/collectibles" className="text-sm">
                    Collectibles
                  </Link>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        <div className="flex md:w-[100%] items-center ml-20 md:ml-0">
          <TextInput
            placeholder="Search for something"
            aria-label="Search field"
            size="md"
            radius={"xl"}
            className="flex-7 mr-1 ml-1 rounded-full border-gray-400"
          />

          <Button
            size="md"
            radius={"xl"}
            className="md:flex-1 ml-3 mr-20 bg-green-900! hover:bg-green-700!"
          >
            Search
          </Button>
          </div>
        </div>
      </div>
    </>
  );
}
