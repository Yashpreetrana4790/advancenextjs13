import { getAllUserQuestions } from '@/lib/actions/question.action'
import React from 'react'
import QuestionCard from '../cards/QuestionCard'
import { SearchParamsProps } from '@/types'
import { Button } from '../ui/button'
import NoResult from './NoResult'

interface Props extends SearchParamsProps {
  userId: string
  clerkId: string | null
}

const QuestionTab = async ({ userId, clerkId }: any) => {
  const userQuestions = await getAllUserQuestions({ userId, page: 1 })
  return (
    <>
      {userQuestions?.questions ? (

        <div className="grid grid-cols-1 gap-5">

          {userQuestions.questions.map((question) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              tags={question.tags}
              clerkId={clerkId}
              title={question.title}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))}
        </div>
      ) : (
        <NoResult
          title="There is no question to show "
          description="   Be the first one to break the silence! Ask a question and kickstart the
        discussion . Our query coule be the next bigh thing"
          link="/ask-question"
          linkTitle="Ask a question"
        />

      )}

    </>

  )
}

export default QuestionTab