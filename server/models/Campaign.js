// server/models/Campaign.js
const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
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

CampaignSchema.statics.toAPI = (doc) => ({
  _id: doc._id,
  name: doc.name,
  description: doc.description,
});

const CampaignModel = mongoose.model('Campaign', CampaignSchema);
module.exports = CampaignModel;
