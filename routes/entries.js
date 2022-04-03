import express from "express";
import {
  submitEntry,
  saveEntries,
  clearEntries,
} from "../controllers/entries.js";
const entryRouter = express.Router();
entryRouter.post("/", submitEntry);
entryRouter.post("/save", saveEntries);
entryRouter.delete("/clear", clearEntries);
export default entryRouter;
