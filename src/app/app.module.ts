import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FabricjsEditorModule } from 'projects/angular-editor-fabric-js/src/public-api';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { ApiService } from './services/api.service';
import { ModalModule } from './_modal/modal.module';
import { CookieService } from 'ngx-cookie-service';
import { LibraryComponent } from './library/library.component';
import { CustomizerComponent } from './customizer/customizer.component';

const routes: Routes = [{ path: '', component: LibraryComponent }, { path: 'library/:id', component: LibraryComponent }, { path: 'customizer/:id/:id2', component: CustomizerComponent }]; // sets up routes constant where you define your routes

@NgModule({
  declarations: [
    AppComponent, LibraryComponent, CustomizerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FabricjsEditorModule,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerModule,
    [RouterModule.forRoot(routes)],
    ModalModule
  ],
  exports: [RouterModule],
  providers: [ApiService,CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
