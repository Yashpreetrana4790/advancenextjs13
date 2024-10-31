import { AnswerFilters } from '@/constants/filters';
import React from 'react'
import Filter from './Filter';
import { getAnswers } from '@/lib/actions/answer.action';
import Image from 'next/image';
import Link from 'next/link';
import ParseHTML from './ParseHTML';
import { getTimestamp } from '@/lib/utils';
import Votes from '../Votes';


interface Props {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page?: number;
  filter?: string;
  searchParams?: any
}
const AllAnswers = async ({ questionId, totalAnswers, page, userId, filter, searchParams}: Props) => {
  const result = await getAnswers({
    questionId,
    page: searchParams?.page ? +searchParams?.page : 1,
    sortBy: filter
  })


  return (
    <>

      <div className="mt-11">
        <div className='flex items-center justify-between mb-2'>
          <h3 className='primary-text-gradient'>{totalAnswers} Answers</h3>
          <div className='space-y-2'>

            <Filter filters={AnswerFilters} />
          </div>
        </div>
        <div>
          {result?.answers?.map((answer) => (
            <article key={answer._id} className='light-border border-b py-10'>
              <div className='mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
                <Link href={`/profile/${answer.author.clerkId}`} className="flex flex-1 items-start gap-1 sm:items-center">
                  <Image
                    src={answer?.author.picture}
                    width={18}
                    height={18}
                    alt="profile"
                    className="rounded-full object-cover max-sm:mt-0.5"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center space-x-2">
                    <p className="body-semibold text-dark300_light700 capitalize">
                      {answer?.author?.name}
                    </p>

                    <p className="small-regular text-light400_light500 ml-0.5  line-clamp-1 mr-1">
                      answered
                    </p>
                    <p className='small-regular text-light400_light500'>
                      {getTimestamp(answer.createdAt)}

                    </p>
                  </div>
                </Link>
                <div className="flex justify-end">
                  <Votes
                    type="answer"
                    itemId={JSON.stringify(answer._id)}
                    userId={JSON.stringify(userId)}
                    upvotes={answer.upvotes.length}
                    downvotes={answer.downvotes.length}
                    hasupVoted={answer.upvotes.includes(userId)}
                    hasdownVoted={answer.downvotes.includes(userId)}
                  />
                </div>

              </div>
              <ParseHTML data={answer.content} />
            </article>
          ))}
        </div>



      </div>

    </>
  )
}

export default AllAnswers