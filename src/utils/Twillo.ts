import * as twilio from "twilio";

const accountSid = 'ACff6da446aa99aed3c87e7b6218fbcc0f'//process.env.TWILIO_ACCOUNT_SID;
const authToken = '361f91c4f6d89c1162e31c1ac3c3c46f'//process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export class Twilio {


    async createMessage(payload) {

        client.messages
            .create({
                body: payload.content,
                from: payload.from,
                to: payload.to,
            })
            .then((message) => {
                console.log(message.status)
                return message;
            })
            .catch((e) => {
                console.log("---- error coming from twilio sms ----", e);
            });
    };





}