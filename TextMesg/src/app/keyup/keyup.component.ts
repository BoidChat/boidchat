import { Component, OnInit } from '@angular/core';
import io from 'socket.io';
const socket=io.connect();

let messages: Array<String>;
@Component({
  selector: 'app-keyup',
  templateUrl: './keyup.component.html',
  styleUrls: ['./keyup.component.css']
})
export class KeyupComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  onEnter(value: string) {
    if(value.length>256){
      //exception message?
    }
    else{
      io.emit('message',value);
      for(var i=value.length;i>0;i--){
        messages[i]=messages[i-1];
      }
      messages[0] = value;
      
      
    }
  }
  
}
socket.on('message',function(data){
  for(var i=this.messages.length;i>0;i--){
    this.messages[i]=this.messages[i-1];
  }
  this.messages[0] = data;
});