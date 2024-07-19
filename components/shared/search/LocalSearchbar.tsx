"use client";
import { Input } from "@/components/ui/input";
import { SearchParams } from "@/lib/actions/shared.types";
import { formUrlQuery } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React, { useEffect } from "react";
interface CustomInputProps {
  route: string;
  iconPosition: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearchbar = ({
  route,
  iconPosition,
  imgSrc,
  placeholder,
  otherClasses,
}: CustomInputProps) => {


  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [search, setSearch] = React.useState(query || "");


  useEffect(() => {
    const delaydebounce = setTimeout(() => {


      if (search) {
        const newurl = formUrlQuery({
          params: searchParams.toString(),
          key : "q",
          value : search || ""
      })
  }
    },300)
  }, [query, pathname, search, router, searchParams]);



return (
  <div
    className={`background-light800_darkgradient ${otherClasses} flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4`}
  >
    {iconPosition === "left" && (
      <Image
        src={imgSrc}
        alt="search-icon"
        width={24}
        height={24}
        className="cursor-pointer"
      />
    )}
    <Input
      type="text"
      placeholder={placeholder}
      value={search}
      onChange={() => { }}
      className="paragraph-regular no-focus placeholder background-light800_darkgradient border-none shadow-none"
    />
  </div>
);
};

export default LocalSearchbar;
