import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://k3lsonvictor:DdPo4SyENrm0HoOH@cluster0.nn7smcn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Altere para sua URI

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado ao MongoDB!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};