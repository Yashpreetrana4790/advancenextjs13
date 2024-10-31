import Filter from "@/components/shared/Filter";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { TagFilters } from "@/constants/filters";
import React from "react";
import NoResult from "@/components/shared/NoResult";
import Link from "next/link";
import { getAllTags } from "@/lib/actions/tag.action";
import { SearchParamsProps } from "@/types";
import Pagination from "@/components/shared/Pagination";

const Page = async ({ searchParams }: SearchParamsProps) => {
  const result = await getAllTags({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900"> All Tags</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center ">
        <LocalSearchbar
          route="/tags"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for amazing minds"
          otherClasses="flex-1"
        />

        <Filter
          filters={TagFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>
      <section className="flex mt-12   gap-4 flex-wrap">
        {result.tags.length > 0 ? (
          result.tags.map((tag) => (
            <Link
              href={`/tags/${tag._id}`}
              key={tag._id}
              className="shadow-light100_darkone"
            >
              <article className="background-light900_dark200 light-border flex flex-col w-full px-8 py-10 sm:w-[260px]">
                <div className="background-light800_dark400 w-fit rounded-sm px-5 py-1.5">
                  <p className="paragraph-semibold text-dark300_light900">
                    {tag.name}
                  </p>
                </div>
                <p className="small-medium tex-dark400_light500 mt-3.5 text-white">
                  <span className="  body-semibold primary-text-gradient mr-2.5">
                    {tag.questions.length} +
                  </span>
                  Questions
                </p>
              </article>
            </Link>
          ))
        ) : (
          <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center">
            <NoResult
              title=" No tags found "
              description="it looks like there are no tags found."
              link="/ask-question"
              linkTitle="Ask a question"
            />
          </div>
        )}
      </section>
      <Pagination
        pageNumber={searchParams.page ? +searchParams.page : 1}
        isNext={result.isNext} />
    </>
  );
};

export default Page;
