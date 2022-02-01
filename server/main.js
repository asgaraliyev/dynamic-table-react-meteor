import { Meteor } from 'meteor/meteor';



Meteor.startup(() => {
    import "../imports/api/publications"
    import "../imports/api/Products"
    import "../imports/api/Tags"
});
