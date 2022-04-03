import express from "express";
import {
  addExpense,
  updateQuickExps,
  removeExpense,
  retrieveExpenseData,
} from "../controllers/expenses.js";

const expenseRouter = express.Router();
expenseRouter.post("/", addExpense);
expenseRouter.get("/expData/:slug", retrieveExpenseData);
expenseRouter.put("/quickExps", updateQuickExps);
expenseRouter.put("/remove", removeExpense);

export default expenseRouter;
