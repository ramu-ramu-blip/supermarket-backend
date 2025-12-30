import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const addAdmin = async () => {
    // Usage: node addAdmin.js <name> <email> <password>
    const [name, email, password] = process.argv.slice(2);

    if (!name || !email || !password) {
        console.log('Usage: node addAdmin.js <name> <email> <password>');
        process.exit(1);
    }

    try {
        await connectDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`User with email ${email} already exists!`);
            process.exit(0);
        }

        const user = new User({
            name,
            email,
            password,
            role: 'admin'
        });

        await user.save();

        console.log(`Admin user ${name} (${email}) created successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

addAdmin();
