"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { FilterQuery, SortOrder } from "mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";

export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error('User not found');
    }

    // Delete user from database
    // and questions, answers, comments, etc.

    // get user question ids
    // const userQuestionIds = await Question.find({ author: user._id}).distinct('_id');

    // delete user questions

  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getAllUsers(params: GetAllUsersParams) {


  const { searchQuery, filter, page = 1, pageSize = 10 } = params;


  const skipamount = (page - 1) * pageSize


  const query: FilterQuery<typeof User> = {}

  if (searchQuery) {
    query.$or = [
      { username: { $regex: new RegExp(`^${searchQuery}$`, "i") } },
      { email: { $regex: new RegExp(`^${searchQuery}$`, "i") } },
      { name: { $regex: new RegExp(`^${searchQuery}$`, "i") } },
    ]
  }

  let sort: { [key: string]: SortOrder } = {};

  if (filter) {
    switch (filter) {

      case "new_users":
        sort = { joinedAt: -1 }; // Assuming `joinedAt` is a timestamp field
        break;
      case "old_users":
        sort = { joinedAt: 1 }; // Assuming `joinedAt` is a timestamp field
        break;
    }
  }

  try {
    connectToDatabase();

    const users = await User.find(query).sort(sort).skip(skipamount).limit(pageSize);

    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipamount + pageSize


    return { users, isNext };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    // Connect to the database (assuming connectToDatabase() establishes the connection)
    await connectToDatabase();

    const { userId, questionId } = params;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.saved.includes(questionId);

    // Toggle save/unsave question
    if (isQuestionSaved) {
      // If question is already saved, remove it from saved questions
      await User.findByIdAndUpdate(userId, {
        $pull: { saved: questionId }
      });
    } else {
      // If question is not saved, add it to saved questions
      await User.findByIdAndUpdate(userId, {
        $addToSet: { saved: questionId }
      });
    }

    // Return updated user or a success message
    return { message: 'Question toggled successfully' };
  } catch (error) {
    console.error("Error toggling question:", error);
    throw error;
  }
}


export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    await connectToDatabase();

    const { clerkId, searchQuery, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize

    const query: FilterQuery<typeof Question> = searchQuery ?
      { title: { $regex: new RegExp(searchQuery, 'i') } } : {}

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize + 1
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' }
      ]
    });

    const totalQuestions = user?.saved.length || 0;

    const isNext = totalQuestions > skipAmount + pageSize

    if (!user) {
      throw new Error("User not found");
    }



    const savedQuestions = user.saved

    return {
      question: savedQuestions,
      isNext
    }
  } catch (error) {
    console.error("Error fetching saved questions:", error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error('User not found');
    }

    const totalquestions = await Question.countDocuments({ author: user._id });
    const totalanswers = await Answer.countDocuments({ author: user._id });

    return {
      user,
      totalquestions,
      totalanswers

    }
  }
  catch (error) {
    console.error(error);
    throw error;
  }
}
// Export the function

