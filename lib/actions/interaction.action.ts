"use server"

import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "@/database/Interaction.model";



export async function viewQuestion(params: ViewQuestionParams) {
  try {
    connectToDatabase()

    const { questionId, userId } = params

    if (userId) {
      const exsistingInteraction = await Interaction.findOne({
        user: userId,
        action: "view",
        question: questionId
      })

      if (exsistingInteraction) {
        return console.log("User has already viewed this question")
      }
      else {
        await Interaction.create({ user: userId, action: "view", question: questionId })
      }

    }

  } catch (error) {
    console.log(error);
    throw error
  }
}