// modules
const express = require("express"),
  router = express.Router();

const Battlelog = require("../../schemas/playertag/battlelog_schema");

router.param("player", function(req, res, next, id) {
  Battlelog.find({ id }, function(err, doc) {
    if (err) return res.json({ succes: false, error: err });
    return res.json({ succes: true, doc: doc });
  });
});

router.get("/:player", function(req, res, next) {});

module.exports = router;
