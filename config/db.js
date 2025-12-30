import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "supermarket",
        });

        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // In local dev we might want to exit, but in serverless we just throw
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
};

export default connectDB;
