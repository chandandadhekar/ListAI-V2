const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  scope: {
    type: String,
    required: false
  },
  expires: {
    type: Date,
    required: false
  },
  accessToken: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: false
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  accountOwner: {
    type: Boolean,
    default: false
  },
  locale: {
    type: String,
    required: false
  },
  collaborator: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
});

// Create the Session model from the schema
const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
