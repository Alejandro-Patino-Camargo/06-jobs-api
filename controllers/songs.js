/** set up functions for routes */
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const Song = require('../models/Song');

const getAllSongs = async (req, res) => {
    const songs = await Song.find({ createdBy: req.user.userId });
    res.status(StatusCodes.OK).json({ songs, count: songs.length });

}

const getSong = async (req, res) => {
    const {
        user: { userId },
        params: { id: songId }
    } = req;

    const song = await Song.findOne({
        _id: songId, createdBy: userId
    })
    if (!song) {
        throw new NotFoundError(`no song with the id ${songId}`)
    }
    res.status(StatusCodes.OK).json({ song })
}

const createSong = async (req, res) => {
    req.body.createdBy = req.user.userId;
    const song = await Song.create(req.body);
    res.status(StatusCodes.CREATED).json({ song })
}

const updateSong = async (req, res) => {
    const {
        body: { artist, song },
        user: { userId },
        params: { id: songId }
    } = req;

    /* validating inputs */
    if (artist === '' || song === '') {
        throw new BadRequestError('Artist or song fields cannot be empty')
    }
    const songs = await Song.findByIdAndUpdate({
        _id: songId, createdBy: userId
    },
        req.body,
        { new: true, runValidators: true })

    if (!songs) {
        throw new NotFoundError(`no song with the id ${songId}`)
    }
    res.status(StatusCodes.OK).json({ songs })
}

const deleteSong = async (req, res) => {
    const {
        body: { artist, song },
        user: { userId },
        params: { id: songId }
    } = req;

    const songs = await Song.findByIdAndRemove({
        _id: songId,
        createdBy: userId
    })
    if (!songs) {
        throw new NotFoundError(`no song with the id ${songId}`)
    }
    res.status(StatusCodes.OK).json({ msg: "The song was deleted." })
}

module.exports = {
    getAllSongs,
    getSong,
    createSong,
    updateSong,
    deleteSong,
}