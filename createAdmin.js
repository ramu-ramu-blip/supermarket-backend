import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminData = {
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'admin123',
            role: 'admin'
        };

        const existingUser = await User.findOne({ email: adminData.email });
        if (existingUser) {
            console.log('User already exists!');
            process.exit(0);
        }

        const user = new User(adminData);
        await user.save();

        console.log('Admin user created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
