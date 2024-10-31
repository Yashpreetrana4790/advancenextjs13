"use client";
import { HomePageFilters } from "@/constants/filters";
import React from "react";
import { Button } from "../ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { formUrlQuery, } from "@/lib/utils";

const Homefilters = () => {

  const [active, setActive] = React.useState<string>("all");
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleTypeClick = (item: string) => {

    if (active === item) {
      setActive(" ")
      const newurl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: null
      })
      router.push(newurl, { scroll: false })
    }
    else {
      setActive(item)
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: item.toLowerCase()
      });
      router.push(newUrl, { scroll: false })
    }
  }

  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {HomePageFilters.map((item) => (
        <Button
          key={item.value}
          onClick={() => { }}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${active === item.value
            ? "bg-primary-100 text-primary-500"
            : "bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300"
            }`}
          onClickCapture={() => handleTypeClick(item.value)}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};

export default Homefilters;
