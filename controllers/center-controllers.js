const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const connectDB = require("../connectDB");
const HttpError = require("../models/http-error");

const login = async (req, res, next) => {
  const { center_id, password } = req.body;
  const q = `select * from center_auth where center_id =:1 and password=:2`;
  const param = [center_id, password];
  const result = await connectDB.db_query(q, param);
  if (result.success == false) {
    return next(new HttpError("Unknown Error  Occured"));
  }
  console.log(result);

  if (!result.data.length) {
    return next(new HttpError("Wrong  or Center_ID"));
  }
  console.log(result.data[0]);
  res.status(201).json({ message: "logged in", center: result.data[0] });
};

const getPersonInfo = async (req, res, next) => {
  console.log("haha");
  const person_id = req.params.pid;
  // let q =
  //   "select vaccine_name,vaccination_date,dose_no from vaccination_info where person_id=:1";
  console.log(person_id);
  let q =
    "select * from center right join person on person.center_id = center.center_id where person_id=:1";

  const params = [person_id];
  let result1 = await connectDB.db_query(q, params);
  console.log(result1);
  if (!result1.success) return new HttpError("Unknow Error Occured");
  if (!result1.data) return next(new HttpError("Person Id does not exist"));
  if (result1.success == false)
    return next(new HttpError("Unknown Error Occured"));
  let q2 = "select phone_number from phone_directory where person_id=:1";
  res.status(200);
  let result2 = await connectDB.db_query(q2, params);
  res.json({
    message: "Success",
    person_info: result1.data[0],
    contact_info: result2.data[0],
  });
};

const getCenterInfo = async (req, res, next) => {
  const center_id = req.params.cid;
  //const q1 =
  //"select center_name,VACCINE_NAME,sum(ARRIVAL_DOSE-TOTAL_DISPATCHED) as available_doses from center join storage on (center.center_id=storage.CENTER_ID) where center.center_id=:1 GROUP BY center_name,VACCINE_NAME";
  const q1 =
    "select CENTER_NAME,vaccine_name,sum(ARRIVAL_DOSE)- " +
    "(select nvl(sum(total_vaccinated),0) from center_stat " +
    "where center_id=STORAGE.CENTER_ID and VACCINE_NAME=storage.VACCINE_NAME " +
    ") as available_doses " +
    "from STORAGE join center " +
    "on STORAGE.CENTER_ID=center.CENTER_ID " +
    "group by STORAGE.center_id,CENTER_NAME,VACCINE_NAME " +
    "having storage.center_id=:1 ";
  console.log(q1);
  const param1 = [center_id];
  const result1 = await connectDB.db_query(q1, param1);
  if (result1.success == false) {
    return next(new HttpError("Unknown error occured"));
  }
  console.log(result1);
  if (!result1.data.length) {
    return next(new HttpError("Error"));
  }
  res.status(201).json({ message: "Success!", center: result1.data });
};

const set_appointment = async (req, res, next) => {
  const { center_id, date, limit, dose_no, dose_interval } = req.body;
  var param = [date, limit, dose_no, center_id, dose_interval];
  var q = `begin set_appointment(to_date(:1,'yyyy-mm-dd'),:2,:3,:4,:5); end;`;
  var result = await connectDB.db_query(q, param);
  console.log(result);
  if (result.success)
    res.status(201).json({ message: "successfully created appointment" });
  else return next(new HttpError("Unknown Error occured"));
};

const update_vacc_info = async (req, res, next) => {
  const {
    person_id,
    vaccinator_id,
    vaccine_name,
    vaccination_date,
    dose_no,
    center_id,
  } = req.body;
  const q =
    "insert into vaccination_info values(:1,:2,:3," +
    "to_date(:4" +
    ",'yyyy-mm-dd')" +
    ",:5,:6)";
  console.log(q);
  const param = [
    person_id,
    vaccinator_id,
    vaccine_name,
    vaccination_date,
    dose_no,
    center_id,
  ];

  const result = await connectDB.db_query(q, param);
  console.log(result);
  if (result.success == true)
    res.status(201).json({ message: "successfully updated" });
  else res.status(500).json({ message: "not successful" });
};
const update_storage = async (req, res, next) => {
  var center_id = req.params.cid;
  const { vaccine_name, arrival_date, arrival_dose } = req.body;
  const param = [center_id, vaccine_name, arrival_date, arrival_dose];
  const q = "begin update_storage(:1,:2,to_date(:3,'yyyy-mm-dd'),:4); end;";
  const result = await connectDB.db_query(q, param);
  if (result.success == true)
    res.status(201).json({ message: "successfully updated" });
  else res.status(500).json({ message: "not successful" });
};

const islegal = async (req, res, next) => {
  var center_id = req.params.cid;
  const { person_id, date, dose_no } = req.body;
  console.log(person_id, date, dose_no);
  const param = [person_id, date, dose_no];
  const q = "select islegal(:1,to_date(:2,'yyyy-mm-dd'),:3) as flag from dual";
  const result = await connectDB.db_query(q, param);
  if (result.success == false)
    return next(new HttpError("Unknown Error Occured"));
  console.log(result.data);
  if (result.data[0].FLAG) res.status(201).json({ message: "legal" });
  else res.status(404).json({ message: "not legal" });
};

const bid = async (req, res, next) => {
  var { birth_certificate_no } = req.body;
  var param = [birth_certificate_no];
  var q = "select person_id from person where birth_certificate_no=:1";
  const result = await connectDB.db_query(q, param);
  if (result.success == false) res.status(500).json({ message: "Error" });
  if (result.data.length) res.status(201).json({ person_id: result.data[0] });
  else res.status(500).json({ message: "Person not found" });
};
//  res.status(404).json({ body: "Unknown error occured" });

exports.login = login;
exports.update_vacc_info = update_vacc_info;
exports.set_appointment = set_appointment;
exports.getCenterInfo = getCenterInfo;
exports.update_storage = update_storage;
exports.islegal = islegal;
exports.bid = bid;
exports.getPersonInfo = getPersonInfo;
