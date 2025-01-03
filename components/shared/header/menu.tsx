import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EllipsisVertical, ShoppingCartIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import ModeToggle from "./mode-toggle";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ModeToggle />
        <Button variant="ghost">
          <Link href="/cart">
            <ShoppingCartIcon />
          </Link>
        </Button>
        <Button>
          <Link href="/sign-in" className="flex-center gap-x-2">
            <UserIcon className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        </Button>
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            <Button variant="ghost">
              <Link href="/cart" className="flex-center gap-x-2">
                <ShoppingCartIcon className="w-4 h-4" /> Cart
              </Link>
            </Button>
            <Button variant="ghost">
              <Link href="/sign-in" className="flex-center gap-x-2">
                <UserIcon className="w-4 h-4" /> Sign In
              </Link>
            </Button>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
