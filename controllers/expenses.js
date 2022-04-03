import User from "../models/User.js";

export const addExpense = async (req, res) => {
  const { user, entry } = req.body;
  const newDate = entry.date.split("-");
  const newExpenseDate = `${newDate[1]}-${newDate[2]}-${newDate[0]}`;
  const expEntry = {
    date: newExpenseDate,
    chartDate: newExpenseDate,
    amount: entry.amount,
    desc: entry.desc,
  };
  try {
    await User.updateOne(
      { _id: user },
      { $push: { expenses: expEntry } },
      { new: true }
    );
    res.status(200).json("Inserted ...");
  } catch (error) {
    console.log(error);
  }
};

export const updateQuickExps = async (req, res) => {
  const { user, quickExpenses } = req.body;
  User.findOneAndUpdate(
    { _id: user },
    {
      $set: {
        quickExpAmount: quickExpenses.amount,
        quickExpDesc: quickExpenses.desc,
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

export const removeExpense = async (req, res) => {
  const { user, expenses, index } = req.body;

  expenses.splice(index, 1);

  const newExpenses = expenses.map((exp) => {
    return { ...exp, chartDate: exp.date };
  });

  User.findOneAndUpdate(
    { _id: user },
    {
      $set: {
        expenses: newExpenses,
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

export const retrieveExpenseData = async (req, res) => {
  const { slug } = req.params;

  const data = await User.aggregate([
    {
      $match: {
        slug: slug,
      },
    },
    {
      $unwind: "$expenses",
    },
    {
      $group: {
        _id: {
          __alias_0: "$expenses.desc",
        },
        __alias_1: {
          $sum: "$expenses.amount",
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
      $addFields: {
        __agg_sum: {
          $sum: ["$y"],
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

  res.status(200).json(data);
};
