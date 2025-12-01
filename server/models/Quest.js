// server/models/Quest.js
const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned',
  },
  reward: {
    type: String,
    default: '',
    maxlength: 500,
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

QuestSchema.statics.toAPI = (doc) => ({
  _id: doc._id,
  title: doc.title,
  status: doc.status,
  reward: doc.reward,
  notes: doc.notes,
  campaign: doc.campaign,
});

const QuestModel = mongoose.model('Quest', QuestSchema);
module.exports = QuestModel;
