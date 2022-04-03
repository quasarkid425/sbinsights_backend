import express from "express";
import {
  updateAccountInfo,
  removeAccount,
  cityCount,
  addAccount,
  pay,
  unPay,
  removeEntry,
  invoiceDetails,
  retrieveAccountData,
  chartData,
} from "../controllers/accounts.js";

const accountRouter = express.Router();

accountRouter.post("/", addAccount);
accountRouter.post("/invoice", invoiceDetails);
accountRouter.get("/count/:slug", cityCount);
accountRouter.get("/accData/:slug/:acc", retrieveAccountData);
accountRouter.get("/chart/:slug/:type", chartData);
accountRouter.put("/", updateAccountInfo);
accountRouter.put("/pay", pay);
accountRouter.put("/unPay", unPay);
accountRouter.delete("/", removeAccount);
accountRouter.delete("/removeEntry", removeEntry);

export default accountRouter;
