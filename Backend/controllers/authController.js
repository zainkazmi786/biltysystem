import auth from "../models/authModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import { generateToken } from "../helpers/tokenHelper.js";

// Register Controller
export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body;

        // Validations
        if (!name) return res.send({ error: "Name is required" });
        if (!email) return res.send({ error: "Email is required" });
        if (!password) return res.send({ error: "Password is required" });
        if (!phone) return res.send({ error: "Phone number is required" });
        if (!address) return res.send({ error: "Address is required" });
        if (!answer) return res.send({ error: "Security answer is required" });

        // Check if user exists
        const existingUser = await auth.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: true,
                message: "User already registered. Please log in.",
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Save the new user
        const user = await new auth({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            answer,
        }).save();

        res.status(201).send({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error during registration",
            error,
        });
    }
};

// Login Controller
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: "Email and password are required",
            });
        }

        // Check user
        const user = await auth.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not registered",
            });
        }

        // Check password
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Incorrect password",
            });
        }

        // Generate JWT token
        const token = await generateToken(user);

        res.status(200).send({
            success: true,
            message: "Logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Login failed",
            error,
        });
    }
};

export const getUserProfileController = async (req, res) => {

    try {

        console.log(req.user);
        const userId = req.user._id;

        // Find user by ID and exclude password
        const user = await auth.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "User profile fetched successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                answer: user.answer // Include if needed for security questions
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error fetching user profile",
            error,
        });
    }
};
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body
        if (!email) {
            return res.status(404).send({
                success: false,
                message: "Email is require",
            });
        }
        if (!answer) {
            return res.status(404).send({
                success: false,
                message: "answer is require",
            });
        } if (!newPassword) {
            return res.status(404).send({
                success: false,
                message: "newPassword is require",
            });
        }
        ///////checkkkkkkkkkkkkkkkkkkk
        const user = await auth.findOne({ email, answer })
        ///////////////validation
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "wrong email or answer",
            });
        }

        const hashed = await hashPassword(newPassword);
        await auth.findByIdAndUpdate(user._id, { password: hashed });
        res.status(200).send({
            success: true,
            message: "password reset sucessfull",
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error" + error

        });
    }
}



//test controller
export const testController = (req, res) => {
    try {
        res.send("Protected Routes");
    } catch (error) {
        console.log(error);
        res.send({ error });
    }
};
//update prfole
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const userId = req.user._id;

        // Fetch the current user
        const user = await auth.findById(userId); // Change from users to auth
        // const user = await users.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate the new password, if provided
        if (password && password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Hash the new password if provided
        const hashedPassword = password ? await hashPassword(password) : undefined;

        // Update the user fields
        const updatedUser = await auth.findByIdAndUpdate( // Change from users to auth
            userId,
            {
                name: name || user.name,
                email: email || user.email,
                password: hashedPassword || user.password,
                phone: phone || user.phone,
                address: address || user.address,
            },
            { new: true }
        );

        res.status(200).send({
            success: true,
            message: "Profile updated successfully",
            updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while updating profile",
            error,
        });
    }
};