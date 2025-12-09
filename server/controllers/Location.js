// server/controllers/Location.js
const models = require('../models');

const { Campaign, Location } = models;

// Create a new location for a campaign
const createLocation = async (req, res) => {
  const {
    campaignId, name, type, description, notes,
  } = req.body;

  if (!campaignId || !name) {
    return res.status(400).json({ error: 'Campaign and location name are required.' });
  }

  try {
    const ownerId = req.session.account._id;

    // Ensure campaign belongs to this user
    const campaign = await Campaign.findOne({ _id: campaignId, owner: ownerId }).exec();
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const newLocation = new Location({
      name,
      type: type || '',
      description: description || '',
      notes: notes || '',
      campaign: campaign._id,
      owner: ownerId,
    });

    await newLocation.save();
    return res.status(201).json({ location: Location.toAPI(newLocation) });
  } catch (err) {
    return res.status(500).json({ error: 'Error creating location.' });
  }
};

// Get all locations for a campaign
const getLocations = async (req, res) => {
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

    const locations = await Location.find({ campaign: campaignId, owner: ownerId })
      .sort({ createdDate: -1 })
      .lean()
      .exec();

    return res.json({ locations });
  } catch (err) {
    return res.status(500).json({ error: 'Error retrieving locations.' });
  }
};

// Delete a location
const deleteLocation = async (req, res) => {
  const { locationId } = req.body;

  if (!locationId) {
    return res.status(400).json({ error: 'locationId is required.' });
  }

  try {
    const ownerId = req.session.account._id;

    const result = await Location.deleteOne({ _id: locationId, owner: ownerId }).exec();
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Location not found.' });
    }

    return res.json({ message: 'Location deleted successfully.' });
  } catch (err) {

    return res.status(500).json({ error: 'Error deleting location.' });
  }
};

module.exports = {
  createLocation,
  getLocations,
  deleteLocation,
};
