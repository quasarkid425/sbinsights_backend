import express from "express";
import { setUpTaxes } from "../controllers/taxes.js";

const taxRouter = express.Router();
taxRouter.post("/", setUpTaxes);

export default taxRouter;
