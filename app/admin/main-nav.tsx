"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Overview",
    href: "/admin/overview",
  },
  {
    label: "Products",
    href: "/admin/products",
  },
  {
    label: "Orders",
    href: "/admin/orders",
  },
  {
    label: "Users",
    href: "/admin/users",
  },
];

type MainNavProps = {
  className?: string;
};

const MainNav = ({ className }: MainNavProps) => {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.includes(link.href) && "text-primary"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
