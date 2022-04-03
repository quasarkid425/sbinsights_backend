import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import userRouter from "./routes/users.js";
import accountRouter from "./routes/accounts.js";
import entryRouter from "./routes/entries.js";
import employeeRouter from "./routes/employees.js";
import expenseRouter from "./routes/expenses.js";
import taxRouter from "./routes/taxes.js";
const app = express();
app.use(cors());

app.use(express.json());
//cors

//middlewares
app.use(morgan("dev"));

dotenv.config();

//connecting db
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("Db connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/entries", entryRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/taxes", taxRouter);

//configuring port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
