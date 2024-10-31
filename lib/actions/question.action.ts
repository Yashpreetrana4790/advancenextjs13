"use server";
import { SortOrder } from "mongoose";
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
import { FilterQuery } from "mongoose";

export async function getQuestions(params: GetQuestionsParams) {

  const { searchQuery, filter, page = 1, pageSize = 10 } = params;



  const skipamount = (page - 1) * pageSize


  const query: FilterQuery<typeof Question> = {}



  if (searchQuery) {
    query.$or = [
      { title: { $regex: new RegExp(`^${searchQuery}$`, "i") } },
      { content: { $regex: new RegExp(`^${searchQuery}$`, "i") } },
    ]
  }

  let sort: { [key: string]: SortOrder } = {};

  if (filter) {
    switch (filter) {

      case "newest":
        sort = { createdAt: -1 }; // Assuming `createdAt` is a timestamp field
        break;
      case "frequent":
        sort = { views: -1 }; // Assuming you have a `views` field
        break;
      case "unanswered":
        query.answers = { $size: 0 };// Assuming you have an `answers` field
        sort = { createdAt: -1 };

      default:
        sort = {}; // No specific sorting
        break;
    }

  }

  try {
    connectToDatabase();
    const questions = await Question.find(query)
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .skip(skipamount)
      .limit(pageSize)
      .sort(sort);

    const totalquestions = await Question.countDocuments(query);
    const isNext = totalquestions > skipamount + questions.length

    return { questions, isNext };
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw error;
  }
}


export async function getAllUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, pageSize = 10, page = 1 } = params;

    const skipAmount = (page - 1) * pageSize;


    const total = await Question.countDocuments({ author: userId });
    const questions = await Question.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(pageSize + 1)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    const isNext = total > skipAmount + questions.length
    return { questions, total, isNext };
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    throw error;
  }
}


export async function getHotQuestions() {

  try {
    connectToDatabase();

    const hotquestions = await Question.find()
      .sort({ upvotes: -1, views: -1 })
      .limit(5)


    return hotquestions

  } catch (error) {

  }
}