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
        keyFile: './wellnesstracker-pkdsxy-69a40ab2b11b.json'
      }
    },
    endpoint: '${JOVO_WEBHOOK_URL}',
};
 