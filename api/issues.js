const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABSE || './database.sqlite');
const issuesRouter = express.Router({mergeParams: true});

issuesRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Issue WHERE series_id = $seriesId`;
    const values = {$seriesId: req.params.seriesId};
    db.all(sql, values, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({issues: rows});
        }
    })
})

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const seriesId = req.params.seriesId;
    const sql = `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)
    VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`;
    const values = {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: seriesId
    };

    if (!name || !issueNumber || !publicationDate || !artistId) {
        return res.sendStatus(400);
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        }
        db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (err, row) => {
            if (err) {
                next(err);
            } else {
                res.status(201).json({issue: row});
            }
        })
    })
})

module.exports = issuesRouter;