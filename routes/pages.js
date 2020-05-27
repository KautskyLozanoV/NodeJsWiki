const express = require("express");
const bodyParser = require('body-parser');

const PageController = require("../controllers/pages");
const router = express.Router();

router.get("", PageController.searchPages);

router.get("/:id", PageController.getPage);

router.get("/:id/version/:version/:next?", PageController.getPageVersion);

router.get("/:id/history", PageController.getPageHistory);

router.post("", bodyParser.json(), PageController.addPage)

router.put("", bodyParser.json(), PageController.updatePage)

module.exports = router;
