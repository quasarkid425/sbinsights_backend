import User from "../models/User.js";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import { getDateByYear } from "../utils/helpers.js";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// export const submitDetails = async (req, res) => {
//   const { name: fullName, email, where } = req.body;

//   const findEmail = await Cta.find({ email: email });

//   const [firstName, lastName] = fullName.split(" ");

//   if (findEmail.length === 1) {
//     return res
//       .status(404)
//       .json("Email already submitted. Please submit a unique email...");
//   }
//   try {
//     await Cta.create({
//       fullName,
//       email,
//       where,
//     });
//     res
//       .status(201)
//       .json("Successfully submitted. We will be in touch with you shortly..");

//     const msg = {
//       to: `${email}`,
//       subject: "Thanks for reaching out!",
//       from: "quasarkid339203@gmail.com", //This will need to change
//       templateId: "d-c6eaefc635e94c93aa0ebb8025940e41",
//       dynamicTemplateData: {
//         firstName: `${firstName}`,
//       },
//       asm: {
//         group_id: 16685,
//         groups_to_display: [16685],
//       },
//     };
//     sgMail.send(msg, (error, result) => {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Successfully sent..");
//       }
//     });
//   } catch (error) {
//     console.log("server");
//     res.status(500).json(error.message);
//   }
// };

export const signup = async (req, res) => {
  const { firstName, lastName, companyName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email is taken",
      });
    } else {
      const hashed_password = CryptoJS.AES.encrypt(
        password,
        process.env.CRYPTO_SECRET
      ).toString();

      const newUser = await User.create({
        firstName,
        lastName,
        hashed_password,
        email,
        companyName,
        slug: slugify(companyName).toLowerCase(),
        isAdmin: req.body.isAdmin ? req.body.isAdmin : false,
      });

      const token = jwt.sign(
        { _id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const user = {
        newUser: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          companyName: newUser.companyName,
          invoiceInfo: newUser.invoiceInfo,
          slug: newUser.slug,
          email: newUser.email,
          isAdmin: newUser.isAdmin,
          quickServices: newUser.quickServices,
          quickDescriptions: newUser.quickDescriptions,
          token,
          _id: newUser._id,
        },
        accounts: newUser.accounts,
        employees: newUser.employees,
        expenses: {
          expenses: newUser.expenses,
          quickExpAmount: newUser.quickExpAmount,
          quickExpDesc: newUser.quickExpDesc,
        },
        taxes: newUser.tax,
      };

      return res.json(user);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Something went wrong",
    });
  }
};

export const login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const bytes = CryptoJS.AES.decrypt(
      user.hashed_password,
      process.env.CRYPTO_SECRET
    );
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const loggedInUser = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        invoiceInfo: user.invoiceInfo,
        slug: user.slug,
        email: user.email,
        isAdmin: user.isAdmin,
        quickServices: user.quickServices,
        quickDescriptions: user.quickDescriptions,
        token,
        _id: user._id,
      },
      accounts: user.accounts,
      employees: user.employees,
      expenses: {
        expenses: user.expenses,
        quickExpAmount: user.quickExpAmount,
        quickExpDesc: user.quickExpDesc,
      },
      taxes: user.tax,
    };

    loggedInUser.accounts.sort();

    return res.status(200).json(loggedInUser);
  });
};

export const forgot = (req, res) => {
  const email = req.body.email;
  User.findOne({ email }).exec((err, user) => {
    if (!user) {
      return res
        .status(400)
        .json({ error: "User with that email does not exist" });
    }

    res.status(200).json("Password reset link sent");

    const token = jwt.sign(
      {
        user_id: user._id,
        email: user._email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const resetLink = `${process.env.URL_CLIENT}/reset/${user.id}/${token}`;

    const msg = {
      to: `${email}`,
      subject: `Reset password for ${user.firstName}`,
      from: "quasarkid339203@gmail.com", //This will need to change
      templateId: "d-0da279a394cb4caa9a7e4130cd356a49",
      dynamicTemplateData: {
        firstName: `${user.firstName}`,
        resetLink: resetLink,
      },

      asm: {
        group_id: 16686,
        groups_to_display: [16686],
      },
    };

    sgMail.send(msg, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully sent..");
      }
    });
  });
};

export const reset = async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({ error: "No user found" });
    } else {
      user.hashed_password = CryptoJS.AES.encrypt(
        password,
        process.env.CRYPTO_SECRET
      ).toString();
      const updatedUser = await user.save();

      res.status(200).json(updatedUser);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const findUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
  }
};

export const seedAccounts = async (req, res) => {
  const { companyName, accounts } = req.body;

  const company = await User.findOne({ companyName });

  await User.findByIdAndUpdate(
    company._id,
    { $push: { accounts: accounts } },
    { safe: true, upsert: true },
    function (err, model) {
      if (err) {
        res.status(400).json("Problem updating data...");
      } else {
        res.status(200).json("Data updated successfully...");
      }
    }
  );

  try {
  } catch (error) {
    console.log(error);
  }
};

export const retrieveAccounts = async (req, res) => {
  try {
    const { company } = req.params;
    const account = await User.findOne({ slug: company });

    res.status(200).json(account);
  } catch (error) {
    console.log(error);
  }
};

export const firstAccount = async (req, res) => {
  try {
    const { slug, firstAcc } = req.body;

    const user = await User.findOne({ slug });

    const newAcc = {
      accFullName: firstAcc.accountFullName,
      accEmail: firstAcc.accountEmail,
      accPhoneNumber: firstAcc.accountEmail,
      accAddress: {
        addrFullName: firstAcc.accountBillingName,
        addrStreet: firstAcc.accountBillingStreet,
        addrCity: firstAcc.accountBillingCity,
        addrState: firstAcc.accountBillingState,
        addrZipCode: firstAcc.accountBillingZipCode,
      },
    };

    await User.updateOne(
      { _id: user._id },
      { $push: { accounts: newAcc } },
      { new: true }
    );

    const newAccount = await User.findOne({ slug });
    res.status(200).json(newAccount.accounts);
  } catch (error) {
    console.log(error);
  }
};

export const updateProfile = async (req, res) => {
  const { userId } = req.body;
  const { companyName, firstName, lastName, email, password } =
    req.body.updatedUser;
  const user = await User.findOne({ _id: userId });
  try {
    const userEmail = await User.findOne({ email: email });
    if (userEmail) {
      return res.status(400).json({ error: "Email taken" });
    }
  } catch (error) {
    console.log(error);
  }
  const updatedSlug = companyName
    ? slugify(companyName).toLowerCase()
    : user.slug;
  const updatedCompanyName = companyName ? companyName : user.companyName;
  const updatedfirstName = firstName ? firstName : user.firstName;
  const updatedlastName = lastName ? lastName : user.lastName;
  const updatedEmail = email ? email : user.email;
  const updatedPassword = password
    ? CryptoJS.AES.encrypt(password, process.env.CRYPTO_SECRET).toString()
    : user.hashed_password;

  try {
    User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        companyName: updatedCompanyName,
        firstName: updatedfirstName,
        lastName: updatedlastName,
        slug: updatedSlug,
        email: updatedEmail,
        hashed_password: updatedPassword,
      },
      {
        new: true,
      },
      (err, user) => {
        if (err) {
          console.log(err);
        } else {
          const token = jwt.sign(
            { _id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );

          const updatedUser = {
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              companyName: user.companyName,
              invoiceInfo: user.invoiceInfo,
              slug: user.slug,
              email: user.email,
              isAdmin: user.isAdmin,
              quickServices: user.quickServices,
              quickDescriptions: user.quickDescriptions,
              token,
              _id: user._id,
            },
            accounts: user.accounts,
            employees: user.employees,
            expenses: {
              expenses: user.expenses,
              quickExpAmount: user.quickExpAmount,
              quickExpDesc: user.quickExpDesc,
            },
            taxes: user.tax,
          };

          updatedUser.accounts.sort();

          return res.status(200).json(updatedUser);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const updateQuickNotes = async (req, res) => {
  const { user } = req.body;
  try {
    User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          quickServices: user.quickServices,
          quickDescriptions: user.quickDescriptions,
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
  } catch (error) {
    console.log(error);
  }
};

export const updateInvoice = async (req, res) => {
  const { user, details } = req.body;
  try {
    const { invoiceInfo } = await User.findOne({ _id: user }).select(
      "invoiceInfo"
    );
    User.findOneAndUpdate(
      { _id: user },
      {
        $set: {
          "invoiceInfo.setUp": true,
          "invoiceInfo.address": details.address
            ? details.address
            : invoiceInfo.address,
          "invoiceInfo.city": details.city ? details.city : invoiceInfo.city,
          "invoiceInfo.state": details.state
            ? details.state
            : invoiceInfo.state,
          "invoiceInfo.zip": details.zip ? details.zip : invoiceInfo.zip,
          "invoiceInfo.phone": details.phone
            ? details.phone
            : invoiceInfo.phone,
          "invoiceInfo.signature": details.signature
            ? details.signature
            : invoiceInfo.signature,
        },
      },
      {
        new: true,
      },
      function (err, user) {
        if (err) {
          console.log(err);
        } else {
          console.log("Document updated successfully...");
          const token = jwt.sign(
            { _id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );

          const updatedUser = {
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              companyName: user.companyName,
              invoiceInfo: user.invoiceInfo,
              slug: user.slug,
              email: user.email,
              isAdmin: user.isAdmin,
              quickServices: user.quickServices,
              quickDescriptions: user.quickDescriptions,
              token,
              _id: user._id,
            },
          };

          return res.status(200).json(updatedUser);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const dashboardData = async (req, res) => {
  const { user } = req.params;

  const data = await User.aggregate([
    {
      $match: { slug: user },
    },
    {
      $unwind: "$accounts",
    },
    {
      $unwind: "$accounts.services",
    },
    {
      $group: {
        _id: {
          __alias_0: "$accounts.services.paid",
        },
        __alias_1: {
          $sum: {
            $cond: [
              {
                $ne: [
                  {
                    $type: "$accounts.services.paid",
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
        label: "$__alias_0",
        value: "$__alias_1",
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
        __agg_sum: 1,
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
