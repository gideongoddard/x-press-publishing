const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');
const artistsRouter = express.Router();

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get("SELECT * FROM Artist WHERE id = $artistId", {
        $artistId = artistId
    }, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.artist = row;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

artistsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: rows});
        }
    })
})

module.exports = artistsRouter;