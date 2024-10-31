"use server"

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import { AnswerVoteParams, CreateAnswerParams, DeleteAnswerParams, GetAnswersParams, GetUserStatsParams } from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import User from "@/database/user.model";
import Interaction from "@/database/Interaction.model";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, author, question, path } = params;

    const newAnswer = await Answer.create({ content, author, question });

    // Add the answer to the question's answers array
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id }
    })

    // TODO: Add interaction...

    revalidatePath(path)
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    connectToDatabase();


    const { questionId, sortBy, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * 10
    console.log(pageSize)
    let sortOptions = {};
    switch (sortBy) {
      case "heighestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      default:
        break;
    }



    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .sort({ createdAt: -1 })
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(10)

    const isNext = await Answer.countDocuments({ question: questionId }) > skipAmount + answers.length

    return { answers: answers, isNext };
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params

    let updatequery = {}
    if (hasupVoted) {
      updatequery = { $pull: { upvotes: userId } }
    }
    else if (hasdownVoted) {
      updatequery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId }
      }
    } else {
      updatequery = { $addToSet: { upvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(
      answerId, updatequery, { new: true }
    )

    if (!answer) {
      throw new Error("Answer not found")
    }

    revalidatePath(path)
    // increment author reputation by +10 for upvoting the question
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    connectToDatabase();
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params

    let updatequery = {}
    if (hasdownVoted) {
      updatequery = { $pull: { downvotes: userId } }
    }
    else if (hasupVoted) {
      updatequery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId }
      }
    } else {
      updatequery = { $addToSet: { downvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(
      answerId, updatequery, { new: true }
    )

    if (!answer) {
      throw new Error("Answer not found")
    }

    revalidatePath(path)
    // increment author reputation by +10 for upvoting the question
  } catch (error) {
    console.error(error);
    throw error;
  }
}



export async function getAllUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, pageSize = 10, page = 1 } = params;

    const skipAmount = (page - 1) * pageSize;

    const total = await Answer.countDocuments({ author: userId });
    const Answers = await Answer.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "question",
        model: Question,
        select: "_id title",
      })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      })
    const isNext = total > skipAmount + Answers.length
    return { answers: Answers, total, isNext };
  } catch (error) {
    console.error(error);
    throw error;
  }
}




export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    connectToDatabase();
    const { answerId, path } = params;
    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error("Answer not found");
    }

    await Answer.deleteOne({ _id: answerId });
    await Question.updateMany({ _id: answer.question }, { $pull: { answers: answerId } });
    await Interaction.deleteMany({ answer: answerId });
    revalidatePath(path);

  } catch (error) {
    console.error(error);
    throw error;
  }
}