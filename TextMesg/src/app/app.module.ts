import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeyupComponent } from './keyup/keyup.component';
import { SketchScreenComponent } from './sketch-screen/sketch-screen.component';
import { Component, OnInit } from '@angular/core';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
 
const config: SocketIoConfig = { url: 'http://localhost:80/', options: {} };


@NgModule({
  declarations: [
    AppComponent,
    KeyupComponent,
    SketchScreenComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
