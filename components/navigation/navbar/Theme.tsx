"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Theme() {
  const { setTheme, resolvedTheme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component only renders on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent rendering on the server

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer outline-none focus:bg-light-900 data-[state=open]:bg-light-900 dark:focus:bg-dark-200 dark:data-[state=open]:bg-dark-200"
        >
          {currentTheme === "light" && (
            <Image
              src="/icons/sun.svg"
              width={30}
              height={30}
              alt="light mode logo"
              priority
              className="active-theme size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
          )}
          {currentTheme === "dark" && (
            <Image
              src="/icons/moon.svg"
              width={30}
              height={30}
              alt="dark mode logo"
              priority
              className="active-theme absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Image
            src="/icons/sun.svg"
            width={20}
            height={20}
            alt="light mode logo"
            priority
            className="invert-colors"
          />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Image
            src="/icons/moon.svg"
            width={20}
            height={20}
            alt="dark mode logo"
            priority
          />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Image
            src="/icons/computer.svg"
            width={20}
            height={20}
            alt="system mode logo"
            priority
          />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Theme;
