// server/router.js
const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  // Quest / data routes
  app.get('/api/campaigns', mid.requiresLogin, controllers.Quest.getCampaigns);
  app.post('/api/campaigns', mid.requiresLogin, controllers.Quest.createCampaign);

  app.get('/api/quests', mid.requiresLogin, controllers.Quest.getQuests);
  app.post('/api/quests', mid.requiresLogin, controllers.Quest.createQuest);
  app.post('/api/quests/delete', mid.requiresLogin, controllers.Quest.deleteQuest);

  // Auth routes
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  // Main app page
  app.get('/app', mid.requiresLogin, controllers.Quest.appPage);

  // Root route goes to login
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  // 404 handler - catch-all (must be last)
  app.use((req, res) => {
    res.status(404);
    return res.render('404');
  });
};

module.exports = router;
