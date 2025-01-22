const m2s = require('mongoose-to-swagger');
const _ = require('lodash');
const { USER_LOCKED_FIELDS } = require('../constants');

const getFirebaseAdminKey = () => {
  return {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_CERT_URI,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_URL,
  };
};

const getSwaggerSchemas = (models) => {
  let schemas = {};
  for (let model in models) {
    schemas.model = m2s(models[model]);
  }
  return schemas;
};

const removeUserLockedFields = (body) => {
  const filteredBody = _.cloneDeep(body);
  USER_LOCKED_FIELDS.forEach((field) => {
    delete filteredBody[field];
  });
  return filteredBody;
};

module.exports = {
  getFirebaseAdminKey,
  getSwaggerSchemas,
  removeUserLockedFields,
};
