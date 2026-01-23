import User from "../models/User.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

/**
 * Migration script to hash all plain text passwords in the database
 * Run this once to fix existing users with plain text passwords
 */
export const migratePasswordsToHash = async () => {
  try {
    console.log("🔐 Starting password migration...");

    const users = await User.find({}).select("+password");
    let hashedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      if (user.password && user.password.startsWith("$2")) {
        console.log(`⏭️  Skipping ${user.email} - already hashed`);
        skippedCount++;
        continue;
      }

      if (!user.password) {
        console.log(`⏭️  Skipping ${user.email} - no password`);
        skippedCount++;
        continue;
      }

      // Hash the plain text password
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        user.password = hashedPassword;
        await user.save();
        
        console.log(`✅ Hashed password for ${user.email}`);
        hashedCount++;
      } catch (err) {
        console.error(`❌ Error hashing password for ${user.email}:`, err.message);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Passwords hashed: ${hashedCount}`);
    console.log(`   - Passwords skipped: ${skippedCount}`);
  } catch (error) {
    console.error("💥 Migration failed:", error);
  }
};

export default migratePasswordsToHash;
