const express = require("express");
const bodyParser = require('body-parser');

const PageController = require("../controllers/page");
const router = express.Router();

router.get("", PageController.searchPages);

router.get("/:id", PageController.getPage);

router.post("", bodyParser.json(), PageController.addPage)

module.exports = router;
