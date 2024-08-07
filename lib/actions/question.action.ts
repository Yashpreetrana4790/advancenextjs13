"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";

import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  GetUserStatsParams,
  QuestionVoteParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import Interaction from "@/database/Interaction.model";

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();
    const questions = await Question.find({})
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .sort({ createdAt: -1 });

    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();
    const { title, content, tags, author, path } = params;
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true },
      );

      tagDocuments.push(existingTag._id);
    }



    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    })

    revalidatePath(path);
  } catch (error) { }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();

    const { questionId } = params;

    const question = await Question.findById(questionId)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params

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

    const question = await Question.findByIdAndUpdate(
      questionId, updatequery, { new: true }
    )

    if (!question) {
      throw new Error("Question not found")
    }

    revalidatePath(path)
    // increment author reputation by +10 for upvoting the question
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params

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

    const question = await Question.findByIdAndUpdate(
      questionId, updatequery, { new: true }
    )

    if (!question) {
      throw new Error("Question not found")
    }

    revalidatePath(path)
    // increment author reputation by +10 for upvoting the question
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function getAllUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId } = params;


    const total = await Question.countDocuments({ author: userId });
    const questions = await Question.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });
    return { questions, total };
  } catch (error) {
    console.log(error);
    throw error;
  }
}



export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();
    const { questionId, path } = params;
    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany({ questions: questionId }, { $pull: { questions: questionId } });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function EditQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();
    const { questionId, title, content, path } = params
    const question = await Question.findByIdAndUpdate(questionId).populate({ path: "tags", model: Tag, select: "_id name" })
    if (!question) {
      throw new Error("Question not found")
    }

    question.title = title
    question.content = content
    await question.save()
    revalidatePath(path)




  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function getHotQuestions() {

  try {
    connectToDatabase();
 
    const hotquestions = await Question.find()
      .sort({ upvotes: -1 , views :-1 })
      .limit(5)
   

    return hotquestions

  } catch (error) {
    
  }
}