'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const { AirtableCMS } = require('jovo-cms-airtable');
// const { DynamoDb } = require('jovo-db-dynamodb');

const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const dotenv = require('dotenv');
dotenv.config();

const app = new App();

app.use(
    new Alexa(),
    new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb(),
    new AirtableCMS()
    // new DynamoDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
    LAUNCH() {
        return this.toIntent('WelcomeIntent');
    },

    DefaultFallbackIntent() {
        return this.toIntent('WelcomeIntent');
    },

    DefaultWelcomeIntent() {
        return this.toIntent('WelcomeIntent');
    },

    WelcomeIntent() {
        this.$speech.addText(this.$cms.t('welcome.newuser.speech'), this.$user.isNewUser())
            .addText(this.$cms.t('welcome.returninguser.speech'), !this.$user.isNewUser());
        
        this.ask(this.$speech,this.$cms.t('welcome.reprompt'));
    },

    GetLastWeightIntent() {
        let weightObject = [...this.$user.$data.weights].pop();

        // If height is stored, report BMI. Otherwise, don't.
        if (this.$user.$data.height) {
            let heightObject = this.$user.$data.height;
            let height = (heightObject.feet * 12) + heightObject.inches;
            let bmi = 703 * weightObject.weight / height / height;
            bmi = bmi.toFixed(1);
            let speech;

            if (bmi < 18.5) {
                // Underweight
                speech = 'Unfortunately that means you are underweight. You need a little more meat on those bones!';              
            } else if (bmi < 25) {
                // Normal Weight
                speech = 'Great, that means you\'re in the normal range! Way to go!'; 
            } else if (bmi < 30) {
                // Overweight
                let goalWeight = 25 * height * height / 703;
                let loss = Math.ceil(weightObject.weight - goalWeight);
                speech = 'Unfortunately that means you are overweight. You need to lose ' + loss + ' pounds to be in the normal range.'; 
            } else {
                // Obese
                let goalWeight = 25 * height * height / 703;
                let loss = weightObject.weight - goalWeight;
                speech = 'Uh oh, that means you are considered obese. You need to lose ' + loss + ' pounds to be in the normal range.'; 
            }

            this.$speech.addText('Sure. You last logged your weight ' + moment(weightObject.time).calendar() + ' and you weighed ' + 
            weightObject.weight + ' pounds. That\'s a BMI of ' + bmi)
            .addBreak('300ms')
            .addText(speech);

            this.ask(this.$speech);

        } else {
            this.ask('Sure. You last logged your weight ' + moment(weightObject.time).calendar() + ' and you weighed ' + 
                weightObject.weight + ' pounds. What else can I help you with?',
                'You can ask about your most recent activity.');
        }    
    },

    LogWeightIntent() {
        let weightObject = {
            weight: parseFloat(this.$inputs.weight.value),
            time: moment()
        };

        if (this.$user.$data.weights) {
            this.$user.$data.weights.push(weightObject);
        } else {
            this.$user.$data.weights = [weightObject];
        }

        this.ask('Awesome, I\'ll log your weight at ' + weightObject.weight + ' pounds. What else can I help you with?',
        'You can ask about your most recent logged weight to hear your BMI.');
    },

    LogHeightIntent() {
        let heightObject = {
            feet: parseInt(this.$inputs.feet.value),
            inches: parseInt(this.$inputs.inches.value),
            time: moment()
        };

        this.$user.$data.height = heightObject;

        this.ask('OK, I\'ll log your height as ' + heightObject.feet + ' feet ' + heightObject.inches + ' inches. What else can I help you with?',
        'You can ask about your most recent activity.');
    },

    GetHeightIntent() {
        let heightObject = this.$user.$data.height;
        this.ask('Sure. The height i have stored is ' + heightObject.feet + ' feet, ' + heightObject.inches + ' inches. What else can I help you with?',
        'You can ask about your most recent activity.');
    },

    LogExerciseIntent() {
        let exerciseObject = {
            exercise: this.$inputs.exerciseType.value,
            duration: moment.duration(this.$inputs.duration.value),
            time: moment()
        };

        if (this.$user.$data.exercises) {
            this.$user.$data.exercises.push(exerciseObject);
        } else {
            this.$user.$data.exercises = [exerciseObject];
        }

        this.ask('Great job! I\'ve logged your workout, ' + exerciseObject.exercise + ' for ' + exerciseObject.duration.humanize() + '. What else can I help you with?',
        'You can ask about your most recent activity.');
    },

    GetLastExerciseIntent() {
        let exerciseObject = [...this.$user.$data.exercises].pop();

        this.ask('Your last workout was ' + exerciseObject.duration + ' minutes of' + exerciseObject.exercise + '. what else can I help you with?',
        'You can ask about your most recent activity.');
    },

    GetExerciseDurationIntent() {
        let exercises = this.$user.$data.exercises;
        let range = moment.range(this.$inputs.timeframe.value);
        let totalDuration;

        console.log('exercise: ' + this.$inputs.exerciseType.value);
        console.log('timeframe: ' + this.$inputs.timeframe.value);
        console.log('range: ' + range);

        if (this.$inputs.exerciseType.value != undefined) {
            totalDuration = exercises
                .filter(exercise => exercise.exercise == this.$inputs.exerciseType.value)
                .filter(ex => range.contains(moment(ex.time)))
                .map(ex => moment.duration(ex.duration).asMinutes())
                .reduce((a,b) => a+b, 0);

            totalDuration = moment.duration(totalDuration,'minutes');

            console.log('total duration (min): ' + totalDuration.asMinutes());

            this.$speech.addText('You ' + this.$inputs.exerciseType.value + ' for a total of ')
                .addText(totalDuration.hours() + ' hours ' + totalDuration.minutes() + ' minutes.', totalDuration.asMinutes() > 120)
                .addText(totalDuration.hours() + ' hour ' + totalDuration.minutes() + ' minutes.', totalDuration.asMinutes() > 60 && totalDuration.asMinutes() <= 120)
                .addText('one hour.', totalDuration.asMinutes() == 60)
                .addText(totalDuration + ' minutes', totalDuration.asMinutes() < 60)
                .addText('. what else can i help you with?');

            this.ask(this.$speech, 'You can ask about your most recent activity.');

        } else {
            totalDuration = exercises
                .filter(ex => range.contains(moment(ex.time)))
                .map(ex => moment.duration(ex.duration).asMinutes())
                .reduce((a,b) => a+b, 0);

            totalDuration = moment.duration(totalDuration,'minutes');

            console.log('total duration (min): ' + totalDuration.asMinutes());

            this.$speech.addText('You worked out for a total of ')
                .addText(totalDuration.hours() + ' hours ' + totalDuration.minutes() + ' minutes.', totalDuration.asMinutes() > 120)
                .addText(totalDuration.hours() + ' hour ' + totalDuration.minutes() + ' minutes.', totalDuration.asMinutes() > 60 && totalDuration.asMinutes() <= 120)
                .addText('one hour.', totalDuration.asMinutes() == 60)
                .addText(totalDuration + ' minutes', totalDuration.asMinutes() < 60)
                .addText('. what else can i help you with?');

            this.ask(this.$speech, 'You can ask about your most recent activity.');

        }
    },

    GetExerciseCountIntent() {
        let exercises = this.$user.$data.exercises;
        let range = moment.range(this.$inputs.timeframe.value);
        let count;

        console.log('exercise: ' + this.$inputs.exerciseType.value);
        console.log('timeframe: ' + this.$inputs.timeframe.value);
        console.log('range: ' + range);

        if (this.$inputs.exerciseType.value != undefined) {
            count = exercises
                .filter(exercise => exercise.exercise == this.$inputs.exerciseType.value)
                .filter(ex => range.contains(moment(ex.time)))
                .length;

            this.ask('You did ' + this.$inputs.exerciseType.value + count + ' times. What else can I help you with?',
            'You can ask to hear your most recent activity.');

            // this.tell('You did ' + totalDuration + ' minutes of ' + this.$inputs.exerciseType.value + moment(this.$inputs.timeframe.value).duration());
        } else {
            count = exercises
                .filter(ex => range.contains(moment(ex.time)))
                .map(ex => moment.duration(ex.duration))
                .length;

            this.ask('You worked out ' + count + ' times. What else can I help you with?',
            'You can ask to hear your most recent activity.');
        }


    }
});

module.exports.app = app;
