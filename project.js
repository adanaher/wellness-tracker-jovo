// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    alexaSkill: {
       nlu: 'alexa',
    },
    googleAction: {
      nlu: 'dialogflow',
      dialogflow: {
        projectId: 'wellnesstracker-pkdsxy',
        keyFile: './wellnesstracker-pkdsxy-00218f699429.json'
      }
    },
    endpoint: '${JOVO_WEBHOOK_URL}',
};
 