// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    logging: true,
 
    intentMap: {
       'AMAZON.StopIntent': 'END',
    },
 
    db: {
         FileDb: {
             pathToFile: '../db/db.json',
         }
     },

    user: {
        updatedAt: false,
        dataCaching: false,
        implicitSave: true,
        metaData: {
            enabled: true,
            lastUsedAt: true,
            sessionsCount: true,
            createdAt: true,
            requestHistorySize: 0,
            devices: false,
        },
        context: {
            enabled: false,
            prev: {
                size: 1,
                request: {
                    intent: true,
                    state: true,
                    inputs: true,
                    timestamp: true,
                },
                response: {
                    speech: true,
                    reprompt: true,
                    state: true,
                    output: true,
                },
            },
        },
    },

    cms: {
        AirtableCMS: {
            apiKey: process.env.API_KEY,
            baseId: process.env.RESPONSES_BASE_ID,
            tables: [
                {
                    name: 'responses',
                    table: 'responses',
                    type: 'responses',
                    order: ['key', 'en-US', 'en-US-AlexaSkill', 'en-US-GoogleAction']
                },
            ]
        }
    }
 };
 