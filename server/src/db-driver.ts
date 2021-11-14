const mongoose = require("mongoose");
const { Schema } = mongoose;
require('dotenv').config();

const RoomSchema = new Schema({
    created_on: { type: String, required: true },
    roomID: { type: String, required: true }
})
const Room = mongoose.model('Room', RoomSchema);

export async function connect () {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
