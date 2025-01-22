const { UserModel } = require("../models");

const getOneUser = async (condition) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne(condition)
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

const getUsers = async (condition) => {
  return new Promise((resolve, reject) => {
    UserModel.find(condition)
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

const updateUser = async (condition, data) => {
  return new Promise((resolve, reject) => {
    UserModel.findOneAndUpdate(condition, data, {
      new: true,
      runValidators: true,
    })
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

const updateAllUsers = async (condition, data) => {
  return new Promise((resolve, reject) => {
    UserModel.updateMany(condition, data, {
      new: true,
      runValidators: true,
    })
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

const deleteUser = async (condition) => {
  return new Promise((resolve, reject) => {
    UserModel.deleteOne(condition)
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

const addUser = async (data) => {
  return new Promise((resolve, reject) => {
    new UserModel(data)
      .save()
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

const getTokens = async (condition, limit, skip) => {
  return new Promise((resolve, reject) => {
    UserModel.find(condition)
      .select("firebaseTokens")
      .limit(limit || 500)
      .skip(skip || 0)
      .then((data) => {
        UserModel.count(condition).then((count) => {
          resolve({ data, count });
        });
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  getOneUser,
  updateUser,
  deleteUser,
  addUser,
  getUsers,
  getTokens,
  updateAllUsers,
};
