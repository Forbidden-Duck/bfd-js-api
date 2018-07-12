const EventEmitter = require('events');
const AutoPost = require("./AutoPost.js");
const Request = require("./Request.js");
const APIURL = 'https://botsfordiscord.com/api/v1/';

class bfdAPI extends EventEmitter {
    /**
     * New Instance
     * @param {any} client The Client Instance
     * @param {string} token The API Token
     * @param {boolean} autopost If It Will AutoPost
     * @param {number} intervalValue The Length of Interval (Seconds)
     * 
     */
    constructor(client, token, autopost, intervalValue) {
        super();
        this.client = client;
        this.token = token;
        this.autopost = autopost;
        this.intervalValue = intervalValue || 1800;

        if (client && autopost) {
            if (this.intervalValue > 86400) {
                throw new Error('intervalValue can not exceed 86400 Seconds (24 Hours)');
            } else if (this.intervalValue < 60) {
                throw new Error('intervalValue can not be smaller than 60 Seconds (1 Minute)');
            }

            /**
             * @event isPosted Event Posted
             * @param {number} guildCount Guild Count Posted
             */

            /**
             * @event isError Event Error
             * @param {error} error The Error
             */

            this.intervalValue * 1000;
            this.client.on('ready', () => {
                AutoPost.Post(this.client, APIURL + 'bots/{clientID}', this.token)
                    .then(() => this.emit('isPosted', this.client.guilds.size))
                    .catch((err) => this.emit('isError', err));
                setInterval(() => {
                    AutoPost.Post(this.client, APIURL + 'bots/{clientID}', this.token)
                        .then(() => this.emit('isPosted', this.client.guilds.size))
                        .catch((err) => this.emit('isError', err));
                }, this.intervalValue);
            });
        } else if (!client && autopost) {
            throw new Error('The Client your provided is Invalid. Disable AutoPost to Remove this Error.');
        }
    }

    /**
     * @param {string} botID Bot's ID
     */
    async getBotStats(botID) {
        if (!botID) {
            throw new Error('You need to provide an ID for getBotStats [ .getBotStats(botID) ]');
        }
        const res = await Request.request(`${APIURL}bots/${botID}`);
        if (res.text === '{}') {
            throw new Error('Invalid ID provided for getBotStats [ .getBotStats(botID) ]');
        }
        return res.body;
    }

    /**
     * @param {string} userID User's ID
     */
    async getUserStats(userID) {
        if (!userID) {
            throw new Error('You need to provide an ID for getUserStats [ .getUserStats(userID) ]');
        }
        const res = await Request.request(`${APIURL}bots`);
        let botArray = [];
        for (let bot of res.body) {
            if (bot.owner === userID) {
                botArray.push(bot);
            }
        }
        if (botArray.length < 1) {
            throw new Error('The User ID provided has no Bots for getUserStats');
        }
        return botArray;
    }
}

module.exports = bfdAPI;