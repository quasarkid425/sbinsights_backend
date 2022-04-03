import User from "../models/User.js";
import lodash from "lodash";

export const employeeExpensesByWeek = async (slug) => {
  try {
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
            isoyear: {
              $isoWeekYear: "$employees.paidEntries.chartDate",
            },
            week: {
              $isoWeek: "$employees.paidEntries.chartDate",
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
          x: "$__alias_0",
          y: "$__alias_1",
          _id: 0,
        },
      },
      {
        $sort: {
          "x.isoyear": 1,
          "x.week": 1,
        },
      },
      {
        $limit: 5000,
      },
    ]);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const expensesByWeek = async (slug) => {
  try {
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
        $addFields: {
          "expenses.chartDate": {
            $cond: {
              if: {
                $eq: [
                  {
                    $type: "$expenses.chartDate",
                  },
                  "date",
                ],
              },
              then: "$expenses.chartDate",
              else: null,
            },
          },
        },
      },
      {
        $addFields: {
          __alias_0: {
            isoyear: {
              $isoWeekYear: "$expenses.chartDate",
            },
            week: {
              $isoWeek: "$expenses.chartDate",
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
        $sort: {
          "x.isoyear": 1,
          "x.week": 1,
        },
      },
      {
        $limit: 5000,
      },
    ]);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const billedWeeklyPaidUnpaid = async (slug) => {
  const accountBilledData = await User.aggregate([
    {
      $match: {
        slug: slug,
      },
    },
    {
      $unwind: "$accounts",
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
          isoyear: {
            $isoWeekYear: "$accounts.services.chartDate",
          },
          week: {
            $isoWeek: "$accounts.services.chartDate",
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
        "x.isoyear": 1,
        "x.week": 1,
      },
    },
    {
      $limit: 5000,
    },
  ]);

  const empData = await employeeExpensesByWeek(slug);
  const expData = await expensesByWeek(slug);
  const employeeData = empData.map((emp) => {
    return { ...emp, y: emp.y * -1 };
  });
  const expenseData = expData.map((exp) => {
    return { ...exp, y: exp.y * -1 };
  });

  let newArr = [];
  let finalArr = [];

  accountBilledData.forEach((emp) =>
    employeeData.forEach(
      (acc) =>
        emp.x.isoyear === acc.x.isoyear &&
        emp.x.week === acc.x.week &&
        newArr.push({
          x: {
            isoyear: emp.x.isoyear,
            week: emp.x.week,
          },
          y: emp.y + acc.y,
        })
    )
  );
  // need to get the values that are not the same
  let firstResults = lodash.xorBy(employeeData, accountBilledData, "x.week"); // or 'nome'
  newArr.push(...firstResults);

  newArr.forEach((emp) =>
    expenseData.forEach(
      (acc) =>
        emp.x.isoyear === acc.x.isoyear &&
        emp.x.week === acc.x.week &&
        finalArr.push({
          x: {
            isoyear: emp.x.isoyear,
            week: emp.x.week,
          },
          y: emp.y + acc.y,
        })
    )
  );
  //need to get the values that are not the same
  let secondResults = lodash.xorBy(newArr, expenseData, "x.week"); // or 'nome'
  finalArr.push(...secondResults);

  // console.log("-----new array------");
  // console.log(newArr);

  // console.log("-----expenses--------");
  // console.log(expenseData);
  // console.log("-----final array--------");
  // console.log(lodash.sortBy(finalArr, "x.isoyear", "x.week"));

  // res.status(200).json(lodash.sortBy(finalArr, "x.isoyear", "x.week"));

  return lodash.sortBy(finalArr, "x.isoyear", "x.week");
};

export const billedWeeklyPaid = async (slug) => {
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
          isoyear: {
            $isoWeekYear: "$accounts.services.chartDate",
          },
          week: {
            $isoWeek: "$accounts.services.chartDate",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          __alias_0: "$__alias_0",
          __alias_1: "$accounts.services.paid",
        },
        __alias_2: {
          $sum: "$accounts.services.total",
        },
      },
    },
    {
      $project: {
        _id: 0,
        __alias_0: "$_id.__alias_0",
        __alias_1: "$_id.__alias_1",
        __alias_2: 1,
      },
    },
    {
      $project: {
        x: "$__alias_0",
        y: "$__alias_2",
        paid: "$__alias_1",
        _id: 0,
      },
    },
    {
      $group: {
        _id: {
          x: "$x",
        },
        __grouped_docs: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $sort: {
        "_id.x.isoyear": 1,
        "_id.x.week": 1,
      },
    },
    {
      $unwind: "$__grouped_docs",
    },
    {
      $replaceRoot: {
        newRoot: "$__grouped_docs",
      },
    },
    {
      $limit: 5000,
    },
  ]);

  const empData = await employeeExpensesByWeek(slug);
  const expData = await expensesByWeek(slug);

  const employeeData = empData.map((emp) => {
    return { ...emp, y: emp.y * -1 };
  });
  const expenseData = expData.map((exp) => {
    return { ...exp, y: exp.y * -1 };
  });

  let newArr = [];
  let finalArr = [];
  const paidData = data.filter((data) => data.paid);

  paidData.forEach((emp) =>
    employeeData.forEach(
      (acc) =>
        emp.x.isoyear === acc.x.isoyear &&
        emp.x.week === acc.x.week &&
        newArr.push({
          x: {
            isoyear: emp.x.isoyear,
            week: emp.x.week,
          },
          y: emp.y + acc.y,
        })
    )
  );
  // need to get the values that are not the same
  let firstResults = lodash.xorBy(employeeData, paidData, "x.week"); // or 'nome'
  newArr.push(...firstResults);

  newArr.forEach((emp) =>
    expenseData.forEach(
      (acc) =>
        emp.x.isoyear === acc.x.isoyear &&
        emp.x.week === acc.x.week &&
        finalArr.push({
          x: {
            isoyear: emp.x.isoyear,
            week: emp.x.week,
          },
          y: emp.y + acc.y,
        })
    )
  );
  //need to get the values that are not the same
  let secondResults = lodash.xorBy(newArr, expenseData, "x.week"); // or 'nome'
  finalArr.push(...secondResults);

  // console.log("-----new array------");
  // console.log(newArr);

  // console.log("-----expenses--------");
  // console.log(expenseData);
  // console.log("-----final array--------");
  // console.log(lodash.sortBy(finalArr, "x.isoyear", "x.week"));
  // res.status(200).json(lodash.sortBy(finalArr, "x.isoyear", "x.week"));
  return lodash.sortBy(finalArr, "x.isoyear", "x.week");
};

export const billedWeeklyUnPaid = async (slug) => {
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
          isoyear: {
            $isoWeekYear: "$accounts.services.chartDate",
          },
          week: {
            $isoWeek: "$accounts.services.chartDate",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          __alias_0: "$__alias_0",
          __alias_1: "$accounts.services.paid",
        },
        __alias_2: {
          $sum: "$accounts.services.total",
        },
      },
    },
    {
      $project: {
        _id: 0,
        __alias_0: "$_id.__alias_0",
        __alias_1: "$_id.__alias_1",
        __alias_2: 1,
      },
    },
    {
      $project: {
        x: "$__alias_0",
        y: "$__alias_2",
        paid: "$__alias_1",
        _id: 0,
      },
    },
    {
      $group: {
        _id: {
          x: "$x",
        },
        __grouped_docs: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $sort: {
        "_id.x.isoyear": 1,
        "_id.x.week": 1,
      },
    },
    {
      $unwind: "$__grouped_docs",
    },
    {
      $replaceRoot: {
        newRoot: "$__grouped_docs",
      },
    },
    {
      $limit: 5000,
    },
  ]);

  const empData = await employeeExpensesByWeek(slug);
  const expData = await expensesByWeek(slug);

  const employeeData = empData.map((emp) => {
    return { ...emp, y: emp.y * -1 };
  });
  const expenseData = expData.map((exp) => {
    return { ...exp, y: exp.y * -1 };
  });

  let newArr = [];
  let finalArr = [];
  const unPaidData = data.filter((data) => !data.paid);

  unPaidData.forEach((emp) =>
    employeeData.forEach(
      (acc) =>
        emp.x.isoyear === acc.x.isoyear &&
        emp.x.week === acc.x.week &&
        newArr.push({
          x: {
            isoyear: emp.x.isoyear,
            week: emp.x.week,
          },
          y: emp.y + acc.y,
        })
    )
  );
  // need to get the values that are not the same
  let firstResults = lodash.xorBy(employeeData, unPaidData, "x.week"); // or 'nome'
  newArr.push(...firstResults);

  newArr.forEach((emp) =>
    expenseData.forEach(
      (acc) =>
        emp.x.isoyear === acc.x.isoyear &&
        emp.x.week === acc.x.week &&
        finalArr.push({
          x: {
            isoyear: emp.x.isoyear,
            week: emp.x.week,
          },
          y: emp.y + acc.y,
        })
    )
  );
  //need to get the values that are not the same
  let secondResults = lodash.xorBy(newArr, expenseData, "x.week"); // or 'nome'
  finalArr.push(...secondResults);

  // console.log("-----new array------");
  // console.log(newArr);

  // console.log("-----expenses--------");
  // console.log(expenseData);
  // console.log("-----final array--------");
  // console.log(lodash.sortBy(finalArr, "x.isoyear", "x.week"));
  return lodash.sortBy(finalArr, "x.isoyear", "x.week");
};

export const allData = async (slug) => {
  const totalData = await User.aggregate([
    {
      $match: {
        slug: slug,
      },
    },
    {
      $unwind: "$accounts",
    },
    {
      $unwind: "$accounts.entries",
    },
    {
      $addFields: {
        "accounts.entries.chartDate": {
          $cond: {
            if: {
              $eq: [
                {
                  $type: "$accounts.entries.chartDate",
                },
                "date",
              ],
            },
            then: "$accounts.entries.chartDate",
            else: null,
          },
        },
      },
    },
    {
      $addFields: {
        __alias_0: {
          isoyear: {
            $isoWeekYear: "$accounts.entries.chartDate",
          },
          week: {
            $isoWeek: "$accounts.entries.chartDate",
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
          $sum: "$accounts.entries.total",
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
        "x.isoyear": 1,
        "x.week": 1,
      },
    },
    {
      $limit: 5000,
    },
  ]);

  const newTotalData = totalData.filter(
    (data) => data.x.isoyear && data.x.week
  );

  let finalArr = [];

  const accountData = await billedWeeklyPaidUnpaid(slug);

  newTotalData.forEach((emp) =>
    accountData.forEach(
      (acc) =>
        emp.x.isoyear === acc.x.isoyear &&
        emp.x.week === acc.x.week &&
        finalArr.push({
          x: {
            isoyear: emp.x.isoyear,
            week: emp.x.week,
          },
          y: emp.y + acc.y,
        })
    )
  );
  //need to get the values that are not the same
  let secondResults = lodash.xorBy(newTotalData, accountData, "x.week"); // or 'nome'
  finalArr.push(...secondResults);

  return lodash.sortBy(finalArr, "x.isoyear", "x.week");
};
