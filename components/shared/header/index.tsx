import { APP_NAME } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import CategoryDrawer from "./category-drawer";
import Menu from "./menu";
import Search from "./search";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start gap-2">
          <Suspense fallback={<Loader2 className="animate-spin" />}>
            <CategoryDrawer />
          </Suspense>
          <Link href="/" className="flex-start">
            <Image
              src="/images/logo.svg"
              alt={APP_NAME + " logo"}
              width={48}
              height={48}
              priority
            />
            <span className="hidden font-bold text-2xl ml-3 lg:block">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <div className="hidden md:block">
          <Search />
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
