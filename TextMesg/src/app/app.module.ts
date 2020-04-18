import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeyupComponent } from './keyup/keyup.component';
import { BoidSystem } from '../assets/public/BoidSystem.js';
import { ExtraMath } from '../assets/public/extraMath.js';
import { Sketch } from '../assets/public/sketch.js';


@NgModule({
  declarations: [
    AppComponent,
    KeyupComponent,
    // BoidSystem, //not sure how to import without problems
    // ExtraMath,
    // Sketch
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
