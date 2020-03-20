"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var socket_io_1 = require("socket.io");
var socket = socket_io_1["default"].connect();
var messages;
var KeyUpComponent = /** @class */ (function () {
    function KeyUpComponent() {
    }
    KeyUpComponent.prototype.onEnter = function (value) {
        if (value.length > 256) {
            //exception message?
        }
        else {
            socket_io_1["default"].emit('message', value);
            //for(var i=value.length;i>0;i--){
            //  this.values[i]=this.values[i-1];
            //}
            //this.values[0] = value;
        }
    };
    KeyUpComponent = __decorate([
        core_1.Component({
            selector: 'app-key-up',
            templateUrl: "./keyup.component.html"
        })
    ], KeyUpComponent);
    return KeyUpComponent;
}());
exports.KeyUpComponent = KeyUpComponent;
socket.on('message', function (data) {
    for (var i = this.messages.length; i > 0; i--) {
        this.messages[i] = this.messages[i - 1];
    }
    this.messages[0] = data;
});
