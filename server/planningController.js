"use strict";
exports.__esModule = true;
var common_1 = require("./common");
var appConstants = require("./constants");
var room_1 = require("./room");
var points_1 = require("./points");
var planning_1 = require("./planning");
var _ = require('lodash');
function getRooms() {
    return planning_1.PLANNING_APP.rooms;
}
exports.getRooms = getRooms;
function addRoom(roomName, accessCode) {
    var room = new room_1.Room(roomName, accessCode);
    var response = new common_1.ResponseMessage();
    if (planning_1.PLANNING_APP.roomExists(room.name)) {
        response.message = appConstants.ROOM_EXISTS;
    }
    else {
        planning_1.PLANNING_APP.addRoom(room);
        response.message = appConstants.ROOM_ADDED;
    }
    response.content = planning_1.PLANNING_APP.getRooms();
    return response;
}
exports.addRoom = addRoom;
function deleteRoom(roomName) {
    var response = new common_1.ResponseMessage();
    if (planning_1.PLANNING_APP.roomExists(roomName)) {
        var room = planning_1.PLANNING_APP.getRoom(roomName);
        planning_1.PLANNING_APP.deleteRoom(room);
        response.message = appConstants.ROOM_DELETED;
    }
    else {
        response.message = appConstants.ROOM_INVALID;
    }
    response.content = planning_1.PLANNING_APP.getRooms();
    return response;
}
exports.deleteRoom = deleteRoom;
function addUser(user, room) {
    var response = new common_1.ResponseMessage();
    room.users.push(user);
    response.message = appConstants.USER_ADDED;
    response.content = {
        user: user,
        room: room
    };
    return response;
}
exports.addUser = addUser;
function removeUser(user, room) {
    var response = new common_1.ResponseMessage();
    var cTopic = room.topicInProgress();
    if (typeof cTopic !== 'undefined' && !user.isHost && !user.isChicken) {
        _.remove(cTopic.participants, { 'user': user });
    }
    room.removeUser(user);
    response.message = appConstants.USER_REMOVED;
    response.content = room;
    return response;
}
exports.removeUser = removeUser;
function getUsers(room) {
    var response = new common_1.ResponseMessage();
    response.message = appConstants.SUCCESS;
    response.content = room.users;
    return response;
}
exports.getUsers = getUsers;
function addTopic(room, topic) {
    var response = new common_1.ResponseMessage();
    var participants = _.filter(room.users, { 'isHost': false, 'isChicken': false });
    //set all topics to inactive
    _.forEach(room.topics, function (t) {
        t.isActive = false;
    });
    topic.participants = _.map(participants, function (participant) {
        var userPoints = new points_1.Points();
        userPoints.points = 0;
        userPoints.user = participant;
        return userPoints;
    });
    room.topics.push(topic);
    response.message = appConstants.SUCCESS;
    response.content = room;
    return response;
}
exports.addTopic = addTopic;
function updateTopic(room, user) {
    var userPoints = new points_1.Points();
    userPoints.points = 0;
    userPoints.user = user;
    var topic = room.topicInProgress();
    topic.participants.push(userPoints);
}
exports.updateTopic = updateTopic;
