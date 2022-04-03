import express from "express";
import {
  addEmployee,
  updateEmployeeInfo,
  removeEmployee,
  setWage,
  submitPayEntry,
  removePayEntry,
  retrieveEmployeeData,
} from "../controllers/employees.js";

const employeeRouter = express.Router();
employeeRouter.post("/", addEmployee);
employeeRouter.post("/wage", setWage);
employeeRouter.post("/pay", submitPayEntry);
employeeRouter.get("/empData/:slug/:emp", retrieveEmployeeData);
employeeRouter.put("/", updateEmployeeInfo);
employeeRouter.delete("/", removeEmployee);
employeeRouter.delete("/removePaidEntry", removePayEntry);

export default employeeRouter;
