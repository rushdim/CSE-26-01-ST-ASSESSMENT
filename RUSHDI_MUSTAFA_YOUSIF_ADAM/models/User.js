const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: true, 
        minlength: 2 // Rule: Must be at least 2 characters
    },
    lastName: { 
        type: String, 
        required: true, 
        minlength: 2 // Rule: Must be at least 2 characters
    },
    dob: { 
        type: Date, 
        required: true // Rule: Required for age/eligibility
    },
    placeOfBirth: { 
        type: String, 
        required: true, 
        minlength: 2 // Rule: Must be at least 2 characters
    },
    gender: { 
        type: String, 
        default: 'female' // Rule: Female by default
    },
    nationality: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    settlementCamp: { type: String, required: true },
    dateJoined: { 
        type: Date, 
        required: true // Rule: Required for settlement tracking
    },
    password: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

// Security: Hash password before saving to MongoDB
// FIX: Removed 'next' parameter to solve "next is not a function" error
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // No next() call needed for async hooks
    } catch (err) {
        throw err; // Throw error to be caught by the server's catch block
    }
});


module.exports = mongoose.model('User', UserSchema);
