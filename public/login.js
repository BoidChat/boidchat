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
  let message = response.error + ": " + response.name;
  let parent = document.querySelector(".modal-footer")
  let error_element = document.getElementById("error_message");
  if(error_element != null){
      parent.removeChild(error_element);
  }
  let message_box = document.createElement("div");
  message_box.setAttribute("id", "error_message");
  message_box.setAttribute("class", "alert alert-danger");
  message_box.setAttribute("role", "alert");
  message_box.setAttribute("style", "position: absolute; left: 16px;");
  var message_node = document.createTextNode(message); 
  message_box.appendChild(message_node);
  parent.insertBefore(message_box, parent.children[0]);
	//socket.emit('register' , Math.floor(Math.random() * 100000).toString()/**insert user name here as parameter*/); //sends request to server to create new boid, initialisation
	// socket.emit('register' , name); //sends request to server to create new boid, initialisation
});

function registration(name){
	//socket.emit('register' , Math.floor(Math.random() * 100000).toString()/**insert user name here as parameter*/); //sends request to server to create new boid, initialisation
	socket.emit('register' , name); //sends request to server to create new boid, initialisation
}

function showBoxes(){
  document.getElementById("chatHeader").style.visibility = "visible";
  document.getElementById("flockers").style.visibility = "visible";
  document.getElementById("chatBox").style.visibility = "visible";
  document.getElementById("sendLine").style.visibility = "visible";
}
