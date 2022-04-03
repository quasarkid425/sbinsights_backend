import User from "../models/User.js";
import mongoose from "mongoose";
import { getDateByYear } from "../utils/helpers.js";

export const addEmployee = async (req, res) => {
  const { user, newEmp } = req.body;
  newEmp.pay = {
    date: getDateByYear(),
    chartDate: getDateByYear(),
    hours: 0,
    wage: 0,
    total: 0,
    hourlyWage: 0,
  };
  newEmp.paidEntries = [];

  try {
    const existingUser = await User.findOne({ _id: user });
    await User.updateOne(
      { _id: existingUser._id },
      { $push: { employees: newEmp } },
      { new: true }
    );
    const employees = await User.findOne({ _id: user });
    const employee = employees.employees.find(
      (emp) => emp._id.toString() === newEmp._id
    );
    res.status(200).json(employee);
  } catch (error) {
    console.log(error);
  }
};

export const updateEmployeeInfo = async (req, res) => {
  const { slug, empNo, updatedEmp } = req.body;

  User.findOneAndUpdate(
    { slug: slug, "employees._id": empNo },
    {
      $set: {
        "employees.$.empFullName": updatedEmp.empFullName,
        "employees.$.empEmail": updatedEmp.empEmail,
        "employees.$.empPhoneNumber": updatedEmp.empPhoneNumber,
        "employees.$.empGender": updatedEmp.empGender,
        "employees.$.empAddress.empStreet": updatedEmp.empAddress.empStreet,
        "employees.$.empAddress.empCity": updatedEmp.empAddress.empCity,
        "employees.$.empAddress.empState": updatedEmp.empAddress.empState,
        "employees.$.empAddress.empZipCode": updatedEmp.empAddress.empZipCode,
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

export const removeEmployee = async (req, res) => {
  const { slug, empNo } = req.body;

  User.findOneAndUpdate(
    { slug: slug, "employees._id": empNo },
    { $pull: { employees: { _id: empNo } } },
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

export const setWage = async (req, res) => {
  const { slug, empNo, wage } = req.body;

  User.findOneAndUpdate(
    { slug: slug, "employees._id": empNo },
    {
      $set: {
        "employees.$.pay.hourlyWage": wage,
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

export const submitPayEntry = async (req, res) => {
  const { user, employee, entry } = req.body;

  entry.chartDate = entry.date;

  User.findOneAndUpdate(
    { _id: user, "employees._id": employee },
    {
      $push: {
        "employees.$.paidEntries": entry,
      },
    },
    {
      new: true,
    },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json("Updated...");
      }
    }
  );
};

export const removePayEntry = (req, res) => {
  const { user, employee, entries, entryIndex } = req.body;

  entries.splice(entryIndex, 1);

  User.findOneAndUpdate(
    { user: user, "employees._id": employee },
    {
      $set: {
        "employees.$.paidEntries": entries,
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
