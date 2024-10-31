"use server";
import { SortOrder, FilterQuery } from "mongoose";
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

// Get Questions List with Optional Search, Filter, Pagination
export async function getQuestions(params: GetQuestionsParams) {
  const { searchQuery, filter, page = 1, pageSize = 10 } = params;
  const skipAmount = (page - 1) * pageSize;
  const query: FilterQuery<typeof Question> = {};

  // Search functionality
  if (searchQuery) {
    query.$or = [
      { title: { $regex: new RegExp(searchQuery, "i") } },
      { content: { $regex: new RegExp(searchQuery, "i") } },
    ];
  }


  let sort: { [key: string]: SortOrder } = {};
  if (filter) {
    switch (filter) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "frequent":
        sort = { views: -1 };
        break;
      case "unanswered":
        query.answers = { $size: 0 };
        sort = { createdAt: -1 };
        break;
      default:
        sort = {};
        break;
    }
  }

  try {
    await connectToDatabase();
    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sort);

    const totalQuestions = await Question.countDocuments(query);
    const isNext = totalQuestions > skipAmount + questions.length;

    return { questions, isNext };
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

// Create New Question
export async function createQuestion(params: CreateQuestionParams) {
  try {
    await connectToDatabase();
    const { title, content, tags, author, path } = params;
    const question = await Question.create({ title, content, author });

    // Handle tags
    const tagDocuments = await Promise.all(
      tags.map(async (tag) => {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $push: { questions: question._id } },
          { upsert: true, new: true }
        );
        return existingTag._id;
      })
    );

    await Question.findByIdAndUpdate(question._id, { $push: { tags: { $each: tagDocuments } } });
    revalidatePath(path);
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
}

// Get Single Question by ID
export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    await connectToDatabase();
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
    console.error("Error fetching question by ID:", error);
    throw error;
  }
}

// Upvote Question
export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    await connectToDatabase();
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    const updateQuery = hasupVoted
      ? { $pull: { upvotes: userId } }
      : hasdownVoted
        ? { $pull: { downvotes: userId }, $push: { upvotes: userId } }
        : { $addToSet: { upvotes: userId } };

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });
    if (!question) throw new Error("Question not found");

    revalidatePath(path);
  } catch (error) {
    console.error("Error upvoting question:", error);
    throw error;
  }
}

// Downvote Question
export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    await connectToDatabase();
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    const updateQuery = hasdownVoted
      ? { $pull: { downvotes: userId } }
      : hasupVoted
        ? { $pull: { upvotes: userId }, $push: { downvotes: userId } }
        : { $addToSet: { downvotes: userId } };

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });
    if (!question) throw new Error("Question not found");

    revalidatePath(path);
  } catch (error) {
    console.error("Error downvoting question:", error);
    throw error;
  }
}

// Get All Questions by User
export async function getAllUserQuestions(params: GetUserStatsParams) {
  try {
    await connectToDatabase();
    const { userId, pageSize = 10, page = 1 } = params;
    const skipAmount = (page - 1) * pageSize;

    const total = await Question.countDocuments({ author: userId });
    const questions = await Question.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({ path: "author", model: User, select: "_id clerkId name picture" });

    const isNext = total > skipAmount + questions.length;
    return { questions, total, isNext };
  } catch (error) {
    console.error("Error fetching user questions:", error);
    throw error;
  }
}

// Delete Question
export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    await connectToDatabase();
    const { questionId, path } = params;

    await Promise.all([
      Question.deleteOne({ _id: questionId }),
      Answer.deleteMany({ question: questionId }),
      Interaction.deleteMany({ question: questionId }),
      Tag.updateMany({ questions: questionId }, { $pull: { questions: questionId } }),
    ]);

    revalidatePath(path);
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}

// Edit Question
export async function editQuestion(params: EditQuestionParams) {
  try {
    await connectToDatabase();
    const { questionId, title, content, path } = params;

    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    question.title = title;
    question.content = content;
    await question.save();
    revalidatePath(path);
  } catch (error) {
    console.error("Error editing question:", error);
    throw error;
  }
}

// Get Top 5 Hot Questions
export async function getHotQuestions() {
  try {
    await connectToDatabase();
    const hotQuestions = await Question.find().sort({ upvotes: -1, views: -1 }).limit(5);
    return hotQuestions;
  } catch (error) {
    console.error("Error fetching hot questions:", error);
    throw error;
  }
}
