const mongoose = require('mongoose')

const SongSchema = new mongoose.Schema(
    {
        artist: {
            type: String,
            required: [true, 'Please provide an artist name'],
            maxlength: 50,
        },
        song: {
            type: String,
            required: [true, 'Please provide a song'],
            maxlength: 100,
        },
        genre: {
            type: String,
            enum: ['R&B', 'Hip-Hop', 'Rock', 'other'],
            default: 'other',
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide user'],
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Song', SongSchema)
