const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const connectDB = require("../connectDB");
const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "test@test.com",
    password: "testers",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }
  const {
    name,
    birth_certificate_no,
    phone_number,
    date_of_birth,
    present_address,
    permanent_address,
  } = req.body;
  const q = `select  * from Person where Birth_Certificate_No =:1`;
  const params = [birth_certificate_no];
  const result = await connectDB.db_query(q, params);
  console.log(result);
  if (result.data.length) {
    const error = new HttpError("Could not create user, already exists.", 422);
    return next(error);
  }

  const createdUser = {
    id: uuid(),
    name,
    birth_certificate_no,
    phone_number,
    date_of_birth,
    present_address,
    permanent_address,
  };
  const insert_query =
    "insert into Person values('" +
    createdUser.id +
    "'," +
    createdUser.birth_certificate_no +
    ",'" +
    createdUser.name +
    "','" +
    createdUser.present_address +
    "','" +
    createdUser.permanent_address +
    "'," +
    "to_date('" +
    createdUser.date_of_birth +
    " ', 'yyyy-mm-dd'),sysdate,null) ";
  const insert_phone_dir =
    "insert into phone_directory values('" +
    createdUser.id +
    "','" +
    phone_number +
    "')";
  prems = [];
  const ins_res = await connectDB.db_query(insert_query, prems);
  const ins_pd = await connectDB.db_query(insert_phone_dir, prems);
  console.log(ins_pd);
  console.log(insert_phone_dir);
  if (ins_res.success == false || ins_pd.success == false) {
    return next(new HttpError("Unknown Error Occured"));
  }
  console.log(ins_res);
  console.log(ins_pd);
  //console.log(ins_res) ;
  res.status(201).json({ person: createdUser });
};

const login = async (req, res, next) => {
  const { birth_certificate_no, date_of_birth } = req.body;
  var q = `select * from Person where Birth_Certificate_No=:1 and date_of_birth=to_date(:2, 'YYYY-MM-DD')`;
  var params = [birth_certificate_no, date_of_birth];

  let result = await connectDB.db_query(q, params);
  if (result.success == false) {
    return next(new HttpError("Unknown Error Occured"), 500);
  }
  if (!result.data.length) {
    const error = new HttpError("User does not exist.", 404);
    return next(error);
  }
  params = [result.data[0].PERSON_ID];
  q =
    "select vaccine_name,vaccination_date,dose_no from vaccination_info where person_id=:1";
  let result1 = await connectDB.db_query(q, params);
  res.status(200);
  res.json({
    message: "Logged in!",
    person: result.data[0],
  });
};

// const getPersonInfo = async (req, res, next) => {
//   const person_id = req.params.pid;
//   const q =
//   'select center_name,vaccine_name,vaccination_date,dose_no from vaccination_info vi '+
//   'join center c on vi.center_id=c.center_id where person_id=:1';
//   const params = [person_id];
//   let result1 = await connectDB.db_query(q, params);
//   if (!result1.data) return next(new HttpError("Person Id does not exist"));
//   if (result1.success == false)
//     return next(new HttpError("Unknown Error Occured"));
//   res.status(200);
//   res.json({
//     message: "Success",
//     vaccination_info: result1.data,
//   });
// };

const getPersonInfo = async (req, res, next) => {
  const person_id = req.params.pid;
  // let q =
  //   "select vaccine_name,vaccination_date,dose_no from vaccination_info where person_id=:1";
  let q =
    "select center_name,vaccine_name,vaccination_date,dose_no from vaccination_info vi " +
    "join center c on vi.center_id=c.center_id where person_id= trim(:1)";

  const params = [person_id];
  let result1 = await connectDB.db_query(q, params);
  if (!result1.data) return next(new HttpError("Person Id does not exist"));
  if (result1.success == false)
    return next(new HttpError("Unknown Error Occured"));

  q =
    "select name, birth_certificate_no,present_address, permanent_address, date_of_birth,center_id from person where person_id = :1";

  let result2 = await connectDB.db_query(q, params);

  if (result2.success == false) {
    return next(new HttpError("Unknown Error Occured"));
  }

  // console.log(result2.data);
  res.status(200);
  res.json({
    message: "Success",
    person_info: result2.data[0],
    vaccination_info: result1.data,
  });
};

const getDistrictByDivision = async (req, res, next) => {
  const { division } = req.body;
  console.log(division);
  const q = "select distinct district  from location where division=:1";
  const params = [division];
  let result1 = await connectDB.db_query(q, params);
  console.log(result1);
  if (!result1.data) return next(new HttpError("Error"));
  if (result1.success == false)
    return next(new HttpError("Unknown Error Occured"));
  res.status(200);
  res.json({
    message: "Success",
    district_list: result1.data,
  });
};

const view_certificate = async (req, res, next) => {
  var q = `select * from certificate_info where person_id=:1`;
  var params = [req.params.pid];
  let result = await connectDB.db_query(q, params);
  if (!result.data.length) {
    const error = new HttpError("Certificate not created yet", 404);
    return next(error);
  }
  q =
    "select vaccine_name,vaccination_date,dose_no from vaccination_info where person_id=:1";
  let result1 = await connectDB.db_query(q, params);
  q = "select * from person where person_id=:1";
  let result2 = await connectDB.db_query(q, params);
  q = "Begin insert into phone_directory values(2,01817082594); end;";
  params = [];
  let result3 = await connectDB.db_query(q, params);
  console.log(result3);
  res.status(200);
  res.json({
    person_info: result2.data,
    certificate_info: result.data,
    vaccination_info: result1.data,
  });
};

const getThanaByDistrict = async (req, res, next) => {
  const { district } = req.body;
  const q = "select distinct thana  from location where district=:1";
  const params = [district];
  let result1 = await connectDB.db_query(q, params);
  //console.log('Hello');
  if (!result1.data) return next(new HttpError("Error"));
  if (result1.success == false)
    return next(new HttpError("Unknown Error Occured"));
  res.status(200);
  res.json({
    message: "Success",
    thana_list: result1.data,
  });
};
const getCenterByThana = async (req, res, next) => {
  const { thana } = req.body;
  const q =
    "select center_id,center_name,center_incharge from location join center on location.location_id=center.location_id where Thana=:1";
  const params = [thana];
  let result1 = await connectDB.db_query(q, params);
  //console.log('Hello');
  if (!result1.data) return next(new HttpError("Error"));
  if (result1.success == false)
    return next(new HttpError("Unknown Error Occured"));
  res.status(200);
  res.json({
    message: "Success",
    center_list: result1.data,
  });
};
const updateInfo = async (req, res, next) => {
  const { name, present_address, permanent_address, center_id, phone_number } =
    req.body;
  const person_id = req.params.pid;
  const q =
    "update person set name=:1,present_address=:2,permanent_address=:3,center_id=:4 where person_id=:5";
  //const q="update person set name='Shakib Majumder' where name='Shakib'";
  const params = [
    name,
    present_address,
    permanent_address,
    center_id,
    person_id,
  ];
  let result1 = await connectDB.db_query(q, params);
  if (phone_number) {
    const q1 =
      "insert into phone_directory (person_id,phone_number) values(:1,:2)";
    const params1 = [person_id, phone_number];
    let result2 = await connectDB.db_query(q1, params1);
    if (result2.success == false)
      return next(new HttpError("Unknown Error Occured"));
  }
  if (result1.success == false)
    return next(new HttpError("Unknown Error Occured"));

  res.status(200);
  res.json({
    message: "Success",
  });
};
const getDivision = async (req, res, next) => {
  const q = "select distinct division  from location";
  //const q="update person set name='Shakib Majumder' where name='Shakib'";
  const params = [];
  let result1 = await connectDB.db_query(q, params);
  if (result1.success == false)
    return next(new HttpError("Unknown Error Occured"));
  res.status(200);
  console.log(result1.data);
  res.json({
    division_list: result1.data,
  });
};
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.view_certificate = view_certificate;
exports.getPersonInfo = getPersonInfo;
exports.getDistrictByDivision = getDistrictByDivision;
exports.getThanaByDistrict = getThanaByDistrict;
exports.getCenterByThana = getCenterByThana;
exports.updateInfo = updateInfo;
exports.getDivision = getDivision;
