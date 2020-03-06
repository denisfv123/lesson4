const { Schema } = require('mongoose');
const connections = require('../src/config/connection');
const UserModel = require('../src/components/User/model');

const EmailSchem = new Schema(
    {
        email: {
            type: String,
        },
    },
    {
        collection: 'refemail',
        versionKey: false,
    },
);

const EmailModel = connections.model('EmailSchem', EmailSchem);

UserModel.find({}, 'email', (err, data) => {
    if (err) return err;

    EmailModel.insertMany(data, (err) => {
        if (err) return err;
        connections.close();
    });
}).exec();


