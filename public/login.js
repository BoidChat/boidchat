/*import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {NgbModalConfig, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth.service';

closeResult: string;
@ViewChild('content') content;
ngOnInit(): void {
  
}

constructor(config: NgbModalConfig, private modalService: NgbModal, private Auth: AuthService) {
  config.backdrop = 'static';
  config.keyboard = false;
}
ngAfterViewInit(){
  this.openModal()
}
openModal() {
  this.modalService.open(this.content, { centered: true});
}
loginUser(e) {
  e.preventDefault();
  const target=e.target
  const username=target.querySelector('#username').value
  this.Auth.getUserDetails(username)
  console.log(username)
  //var username=e.target.element.value;
  //console.log(username);
}*/

socket.on('registration_failed', (response) => { // response.error contains error message
	let name = undefined;
	//your code in case of registration failure here
	//socket.emit('register' , Math.floor(Math.random() * 100000).toString()/**insert user name here as parameter*/); //sends request to server to create new boid, initialisation
	// socket.emit('register' , name); //sends request to server to create new boid, initialisation
});

function registration(name){
	//socket.emit('register' , Math.floor(Math.random() * 100000).toString()/**insert user name here as parameter*/); //sends request to server to create new boid, initialisation
	socket.emit('register' , name); //sends request to server to create new boid, initialisation
}

