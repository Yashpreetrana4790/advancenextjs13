"use client"

import { deleteAnswer } from '@/lib/actions/answer.action';
import { deleteQuestion } from '@/lib/actions/question.action';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react'

interface Props {
  type: string;
  itemId: string;
}
const EditDeleteAction = ({ type, itemId }: any) => {

  const pathname = usePathname()

  const handleEdit = async () => {

  }


  const handleDelete = async () => {
    if (type === "Question") {
      await deleteQuestion({ questionId: JSON.parse(itemId), path: pathname })
    } else if (type === "Answer") {
      await deleteAnswer({ answerId: JSON.parse(itemId), path: pathname })
    }
  }
  return (
    <div className='flex items-center justify-center gap-3 max-sm:w-full'>
      {type === "Question" && (
        <Image
          alt="edit"
          width={14}
          height={14}
          className="cursor-pointer object-contain"
          src="/assets/icons/edit.svg"
          onClick={handleEdit}
        />
      )}

      <Image
        src="/assets/icons/trash.svg"
        width={14}
        height={14}
        alt="delete"
        className="cursor-pointer object-contain"
        onClick={handleDelete}
      />
    </div>
  )
}

export default EditDeleteAction