const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firebaseTokens: [
    {
      platform: String,
      token: String,
    },
  ],
  name: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    if (this._update.password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this._update.password, salt);
      this._update.password = hash;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
