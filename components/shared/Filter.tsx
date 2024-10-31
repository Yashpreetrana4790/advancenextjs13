"use client";
import React, { useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  filters: {
    name: string;
    value: string;
  }[];

  otherClasses?: string;
  containerClasses?: string;
}

const Filter = ({ filters, otherClasses, containerClasses }: Props) => {
  const [value, setValue] = React.useState(filters[0].value);

  const searchParams = useSearchParams();

  const router = useRouter();


  useEffect(() => {
    if (value) {
      const newurl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: value
      })
      router.push(newurl, { scroll: false })
    }

  }, [value , router, searchParams])


  return (
    <div className={`relative  ${containerClasses}`}>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger
          className={`${otherClasses} body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5`}
        >
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a Filter" />
          </div>
        </SelectTrigger>

        <SelectContent className="dark:bg-black bg-white" >
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem key={item.value} value={item.value} onChange={() => setValue(item.value)} >
                <span className={cn("dark:text-white , dark:bg-black")}>
                  {item.name}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};


export default Filter;
