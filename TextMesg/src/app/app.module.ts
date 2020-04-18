import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeyupComponent } from './keyup/keyup.component';
import { BoidSystem } from '../assets/js/BoidSystem.js';
import { ExtraMath } from '../assets/js/extraMath.js';
import { Sketch } from '../assets/js/sketch.js';


@NgModule({
  declarations: [
    AppComponent,
    KeyupComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    BoidSystem, //not sure how to import without problems
    ExtraMath,
    Sketch
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
