import Image from "next/image";
import Link from "next/link";
import React from "react";
import RenderTag from "./RenderTag";

const RightSidebar = () => {
  const hotQuestions = [
    {
      _id: "1",
      title:
        "What is Next.js, and how does it differ from traditional React applications?",
    },
    {
      _id: "2",
      title:
        "Explain the concept of server-side rendering (SSR) in Next.js. What are the advantages of SSR?",
    },
    {
      _id: "3",
      title:
        "What is the purpose of the getServerSideProps function in Next.js? How is it different from getStaticProps?",
    },
    {
      _id: "4",
      title:
        "Describe the role of the _app.js and _document.js files in a Next.js application. When would you customize them?",
    },
    {
      _id: "5",
      title:
        "What is the purpose of the useRouter hook in Next.js? How is it used?",
    },
  ];

  const popularTags = [
    { _id: "1", name: "javascript", totalQuestions: 5 },
    { _id: "2", name: "react", totalQuestions: 15 },
    { _id: "3", name: "next", totalQuestions: 50 },
    { _id: "4", name: "vue", totalQuestions: 2 },
    { _id: "5", name: "redux", totalQuestions: 5 },
  ];
  return (
    <section
      className="background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] 
  flex-col justify-between overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden"
    >
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map((question) => (
            <Link
              href={`/questions/${question._id}`}
              key={question._id}
              className="flex cursor-pointer items-center gap-7"
            >
              <p className="body-medium  text-dark500_light700">
                {question.title}
              </p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="asd"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestions={tag.totalQuestions}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
