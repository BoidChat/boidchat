import { Component } from '@angular/core';
import io from 'socket.io';
const socket=io.connect();

@Component({
    selector: 'app-key-up',
    templateUrl: `./keyup.component.html`
  })
export class KeyUpComponent {
  
  messages :string[];
  onEnter(value: string) {
    if(value.length>256){
      //exception message?
    }
    else{
      io.emit('message',value);
      //for(var i=value.length;i>0;i--){
      //  this.values[i]=this.values[i-1];
      //}
      //this.values[0] = value;
      
      socket.on('message',function(data){
        for(var i=this.messages.length;i>0;i--){
          this.messages[i]=this.values[i-1];
        }
        this.messages[0] = data;
      });
    }
  }
}
