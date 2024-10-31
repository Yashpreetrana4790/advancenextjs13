import Question from '@/components/forms/Question'
import { auth } from '@clerk/nextjs'
import { redirect } from "next/navigation";
import { getUserById } from '@/lib/actions/user.action';
import { getQuestionById } from '@/lib/actions/question.action';

const Page = async ({ params }: any = {}) => {

  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const mongoUser = await getUserById({ userId });

  const QuestionDetail = await getQuestionById({ questionId: params.id });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Edit a question</h1>
      <div className="mt-9">
        <Question questionDetails={JSON.stringify(QuestionDetail)} type="Edit" mongoUserId={JSON.stringify(mongoUser?._id)} />
      </div>
    </div>
  )
}

export default Page