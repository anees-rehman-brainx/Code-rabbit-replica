const { generateTokenWithSecret } = require("../services/jwtService");

const FORGET_PASS_EMAIL_SUBJECT = `Reset Password`;

const FORGET_PASS_EMAIL_BODY = (user, oldPass) =>
  `Visit the following link to reset your password\n${
    process.env.HOST
  }/auth/reset-password/${generateTokenWithSecret(user, oldPass)}`;

const getS3Url = (key) =>
  encodeURI(
    `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  );

// password must contain a capital Letter, a symbol and a number, and must be minimum 8 digits long
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const PLATFORMS = {
  ios: "ios",
  android: "android",
  reactApp: "react-app",
};

const USER_LOCKED_FIELDS = ["email", "password"];

const GITHUB_ACTIONS = {
  OPENED: "opened",
  CLOSED: "closed",
  MERGED: "merged",
  REOPENED: "reopened",
  EDITED: "edited",
  SYNCHRONIZE: "synchronize",
  LABELED: "labeled",
  UNLABELED: "unlabeled",
  REVIEW_REQUESTED: "review_requested",
  REVIEW_REQUEST_REMOVED: "review_request_removed",
  READY_FOR_REVIEW: "ready_for_review",
  CONVERT_TO_DRAFT: "convert_to_draft",
};
module.exports = {
  FORGET_PASS_EMAIL_BODY,
  getS3Url,
  FORGET_PASS_EMAIL_SUBJECT,
  passwordRegex,
  PLATFORMS,
  USER_LOCKED_FIELDS,
  GITHUB_ACTIONS,
};
