import mongoose from "mongoose";
import { getDateByYear } from "../utils/helpers.js";

const addressSchema = new mongoose.Schema(
  {
    addrFullName: {
      type: String,
    },
    addrStreet: {
      type: String,
    },
    addrCity: {
      type: String,
    },
    addrState: {
      type: String,
    },
    addrZipCode: {
      type: String,
    },
  },
  { timestamps: true }
);
const empAddressSchema = new mongoose.Schema(
  {
    empStreet: {
      type: String,
    },
    empCity: {
      type: String,
    },
    empState: {
      type: String,
    },
    empZipCode: {
      type: String,
    },
  },
  { timestamps: true }
);

const entrySchema = new mongoose.Schema(
  {
    _id: String,
    fullName: String,
    total: Number,
    services: [
      {
        service: String,
        desc: String,
        qty: Number,
        amount: Number,
        tax: Boolean,
        date: String,
        chartDate: Date,
        total: Number,
      },
    ],
    billed: Boolean,
    paid: Boolean,
    date: String,
    chartDate: Date,
  },
  { timestamps: true }
);

const paySchema = new mongoose.Schema(
  {
    wage: Number,
    hours: Number,
    total: Number,
    date: String,
    chartDate: Date,
    _id: String,
  },
  {
    timestamps: true,
  }
);

const accountEntrySchema = new mongoose.Schema(
  {
    service: String,
    desc: String,
    qty: Number,
    amount: Number,
    tax: Boolean,
    date: String,
    chartDate: Date,
    total: Number,
    taxState: String,
    abbrevation: String,
    taxRate: Number,
  },
  { timestamps: true }
);

const accountSchema = new mongoose.Schema(
  {
    accFullName: {
      type: String,
      required: true,
    },
    accEmail: {
      type: String,
      required: true,
    },
    accPhoneNumber: {
      type: String,
    },
    accAddress: {
      type: addressSchema,
      required: true,
    },

    services: {
      type: [entrySchema],
      default: [],
    },
    entries: {
      type: [accountEntrySchema],
      default: [
        {
          service: "",
          desc: "",
          qty: 1,
          amount: 0,
          tax: false,
          date: getDateByYear(),
          total: 0,
          taxState: "",
          abbrevation: "",
          taxRate: 0,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const employeeSchema = new mongoose.Schema(
  {
    empFullName: {
      type: String,
    },
    empEmail: {
      type: String,
    },
    empPhoneNumber: {
      type: String,
    },
    empGender: {
      type: String,
    },
    empAddress: {
      type: empAddressSchema,
    },
    pay: {
      date: String,
      chartDate: Date,
      hours: Number,
      wage: Number,
      total: Number,
      hourlyWage: Number,
    },
    paidEntries: {
      type: [paySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const expenseSchema = new mongoose.Schema(
  {
    date: String,
    chartDate: Date,
    amount: Number,
    desc: String,
  },
  {
    timestamps: true,
  }
);

const invoiceSchema = new mongoose.Schema({
  setUp: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  zip: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  signature: {
    type: String,
    default: "",
  },
});

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    invoiceInfo: {
      type: invoiceSchema,
      default: {},
    },
    slug: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    accounts: {
      type: [accountSchema],
      default: [],
    },
    quickServices: {
      type: Array,
      default: [],
    },
    quickDescriptions: {
      type: Array,
      default: [],
    },
    quickExpAmount: {
      type: Array,
      default: [],
    },
    quickExpDesc: {
      type: Array,
      default: [],
    },
    employees: {
      type: [employeeSchema],
      default: [],
    },
    expenses: {
      type: [expenseSchema],
      default: [],
    },
    tax: {
      selectedStates: {
        type: Array,
        default: [],
      },
      taxSetUp: {
        type: Boolean,
        default: false,
      },
      taxStates: {
        type: Array,
        default: [
          {
            name: "Alabama",
            abbrevation: "AL",
            taxRate: 0.04,
            selected: false,
          },
          {
            name: "Alaska",
            abbrevation: "AK",
            taxRate: 0,
            selected: false,
          },
          {
            name: "Arizona",
            abbrevation: "AZ",
            taxRate: 0.056,
            selected: false,
          },
          {
            name: "Arkansas",
            abbrevation: "AR",
            taxRate: 0.065,
            selected: false,
          },
          {
            name: "California",
            abbrevation: "CA",
            taxRate: 0.0725,
            selected: false,
          },
          {
            name: "Colorado",
            abbrevation: "CO",
            taxRate: 0.029,
            selected: false,
          },
          {
            name: "Connecticut",
            abbrevation: "CT",
            taxRate: 0.0635,
            selected: false,
          },
          {
            name: "Delaware",
            abbrevation: "DE",
            taxRate: 0,
            selected: false,
          },
          {
            name: "District of Columbia",
            abbrevation: "DC",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Florida",
            abbrevation: "FL",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Georgia",
            abbrevation: "GA",
            taxRate: 0.04,
            selected: false,
          },
          {
            name: "Hawaii",
            abbrevation: "HI",
            taxRate: 0.04,
            selected: false,
          },
          {
            name: "Idaho",
            abbrevation: "ID",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Illinois",
            abbrevation: "IL",
            taxRate: 0.0625,
            selected: false,
          },
          {
            name: "Indiana",
            abbrevation: "IN",
            taxRate: 0.07,
            selected: false,
          },
          {
            name: "Iowa",
            abbrevation: "IA",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Kansas",
            abbrevation: "KS",
            taxRate: 0.065,
            selected: false,
          },
          {
            name: "Kentucky",
            abbrevation: "KY",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Louisiana",
            abbrevation: "LA",
            taxRate: 0.0445,
            selected: false,
          },
          {
            name: "Maine",
            abbrevation: "ME",
            taxRate: 0.055,
            selected: false,
          },
          {
            name: "Maryland",
            abbrevation: "MD",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Massachusetts",
            abbrevation: "MA",
            taxRate: 0.0625,
            selected: false,
          },
          {
            name: "Michigan",
            abbrevation: "MI",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Minnesota",
            abbrevation: "MN",
            taxRate: 0.06875,
            selected: false,
          },
          {
            name: "Mississippi",
            abbrevation: "MS",
            taxRate: 0.07,
            selected: false,
          },
          {
            name: "Missouri",
            abbrevation: "MO",
            taxRate: 0.04225,
            selected: false,
          },
          {
            name: "Montana",
            abbrevation: "MT",
            taxRate: 0,
            selected: false,
          },
          {
            name: "Nebraska",
            abbrevation: "NE",
            taxRate: 0.055,
            selected: false,
          },
          {
            name: "Nevada",
            abbrevation: "NV",
            taxRate: 0.0685,
            selected: false,
          },
          {
            name: "New Hampshire",
            abbrevation: "NH",
            taxRate: 0,
            selected: false,
          },
          {
            name: "New Jersey",
            abbrevation: "NJ",
            taxRate: 0.06625,
            selected: false,
          },
          {
            name: "New Mexico",
            abbrevation: "NM",
            taxRate: 0.05125,
            selected: false,
          },
          {
            name: "New York",
            abbrevation: "NY",
            taxRate: 0.04,
            selected: false,
          },
          {
            name: "North Carolina",
            abbrevation: "NC",
            taxRate: 0.0475,
            selected: false,
          },
          {
            name: "North Dakota",
            abbrevation: "ND",
            taxRate: 0.05,
            selected: false,
          },
          {
            name: "Ohio",
            abbrevation: "OH",
            taxRate: 0.0575,
            selected: false,
          },
          {
            name: "Oklahoma",
            abbrevation: "OK",
            taxRate: 0.045,
            selected: false,
          },
          {
            name: "Oregon",
            abbrevation: "OR",
            taxRate: 0,
            selected: false,
          },
          {
            name: "Pennsylvania",
            abbrevation: "PA",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Puerto Rico",
            abbrevation: "PR",
            taxRate: 0.115,
            selected: false,
          },
          {
            name: "Rhode Island",
            abbrevation: "RI",
            taxRate: 0.07,
            selected: false,
          },
          {
            name: "South Carolina",
            abbrevation: "SC",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "South Dakota",
            abbrevation: "SD",
            taxRate: 0.045,
            selected: false,
          },
          {
            name: "Tennessee",
            abbrevation: "TN",
            taxRate: 0.07,
            selected: false,
          },
          {
            name: "Texas",
            abbrevation: "TX",
            taxRate: 0.0625,
            selected: false,
          },
          {
            name: "Utah",
            abbrevation: "UT",
            taxRate: 0.0485,
            selected: false,
          },
          {
            name: "Vermont",
            abbrevation: "VT",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Virginia",
            abbrevation: "VA",
            taxRate: 0.043,
            selected: false,
          },
          {
            name: "Washington",
            abbrevation: "WA",
            taxRate: 0.065,
            selected: false,
          },
          {
            name: "West Virginia",
            abbrevation: "WV",
            taxRate: 0.06,
            selected: false,
          },
          {
            name: "Wisconsin",
            abbrevation: "WI",
            taxRate: 0.05,
            selected: false,
          },
          {
            name: "Wyoming",
            abbrevation: "WY",
            taxRate: 0.04,
            selected: false,
          },
        ],
      },
    },
  },

  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);
export default User;
