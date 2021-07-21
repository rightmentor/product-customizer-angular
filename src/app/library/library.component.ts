import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FabricjsEditorComponent } from 'projects/angular-editor-fabric-js/src/public-api';
import { ApiService } from '../services/api.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})


export class LibraryComponent{
  
  @ViewChildren('myCanvas') myCanvas: FabricjsEditorComponent;
  @ViewChild('canvas', { static: false }) canvas: FabricjsEditorComponent;

  dbUserID = '1';
  currentProductID: any = 0;
  savedLibraries: any = [];
  setupMessage = 'not set up yet';
  someParameterValue = null;

  constructor(private apiService: ApiService, private activateRoute: ActivatedRoute, private router: Router) {
    activateRoute.params.subscribe(params => {
      this.setupComponent(params['id']);
    });
    this.loadLibrary();
  }

  setupComponent(someParam) {
    this.setupMessage = 'set up at ' + new Date();
    this.someParameterValue = someParam;
    this.currentProductID = someParam;
  }

  getSavedLibraies (guid) {
    this.apiService.getSavedLibraries( guid, this.currentProductID ).subscribe((res:any) => {
      var values = [];  
      if (res.data.length > 0) {
        res.data.map(function(o1:any) {
          console.log('res-get-libraies', o1);
          localStorage.setItem( o1.meta_key, o1.meta_value );
          var valueData = [];
          valueData.push( JSON.parse( localStorage.getItem( o1.meta_key ) ) );
          valueData.push( o1.meta_key );
          valueData.push( o1.product_id );

          values.push( valueData );
          // values.push( JSON.parse( localStorage.getItem( o1.meta_key ) ) );
        });
        console.log('valueData: ',values);
        this.savedLibraries = values;
        console.log(this.savedLibraries)
        return res.data;
      }
    }, error => {
      console.error('error', error);
    });
  }

  loadLibrary() {
    this.getSavedLibraies(this.dbUserID); 
  }

  // loadCanvas(json,size) {
  //   this.activateRoute.navigateByUrl('/user');
  // }

  loadCanvas($myParam: string = '',$myParam2: string = ''): void {
    const navigationDetails: string[] = ['/customizer'];
    if($myParam.length) {
      navigationDetails.push($myParam);
    }
    if($myParam2.length) {
      navigationDetails.push($myParam2);
    }
    this.router.navigate(navigationDetails);
  }
 
}
