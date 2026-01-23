import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "user",
    });

    await user.save();

    // Generate token for the newly registered user
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`\n🔵 LOGIN ATTEMPT - Email: ${email}`);

    // Validation
    if (!email || !password) {
      console.log(`❌ Missing fields - Email: ${!email}, Password: ${!password}`);
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user
    console.log(`🔍 Searching for user with email: ${email}`);
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      console.log(`❌ User not found for email: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ User found: ${user.name} (ID: ${user._id})`);
    console.log(`📧 User email: ${user.email}`);
    console.log(`👤 User role: ${user.role}`);
    console.log(`🔐 Stored password hash exists: ${!!user.password}`);
    console.log(`🔐 Password hash length: ${user.password?.length || 0}`);
    console.log(`📝 Entered password length: ${password.length}`);

    // Check password
    console.log(`🔐 Comparing passwords...`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log(`🔐 Password comparison result: ${isPasswordValid}`);
    console.log(`🔐 Entered password: ${password.substring(0, 3)}***${password.substring(password.length - 2)}`);
    
    if (!isPasswordValid) {
      console.log(`❌ PASSWORD MISMATCH for email: ${email}`);
      console.log(`❌ Stored hash: ${user.password.substring(0, 20)}...`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`✅ Password valid!`);

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ Token generated successfully`);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error(`💥 LOGIN ERROR:`, error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const logout = (req, res) => {
  res.json({ message: "Logout successful" });
};
