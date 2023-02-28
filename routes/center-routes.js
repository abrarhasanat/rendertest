const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const personController = require("../controllers/person-controllers");
const router = express.Router();
const centerController = require("../controllers/center-controllers");

router.post("/login", centerController.login);
router.post("/login/update_vacc_info", centerController.update_vacc_info);
router.post("/set_appointment", centerController.set_appointment);
router.get("/:cid", centerController.getCenterInfo);
router.post("/:cid/update_storage", centerController.update_storage);
router.post("/:cid/islegal", centerController.islegal);
router.post("/:cid/bid", centerController.bid);
router.get("/:pid/getPersonInfo", centerController.getPersonInfo);
//router.post("/login/create_appointment",centerController.create_appointment);
module.exports = router;
