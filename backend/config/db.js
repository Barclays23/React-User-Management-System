import mongoose from 'mongoose';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected to ', process.env.MONGO_URI);

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process on connection failure
  }
};

export default connectDB;