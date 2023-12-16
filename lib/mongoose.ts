import mongoose from "mongoose";

let isConnected: boolean = false; // Changed 'const' to 'let' to reassign this variable

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);
  // this will prevent unknown field query

  if (!process.env.MONGODB_URL) {
    return console.log("Missing MongoDB URL");
  }

  if (isConnected) {
    return console.log("mongodb is already connected");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "devflow", // name of the database
    });

    isConnected = true;
    console.log("MongoDB is connected");
  } catch (error) {
    console.log("Mongo DB connection failed", error);
  }
};
