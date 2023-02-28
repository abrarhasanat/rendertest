const oracledb = require("oracledb");
const express = require("express");
const res = require("express/lib/response");
const router = require("express-promise-router")();
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit=true;
var connection = undefined;
async function db_query(query, params) {
  if (connection === undefined) {
    console.log("database connected successfully");
    connection = await oracledb.getConnection({
      user: "vforall",
      password: "vforall",
      connectionString: "localhost/orcl",
    });
  }
  try {
    let result = await connection.execute(query, params);
    connection.commit();
    return {
      success: true,
      data: result.rows,
    };
  } catch (e) {
    return {
      error: e,
      success: false,
    };
  }
}
// async function getPerson(id) {
//   const q = `select * from person where birth_certificate_no=:1`;
//   const params = [id];
//   const result = await db_query(q, params);
//   return result;
// }
// async function getEmployee(id) {
//   const q = `select * from employees where employee_id=:1`;
//   const params = [id];
//   const result = await db_query(q, params);
//   return result;
// }
// async function getEmployees() {
//   const q = `select * from employees `;
//   const params = [];
//   const result = await db_query(q, params);
//   return result;
// }
// //getEmployee(90);
// //getEmployees();
// /// express ===================================
// router.get("/all", async function (req, res) {
//   const q = `select * from employees `;
//   const params = [];
//   const result = await db_query(q, params);
//   return res.status(200).json(result);
// });
// router.get("/:id", async function (req, res) {
//   const employeeId = req.params.id;
//   return res.status(200).json(await getEmployee(employeeId));
// });
// const app = express();
// app.use(router);
// app.listen(5001, function () {
//   console.log("sever started at port 3000");
// });

exports.db_query = db_query;
