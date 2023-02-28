const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const personController = require("../controllers/person-controllers");
const router = express.Router();

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("birth_certificate_no").not().isEmpty(),
    check("phone_number").not().isEmpty(),
    check("date_of_birth").isDate(),
    check("present_address").not().isEmpty(),
    check("permanent_address").not().isEmpty(),
  ],
  personController.signup
);

router.post("/login", personController.login);
router.post("/login/:pid/view_certificate", personController.view_certificate);
router.get("/getDivision",personController.getDivision);
router.post("/getDistrictByDivision",personController.getDistrictByDivision);
router.post("/getThanaByDistrict",personController.getThanaByDistrict);
router.post("/getCenterByThana",personController.getCenterByThana);
router.get("/:pid/getPersonInfo", personController.getPersonInfo);
router.patch("/:pid/updateInfo",personController.updateInfo);
module.exports = router;
