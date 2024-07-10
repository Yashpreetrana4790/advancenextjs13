import { getAllUserAnswers } from '@/lib/actions/answer.action'
import React from 'react'
import AnswerCard from '../cards/AnswerCard'

const AnswerTab = async ({ userId, clerkId }: any) => {
  const userAnswers = await getAllUserAnswers({ userId, page: 1 })

  return (
    <div className="grid grid-cols-1 gap-5">

      {userAnswers?.answers?.map((answer) => (
        <AnswerCard
          key={answer._id}
          clerkId={clerkId}
          _id={answer._id}
          author={answer.author}
          upvotes={answer.upvotes.length}
          question={answer.question}
          createdAt={answer.createdAt}
        />
      ))}
    </div>
  )
}

export default AnswerTab