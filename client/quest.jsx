// client/quest.jsx
const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// Create a new campaign
const handleCampaign = (e, onCreated) => {
  e.preventDefault();
  helper.hideError();

  const name = e.target.querySelector('#campaignName').value;
  const description = e.target.querySelector('#campaignDescription').value;

  if (!name) {
    helper.handleError('Campaign name is required.');
    return false;
  }

  helper.sendPost('/api/campaigns', { name, description }, onCreated);
  return false;
};

const CampaignForm = (props) => {
  return (
    <form
      id="campaignForm"
      name="campaignForm"
      onSubmit={(e) => handleCampaign(e, props.triggerReload)}
      className="panel form-panel"
    >
      <h2>Create a new campaign</h2>
      <label htmlFor="campaignName">Name:</label>
      <input
        id="campaignName"
        type="text"
        name="name"
        placeholder="The Shattered Realms"
      />

      <label htmlFor="campaignDescription">Description:</label>
      <textarea
        id="campaignDescription"
        name="description"
        placeholder="Optional summary of your world..."
      />

      <input className="button primary" type="submit" value="Create Campaign" />
    </form>
  );
};

const CampaignList = ({ campaigns, selectedId, onSelect }) => {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="panel list-panel">
        <h2>Your Campaigns</h2>
        <p className="muted">No campaigns yet. Create your first one!</p>
      </div>
    );
  }

  const nodes = campaigns.map((c) => {
    const isSelected = selectedId === c._id;
    return (
      <div
        key={c._id}
        className={`card campaign-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(c)}
      >
        <h3>{c.name}</h3>
        {c.description && <p>{c.description}</p>}
      </div>
    );
  });

  return (
    <div className="panel list-panel">
      <h2>Your Campaigns</h2>
      <div className="card-list">
        {nodes}
      </div>
    </div>
  );
};

// Create a new quest
const handleQuest = (e, campaignId, onCreated) => {
  e.preventDefault();
  helper.hideError();

  const title = e.target.querySelector('#questTitle').value;
  const status = e.target.querySelector('#questStatus').value;
  const reward = e.target.querySelector('#questReward').value;
  const notes = e.target.querySelector('#questNotes').value;

  if (!title) {
    helper.handleError('Quest title is required.');
    return false;
  }

  helper.sendPost('/api/quests', {
    campaignId,
    title,
    status,
    reward,
    notes,
  }, onCreated);

  return false;
};

const QuestForm = ({ campaign, triggerReload }) => {
  if (!campaign) return null;

  return (
    <form
      id="questForm"
      name="questForm"
      onSubmit={(e) => handleQuest(e, campaign._id, triggerReload)}
      className="panel form-panel"
    >
      <h2>Add a quest to {campaign.name}</h2>

      <label htmlFor="questTitle">Title:</label>
      <input
        id="questTitle"
        type="text"
        name="title"
        placeholder="Retrieve the Lost Artifact"
      />

      <label htmlFor="questStatus">Status:</label>
      <select id="questStatus" name="status" defaultValue="planned">
        <option value="planned">Planned</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      <label htmlFor="questReward">Reward:</label>
      <input
        id="questReward"
        type="text"
        name="reward"
        placeholder="500 gold, favor with the king..."
      />

      <label htmlFor="questNotes">Notes:</label>
      <textarea
        id="questNotes"
        name="notes"
        placeholder="Any additional details or twists..."
      />

      <input className="button primary" type="submit" value="Add Quest" />
    </form>
  );
};

const QuestList = ({ campaign, quests, triggerReload }) => {
  if (!campaign) {
    return (
      <div className="panel list-panel">
        <h2>Quests</h2>
        <p className="muted">Select a campaign to view its quests.</p>
      </div>
    );
  }

  const deleteQuest = (id) => {
    helper.sendPost('/api/quests/delete', { questId: id }, triggerReload);
  };

  if (!quests || quests.length === 0) {
    return (
      <div className="panel list-panel">
        <h2>Quests in {campaign.name}</h2>
        <p className="muted">No quests yet. Add one to get started.</p>
      </div>
    );
  }

  const nodes = quests.map((q) => (
    <div key={q._id} className="card quest-card">
      <div className="quest-header">
        <h3>{q.title}</h3>
        <span className={`status-tag status-${q.status}`}>{q.status}</span>
      </div>
      {q.reward && <p className="quest-reward"><strong>Reward:</strong> {q.reward}</p>}
      {q.notes && <p className="quest-notes">{q.notes}</p>}
      <button
        type="button"
        className="button danger small"
        onClick={() => deleteQuest(q._id)}
      >
        Delete
      </button>
    </div>
  ));

  return (
    <div className="panel list-panel">
      <h2>Quests in {campaign.name}</h2>
      <div className="card-list">
        {nodes}
      </div>
    </div>
  );
};

const App = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [quests, setQuests] = useState([]);

  const [reloadCampaigns, setReloadCampaigns] = useState(false);
  const [reloadQuests, setReloadQuests] = useState(false);

  const loadCampaigns = async () => {
    const response = await fetch('/api/campaigns');
    const data = await response.json();
    setCampaigns(data.campaigns || []);
    // If the selected campaign was deleted, clear it
    if (selectedCampaign) {
      const stillThere = data.campaigns.find((c) => c._id === selectedCampaign._id);
      if (!stillThere) {
        setSelectedCampaign(null);
        setQuests([]);
      }
    }
  };

  const loadQuests = async () => {
    if (!selectedCampaign) {
      setQuests([]);
      return;
    }
    const params = new URLSearchParams({ campaignId: selectedCampaign._id });
    const response = await fetch(`/api/quests?${params.toString()}`);
    const data = await response.json();
    setQuests(data.quests || []);
  };

  useEffect(() => {
    loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadCampaigns]);

  useEffect(() => {
    loadQuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaign, reloadQuests]);

  const triggerCampaignReload = () => setReloadCampaigns(!reloadCampaigns);
  const triggerQuestReload = () => setReloadQuests(!reloadQuests);

  return (
    <div className="layout">
      <section className="column">
        <CampaignForm triggerReload={triggerCampaignReload} />
        <CampaignList
          campaigns={campaigns}
          selectedId={selectedCampaign && selectedCampaign._id}
          onSelect={setSelectedCampaign}
        />
      </section>
      <section className="column">
        <QuestForm campaign={selectedCampaign} triggerReload={triggerQuestReload} />
        <QuestList
          campaign={selectedCampaign}
          quests={quests}
          triggerReload={triggerQuestReload}
        />
      </section>
    </div>
  );
};

const init = () => {
  const root = createRoot(document.getElementById('app'));
  root.render(<App />);
};

window.onload = init;
