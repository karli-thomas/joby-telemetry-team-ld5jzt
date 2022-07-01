import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { PlanesDashboardComponent } from './planes-dashboard.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, PlanesDashboardComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
