"use server"

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "@/database/Interaction.model";



export async function viewQuestion(params: ViewQuestionParams) {
  try {
    connectToDatabase()
    const { questionId, userId } = params
    if (userId) {
      if (!questionId) {
        throw new Error("Question ID is required")
      }
      if (!userId) {
        throw new Error("User ID is required")
      }
      
      
      const exsistingInteraction = await Interaction.findOne({
        user: userId,
        action: "view",
        question: questionId
      })

      if (exsistingInteraction) {
        return console.error("User has already viewed this question")
      }
      else {
        await Question.findByIdAndUpdate(questionId, {
          $inc: { views: 1 }
        })
        await Interaction.create({ user: userId, action: "view", question: questionId })
      }
    }
  } catch (error) {
    console.error(error);
    throw error
  }
}