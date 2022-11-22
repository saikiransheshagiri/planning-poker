"use strict";
exports.__esModule = true;
var _ = require('lodash');
var Room = /** @class */ (function () {
    function Room(roomName, accessCode) {
        this.name = roomName;
        this.accessCode = accessCode;
        this.users = new Array();
        this.topics = new Array();
        this.createdOn = new Date();
    }
    Room.prototype.getUsers = function () {
        return this.users;
    };
    Room.prototype.getUser = function (userName) {
        return _.find(this.users, { 'name': userName });
    };
    Room.prototype.userExists = function (userName) {
        return _.some(this.users, { 'name': userName });
    };
    Room.prototype.addUser = function (user) {
        this.users.push(user);
    };
    Room.prototype.removeUser = function (user) {
        _.remove(this.users, { 'name': user.name });
    };
    Room.prototype.addTopic = function (topic) {
        this.topics.push(topic);
    };
    Room.prototype.getHost = function () {
        return _.find(this.users, { 'isHost': true });
    };
    Room.prototype.topicInProgress = function () {
        return _.find(this.topics, { 'isActive': true });
    };
    Room.prototype.resetTopics = function () {
        this.topics.forEach(function (topic) {
            topic.isActive = false;
        });
    };
    return Room;
}());
exports.Room = Room;
