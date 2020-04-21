import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeyupComponent } from './keyup/keyup.component';
import { SketchScreenComponent } from './sketch-screen/sketch-screen.component';



@NgModule({
  declarations: [
    AppComponent,
    KeyupComponent,
    SketchScreenComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
