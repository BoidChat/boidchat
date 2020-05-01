
//import io from 'socket.io';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { Component, OnInit } from '@angular/core';



@Component({

  selector: 'app-keyup',
  templateUrl: './keyup.component.html',
  styleUrls: ['./keyup.component.css'],
})
export class KeyupComponent implements OnInit {
  config: SocketIoConfig = { url: 'http://localhost:80/', options: {} };
  private socket=new Socket(this.config);
  public messages=[];
  constructor() { }

  ngOnInit(): void {
    //this.socket=io.connect();
    // this.socket.on('message',function(data){

    // for(var i=this.messages.length;i>0;i--){
    //   this.messages[i]=this.messages[i-1];
    // }
    
    // this.messages[0] = data;
    // });
  }

  onEnter(value: string) {

    if(value.length>256){
      //exception message?
      for(var i=this.messages.length;i>0;i--){
        this.messages[i]=this.messages[i-1];
      }

      this.messages[0] = "Message too long";
    }
    else{

      // //this.socket.io.emit('message',value);

      // for(var i=this.messages.length;i>0;i--){
      //   this.messages[i]=this.messages[i-1];
      // }

      // this.messages[0] = value;
      

     
      this.socket.emit('message',function(data){

      for(var i=this.messages.length;i>0;i--){
        this.messages[i]=this.messages[i-1];
      }
      
      this.messages[0] = data;
      });
    }
  }
}

