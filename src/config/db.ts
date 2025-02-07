import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI!)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error(err);
    });
}

export default connectToDB;