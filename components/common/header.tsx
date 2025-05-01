"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Container from "@/components/common/container";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ModeToggle } from "./mode-toggle";
import { DialogTitle } from "@radix-ui/react-dialog";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className=" flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              C
            </div>
            <span className="text-xl font-bold">ConciseAI</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {/* <Button onClick={() => getUserAccountByClerkId("Asd")}>
            Check Auth
          </Button>
          <Button onClick={testFUnction}>check token count</Button> */}
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Testimonials
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-1 text-sm rounded-lg bg-primary text-white"
            >
              Dashboard
            </Link>
            <div className="p-1 h-10 aspect-square flex items-center justify-center rounded-full border bg-blue-100 border-blue-200">
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <DialogTitle></DialogTitle>
              <nav className="flex flex-col gap-4 mt-8 p-10 ">
                <Link
                  href="#features"
                  className="text-xl font-medium hover:text-primary transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-xl font-medium hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="#testimonials"
                  className="text-xl font-medium hover:text-primary transition-colors"
                >
                  Testimonials
                </Link>
                <Link
                  href="#faq"
                  className="text-xl font-medium hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">Sign Up</Button>
                  </SignUpButton>
                </SignedOut>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
