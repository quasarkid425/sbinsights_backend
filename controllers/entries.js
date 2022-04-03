import User from "../models/User.js";

export const submitEntry = async (req, res) => {
  const { user, account, entry } = req.body;

  User.findOneAndUpdate(
    { _id: user, "accounts._id": account },
    {
      $push: {
        "accounts.$.services": entry,
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

export const saveEntries = async (req, res) => {
  const { user, account, entries } = req.body;

  User.findOneAndUpdate(
    { _id: user, "accounts._id": account },
    {
      $set: {
        "accounts.$.entries": entries,
      },
    },
    {
      new: true,
    },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json("Saved successfully...");
        console.log("Updated sucessfully.....");
      }
    }
  );
};

export const clearEntries = async (req, res) => {
  // const { user, account } = req.body;
  // User.findOneAndUpdate(
  //   { _id: user, "accounts._id": account },
  //   {
  //     $set: {
  //       "accounts.$.entries": [],
  //     },
  //   },
  //   {
  //     new: true,
  //   },
  //   function (err, doc) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.status(200).json("Cleared successfully...");
  //       console.log("Updated sucessfully.....");
  //     }
  //   }
  // );
};
