// server/models/Location.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  type: {
    type: String,
    default: '',
    maxlength: 100, // e.g., "Town", "Dungeon", "Forest"
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  notes: {
    type: String,
    default: '',
    maxlength: 2000,
  },
  campaign: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Campaign',
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

LocationSchema.statics.toAPI = (doc) => ({
  _id: doc._id,
  name: doc.name,
  type: doc.type,
  description: doc.description,
  notes: doc.notes,
  campaign: doc.campaign,
});

const LocationModel = mongoose.model('Location', LocationSchema);
module.exports = LocationModel;
