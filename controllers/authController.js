






import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone: user.phone,
            supermarketName: user.supermarketName,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone: user.phone,
            supermarketName: user.supermarketName,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const updateProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.address = req.body.address || user.address;
        user.phone = req.body.phone || user.phone;
        user.supermarketName = req.body.supermarketName || user.supermarketName;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            address: updatedUser.address,
            phone: updatedUser.phone,
            supermarketName: updatedUser.supermarketName,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const createAdmin = async (req, res) => {
    const { name, email, password, supermarketName, phone, address } = req.body;

    // Safety check: ensure at least email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Explicitly set role to admin
    const user = await User.create({
        name: name || 'Admin',
        email,
        password,
        role: 'admin',
        supermarketName: supermarketName || 'SUPER_MARKET',
        phone: phone || '',
        address: address || ''
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            supermarketName: user.supermarketName,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid admin data' });
    }
};

export { registerUser, loginUser, updateProfile, createAdmin };
