import User from "../models/User.js";
import {
  billedWeeklyPaidUnpaid,
  billedWeeklyPaid,
  billedWeeklyUnPaid,
  allData,
} from "../utils/aggregateHelpers.js";
import mongoose from "mongoose";
export const addAccount = async (req, res) => {
  const { user, newAcc } = req.body;

  try {
    const existingUser = await User.findOne({ _id: user });

    await User.updateOne(
      { _id: existingUser._id },
      { $push: { accounts: newAcc } },
      { new: true }
    );

    const accounts = await User.findOne({ _id: user });

    const account = accounts.accounts.find(
      (acc) => acc._id.toString() === newAcc._id
    );

    res.status(200).json(account);
  } catch (error) {
    console.log(error);
  }
};

export const updateAccountInfo = async (req, res) => {
  const { slug, accNo, updatedAcc } = req.body;

  User.findOneAndUpdate(
    { slug: slug, "accounts._id": accNo },
    {
      $set: {
        "accounts.$.accFullName": updatedAcc.accFullName,
        "accounts.$.accEmail": updatedAcc.accEmail,
        "accounts.$.accPhoneNumber": updatedAcc.accPhoneNumber,
        "accounts.$.accAddress.addrFullName":
          updatedAcc.accAddress.addrFullName,
        "accounts.$.accAddress.addrStreet": updatedAcc.accAddress.addrStreet,
        "accounts.$.accAddress.addrCity": updatedAcc.accAddress.addrCity,
        "accounts.$.accAddress.addrState": updatedAcc.accAddress.addrState,
        "accounts.$.accAddress.addrZipCode": updatedAcc.accAddress.addrZipCode,
      },
    },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("Document updated successfully...");
        res.status(200).json("Updated...");
      }
    }
  );
};

export const removeAccount = async (req, res) => {
  const { slug, accNo } = req.body;

  User.findOneAndUpdate(
    { slug: slug, "accounts._id": accNo },
    { $pull: { accounts: { _id: accNo } } },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("Document deleted successfully...");
        res.status(200).json("Deleted...");
      }
    }
  );
};

export const cityCount = async (req, res) => {
  const { slug } = req.params;

  const count = await User.aggregate([
    {
      $match: { slug: slug },
    },
    {
      $unwind: "$accounts",
    },
    {
      $group: {
        _id: {
          __alias_0: "$accounts.accAddress.addrCity",
        },
        __alias_1: {
          $sum: {
            $cond: [
              {
                $ne: [
                  {
                    $type: "$__v",
                  },
                  "missing",
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        __alias_0: "$_id.__alias_0",
        __alias_1: 1,
      },
    },
    {
      $project: {
        value: "$__alias_1",
        label: "$__alias_0",
        _id: 0,
      },
    },
    {
      $addFields: {
        __agg_sum: {
          $sum: ["$value"],
        },
      },
    },
    {
      $sort: {
        __agg_sum: -1,
      },
    },
    {
      $project: {
        __agg_sum: 0,
      },
    },
    {
      $limit: 5000,
    },
  ]);

  res.status(200).json(count);
};

export const pay = async (req, res) => {
  const { user, account, services, serviceIndex } = req.body;

  services[serviceIndex].paid = true;

  User.findOneAndUpdate(
    { user: user, "accounts._id": account },
    {
      $set: {
        "accounts.$.services": services,
      },
    },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("Document updated successfully...");
        res.status(200).json("Updated...");
      }
    }
  );
};

export const unPay = async (req, res) => {
  const { user, account, services, serviceIndex } = req.body;

  services[serviceIndex].paid = false;

  User.findOneAndUpdate(
    { user: user, "accounts._id": account },
    {
      $set: {
        "accounts.$.services": services,
      },
    },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("Document updated successfully...");
        res.status(200).json("Updated...");
      }
    }
  );
};

export const removeEntry = async (req, res) => {
  const { user, account, services, serviceIndex } = req.body;

  services.splice(serviceIndex, 1);

  User.findOneAndUpdate(
    { user: user, "accounts._id": account },
    {
      $set: {
        "accounts.$.services": services,
      },
    },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("Document updated successfully...");
        res.status(200).json("Updated...");
      }
    }
  );
};

export const invoiceDetails = (req, res) => {
  const { user, details } = req.body;

  User.findByIdAndUpdate(
    { _id: user },
    {
      "invoiceInfo.setUp": true,
      "invoiceInfo.address": details.address,
      "invoiceInfo.city": details.city,
      "invoiceInfo.state": details.state,
      "invoiceInfo.zip": details.zip,
      "invoiceInfo.phone": details.phone,
      "invoiceInfo.signature": details.signature,
    },

    function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Updated successfully...");
        res.status(200).json("Updated...");
      }
    }
  );
};

export const retrieveEmployeeData = async (req, res) => {
  const { slug, emp } = req.params;

  const data = await User.aggregate([
    {
      $match: {
        slug: slug,
      },
    },
    {
      $unwind: "$employees",
    },
    {
      $match: {
        "employees._id": mongoose.Types.ObjectId(emp),
      },
    },
    {
      $unwind: "$employees.paidEntries",
    },

    {
      $addFields: {
        "employees.paidEntries.chartDate": {
          $cond: {
            if: {
              $eq: [
                {
                  $type: "$employees.paidEntries.chartDate",
                },
                "date",
              ],
            },
            then: "$employees.paidEntries.chartDate",
            else: null,
          },
        },
      },
    },
    {
      $addFields: {
        __alias_0: {
          year: {
            $year: "$employees.paidEntries.chartDate",
          },
          month: {
            $subtract: [
              {
                $month: "$employees.paidEntries.chartDate",
              },
              1,
            ],
          },
          date: {
            $dayOfMonth: "$employees.paidEntries.chartDate",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          __alias_0: "$__alias_0",
        },
        __alias_1: {
          $sum: "$employees.paidEntries.total",
        },
      },
    },
    {
      $project: {
        _id: 0,
        __alias_0: "$_id.__alias_0",
        __alias_1: 1,
      },
    },
    {
      $project: {
        y: "$__alias_1",
        x: "$__alias_0",
        _id: 0,
      },
    },
    {
      $sort: {
        "x.year": 1,
        "x.month": 1,
        "x.date": 1,
      },
    },
    {
      $limit: 5000,
    },
  ]);

  res.status(200).json(data);
};

export const retrieveAccountData = async (req, res) => {
  const { slug, acc } = req.params;

  const data = await User.aggregate([
    {
      $match: {
        slug: slug,
      },
    },
    {
      $unwind: "$accounts",
    },
    {
      $match: {
        "accounts._id": mongoose.Types.ObjectId(acc),
      },
    },
    {
      $unwind: "$accounts.services",
    },

    {
      $addFields: {
        "accounts.services.chartDate": {
          $cond: {
            if: {
              $eq: [
                {
                  $type: "$accounts.services.chartDate",
                },
                "date",
              ],
            },
            then: "$accounts.services.chartDate",
            else: null,
          },
        },
      },
    },
    {
      $addFields: {
        __alias_0: {
          year: {
            $year: "$accounts.services.chartDate",
          },
          month: {
            $subtract: [
              {
                $month: "$accounts.services.chartDate",
              },
              1,
            ],
          },
          date: {
            $dayOfMonth: "$accounts.services.chartDate",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          __alias_0: "$__alias_0",
        },
        __alias_1: {
          $sum: "$accounts.services.total",
        },
      },
    },
    {
      $project: {
        _id: 0,
        __alias_0: "$_id.__alias_0",
        __alias_1: 1,
      },
    },
    {
      $project: {
        x: "$__alias_0",
        y: "$__alias_1",
        _id: 0,
      },
    },
    {
      $sort: {
        "x.year": 1,
        "x.month": 1,
        "x.date": 1,
      },
    },
    {
      $limit: 5000,
    },
  ]);

  res.status(200).json(data);
};

export const chartData = async (req, res) => {
  const { slug, type } = req.params;
  switch (type) {
    case "billed-paid-unpaid-weekly":
      const puData = await billedWeeklyPaidUnpaid(slug);
      res.status(200).json({
        title: "Total Profit Paid & Unpaid Billed Accounts - Weekly",
        data: puData,
      });
      break;
    case "billed-paid-weekly":
      const pData = await billedWeeklyPaid(slug);
      res.status(200).json({
        title: "Total Profit Paid Billed Accounts - Weekly",
        data: pData,
      });
      break;
    case "billed-unpaid-weekly":
      const uData = await billedWeeklyUnPaid(slug);
      res.status(200).json({
        title: "Total Profit Unpaid Billed Accounts - Weekly",
        data: uData,
      });
      break;
    case "billed-paid-unpaid-saved-weekly":
      const sData = await allData(slug);
      res.status(200).json({
        title: "Potential Profit Billed Paid Unpaid Saved - Weekly",
        data: sData,
      });
      break;
  }
};
