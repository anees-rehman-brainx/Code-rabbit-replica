const { s3 } = require("../config");
const _ = require("lodash");
const { getS3Url } = require("../constants");
var sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

const getSignedURL = async (Key) => {
  return new Promise(async (resolve, reject) => {
    try {
      const signedUrl = await s3.getSignedUrl("getObject", {
        Key: Key,
        Bucket: process.env.AWS_BUCKET,
        Expires: 900,
      });

      resolve(signedUrl);
    } catch (err) {
      reject(err);
      console.log(err);
    }
  });
};

const uploadObject = async (base64, mimetype, filename) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Key = new Date().valueOf().toString() + sanitizeUrl(filename);
      s3.putObject({
        Bucket: process.env.AWS_BUCKET,
        Key,
        ContentEncoding: "base64",
        ContentType: mimetype,
        Body: new Buffer.from(base64.replace(/^data:.+;base64,/, ""), "base64"),
        ACL: "public-read",
      })
        .promise()
        .then(() => resolve(getS3Url(Key)))
        .catch((err) => reject(err));
    } catch (err) {
      reject(err);
      console.log(err);
    }
  });
};

module.exports = {
  getSignedURL,
  uploadObject,
};
