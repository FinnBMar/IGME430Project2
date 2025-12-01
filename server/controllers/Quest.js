// server/controllers/Quest.js
const models = require('../models');

const { Campaign, Quest } = models;

// Render the main React app page
const appPage = (req, res) => res.render('app');

// Create a new campaign
const createCampaign = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Campaign name is required.' });
  }

  try {
    // Enforce a simple profit model:
    // free users can only have up to 2 campaigns
    const ownerId = req.session.account._id;
    const ownerPremium = req.session.account.isPremium;

    if (!ownerPremium) {
      const count = await Campaign.countDocuments({ owner: ownerId }).exec();
      if (count >= 2) {
        return res.status(403).json({
          error: 'Free accounts can only have 2 campaigns. Upgrade to premium to create more.',
        });
      }
    }

    const newCampaign = new Campaign({
      name,
      description: description || '',
      owner: ownerId,
    });

    await newCampaign.save();
    return res.status(201).json({ campaign: Campaign.toAPI(newCampaign) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error creating campaign.' });
  }
};

// Get all campaigns for logged-in user
const getCampaigns = async (req, res) => {
  try {
    const ownerId = req.session.account._id;
    const campaigns = await Campaign.find({ owner: ownerId })
      .sort({ createdDate: -1 })
      .lean()
      .exec();

    return res.json({ campaigns });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving campaigns.' });
  }
};

// Create a new quest in a campaign
const createQuest = async (req, res) => {
  const {
    campaignId, title, status, reward, notes,
  } = req.body;

  if (!campaignId || !title) {
    return res.status(400).json({ error: 'Campaign and title are required.' });
  }

  try {
    const ownerId = req.session.account._id;

    // Ensure campaign belongs to this user
    const campaign = await Campaign.findOne({ _id: campaignId, owner: ownerId }).exec();
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const newQuest = new Quest({
      title,
      status: status || 'planned',
      reward: reward || '',
      notes: notes || '',
      campaign: campaign._id,
      owner: ownerId,
    });

    await newQuest.save();
    return res.status(201).json({ quest: Quest.toAPI(newQuest) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error creating quest.' });
  }
};

// Get quests for a given campaign
const getQuests = async (req, res) => {
  const { campaignId } = req.query;

  if (!campaignId) {
    return res.status(400).json({ error: 'campaignId is required.' });
  }

  try {
    const ownerId = req.session.account._id;

    // Ensure campaign belongs to this user
    const campaign = await Campaign.findOne({ _id: campaignId, owner: ownerId }).exec();
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const quests = await Quest.find({ campaign: campaignId, owner: ownerId })
      .sort({ createdDate: -1 })
      .lean()
      .exec();

    return res.json({ quests });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving quests.' });
  }
};

// Delete a quest
const deleteQuest = async (req, res) => {
  const { questId } = req.body;

  if (!questId) {
    return res.status(400).json({ error: 'questId is required.' });
  }

  try {
    const ownerId = req.session.account._id;

    const result = await Quest.deleteOne({ _id: questId, owner: ownerId }).exec();
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Quest not found.' });
    }

    return res.json({ message: 'Quest deleted successfully.' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting quest.' });
  }
};

module.exports = {
  appPage,
  createCampaign,
  getCampaigns,
  createQuest,
  getQuests,
  deleteQuest,
};
