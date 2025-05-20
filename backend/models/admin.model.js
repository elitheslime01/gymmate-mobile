import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    _fName: {
        type: String,
        required: true
    },
    _lName: {
        type: String,
        required: true
    },
    _gender: {
        type: String,
        required: true
    },
    _umakEmail: {
        type: String,
        required: true
    },
    _umakIDNum: {
        type: String,
        required: true
    },
    _role: {
        type: String,
        required: true
    },
    _password: {
        type: String,
        required: true
    },
    _activeStat: {
        type: Boolean,
        default: false,
        required: true
    },
    _dateReg: {
        type: Date,
        required: true
    },
    _lastLogin: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin