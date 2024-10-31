"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetQuestionsByTagIdParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();

    const { userId } = params;
    const user = await User.findById(userId);

    if (!user) throw new Error(" User not found ");
    // Find interactions for the user and group by tags
    return [
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" },
      { _id: "3", name: "tag3" },
    ];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAllTags(params: GetAllTagsParams) {

  const { searchQuery, page = 1, pageSize = 10 } = params;

  const skipAmount = (page - 1) * pageSize;

  const query: FilterQuery<ITag> = {}

  if (searchQuery) {
    query.$or = [
      { name: { $regex: new RegExp(`^${searchQuery}$`, "i") } },
      { description: { $regex: new RegExp(`^${searchQuery}$`, "i") } },
    ]
  }
  try {
    connectToDatabase();

    const tags = await Tag.find(query)
      .skip(skipAmount)
      .limit(pageSize + 1)
      ;

    const totalTags = await Tag.countDocuments(query);
    const isNext = totalTags > skipAmount + tags.length;

    return { tags: tags, totalTags, isNext };
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectToDatabase();

    const { tagId, page = 1, pageSize = 10, searchQuery } = params;
    const skipAmount = (page - 1) * pageSize;

    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: 'i' } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize + 1 // +1 to check if there is next page
      },
      populate: [
        { path: 'tags', model: Tag, select: "_id name" },
        { path: 'author', model: User, select: '_id clerkId name picture' }
      ]
    })

    if (!tag) {
      throw new Error('Tag not found');
    }

    const isNext = tag.questions.length > pageSize;

    const questions = tag.questions;

    return { tagTitle: tag.name, questions, isNext };

  } catch (error) {
    console.error(error);
    throw error;
  }
}




export async function getPopularTags() {
  try {
    const Populartags = await Tag.aggregate([
      {
        $project: {
          name: 1,
          questionCount: { $size: '$questions' }
        }
      },
      { $sort: { questionCount: -1 } },
      { $limit: 5 }
    ]);

    return Populartags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}