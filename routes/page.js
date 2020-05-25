const express = require("express");
const bodyParser = require('body-parser');

const PageController = require("../controllers/page");
const router = express.Router();

router.get("", PageController.searchPages);

router.head("", PageController.getPages);

router.get("/:id", PageController.getPage);

router.post("", bodyParser.json(), PageController.addPage)

router.put("", bodyParser.json(), PageController.updatePage)

module.exports = router;
