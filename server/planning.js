"use strict";
exports.__esModule = true;
var _ = require('lodash');
var Planning = /** @class */ (function () {
    function Planning() {
        this.rooms = new Array();
    }
    Planning.prototype.addRoom = function (room) {
        this.rooms.push(room);
    };
    Planning.prototype.getRooms = function () {
        return this.rooms;
    };
    Planning.prototype.getRoom = function (roomName) {
        return _.find(this.rooms, { 'name': roomName });
    };
    Planning.prototype.roomExists = function (roomName) {
        return _.some(this.rooms, { 'name': roomName });
    };
    Planning.prototype.deleteRoom = function (room) {
        _.remove(this.rooms, { 'name': room.name });
    };
    return Planning;
}());
exports.Planning = Planning;
//bootstrap planning
exports.PLANNING_APP = new Planning();
