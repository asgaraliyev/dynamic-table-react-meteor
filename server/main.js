import { Meteor } from 'meteor/meteor';
import "../imports/api/publications"
import "../imports/api/Collections/index"
import {WebApp} from "meteor/webapp";
Meteor.startup(() => {
    WebApp.rawConnectHandlers.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        return next();
    });
});
