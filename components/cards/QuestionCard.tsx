import Link from "next/link";
import React from "react";
import RenderTag from "../shared/RenderTag";
import Metric from "../shared/metric";
import { SignedIn } from "@clerk/nextjs";

import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import EditDeleteAction from "../shared/EditDeleteAction";
interface QuestionProps {
  clerkId?: string
  _id: string;
  tags: {
    _id: string;
    name: string;
  }[];
  title: string;
  author: {
    _id: number;
    name: string;
    picture: string;
  };
  upvotes: string[];
  views: number;
  answers: Array<object>;
  createdAt: Date;
}

const QuestionCard = ({
  clerkId,
  _id,
  tags,
  title,
  author,
  upvotes,
  views,
  answers,
  createdAt,
}: QuestionProps) => {

  const showActionButtons = clerkId && clerkId === author.clerkId;

  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <span className=" text-dark400_light700 line-clamp-1 sm:hidden">
          {getTimestamp(createdAt)}
        </span>
        <Link href={`/question/${_id} `}>
          <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
            {title}
          </h3>
        </Link>
 

        <SignedIn>
         {showActionButtons && (
            <EditDeleteAction type='Question' itemId={JSON.stringify(_id)} />
          )} 
        </SignedIn>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
      </div>

      <div className="flex-between  mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author?.picture}
          alt="user"
          value={author?.name.trim().split(' ')[0]}
          title={` •  asked ${getTimestamp(createdAt)}`}
          href={`/profile/${author?._id}`}
          isAuthor
          textStyles="body-medium text-dark400_light700"
        />
        <div className="flex-end flex gap-3">

          <Metric
            imgUrl="/assets/icons/like.svg"
            alt="upvotes"
            value={formatAndDivideNumber(upvotes?.length)}
            title="votes"
            textStyles=" small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/assets/icons/message.svg"
            alt="messaage"
            value={formatAndDivideNumber(answers.length)}
            title="answers"
            textStyles=" small-medium text-dark400_light800"
          />
          <Metric
            imgUrl="/assets/icons/eye.svg"
            alt="eye"
            value={formatAndDivideNumber(views)}
            title="Views"
            textStyles=" small-medium text-dark400_light800"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
