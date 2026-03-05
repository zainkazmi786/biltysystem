import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
    
    });
    console.log(`Connected to MongoDB Database: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error in MongoDB Connection: ${error}`);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;
