"use server"

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import Interaction from "@/database/Interaction.model";



export async function viewQuestion(params: ViewQuestionParams) {
  try {
    connectToDatabase()

    const { questionId, userId } = params

    if (userId) {
      const exsisting_Interaction = await Interaction.findOne({
        user: userId,
        action: "view",
        question: questionId
      })

      if (exsisting_Interaction) {
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