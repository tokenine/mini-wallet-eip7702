"use client"

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  GithubIcon,
  Logo,
} from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { Wallet } from 'lucide-react';

export const Navbar = () => {
  const { status } = useAuth();
  const pathname = usePathname();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">Mini Wallet</p>
          </NextLink>
        </NavbarBrand>

      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">

          <ThemeSwitch />
        </NavbarItem>

        {pathname !== "/dashboard" && (
          <NavbarItem className="hidden md:flex">
            <Button
              as={Link}
              className="text-sm font-normal text-default-600 bg-default-100"
              href={status === "authenticated" ? "/dashboard" : "/login"}
              startContent={<Wallet className="text-danger" />}
              variant="flat"
            >
              {status === "authenticated" ? "Dashboard" : "Login"}
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>

      </NavbarMenu>
    </HeroUINavbar>
  );
};
