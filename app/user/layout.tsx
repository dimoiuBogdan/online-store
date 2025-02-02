import Menu from "@/components/shared/header/menu";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import MainNav from "./main-nav";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex flex-col">
        <div className="border-b container mx-auto">
          <div className="flex items-center h-16 px-4">
            <Link href="/" className="w-22 mr-4">
              <Image
                src="/images/logo.svg"
                alt={APP_NAME}
                width={48}
                height={48}
              />
            </Link>
            <MainNav />

            <div className="ml-auto items-center flex space-x-4">
              <div>
                <Input
                  type="search"
                  placeholder="Search"
                  className="md:w-[100px] lg:w-[300px]"
                />
              </div>
              <Menu />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6 mx-auto container">
          {children}
        </div>
      </div>
    </>
  );
}
