import User from "../models/User.js";
export const setUpTaxes = (req, res) => {
  const { user, allStates, selectedStates } = req.body;

  User.findOneAndUpdate(
    { _id: user },
    {
      $set: {
        "tax.taxSetUp": true,
        "tax.taxStates": allStates,
        "tax.selectedStates": selectedStates,
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
