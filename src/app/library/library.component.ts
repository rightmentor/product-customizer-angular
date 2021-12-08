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
  filteredLibraried: any = [];
  setupMessage = 'not set up yet';
  someParameterValue = null;
  filterText = '';

  constructor(private apiService: ApiService, private activateRoute: ActivatedRoute, private router: Router) {
    activateRoute.params.subscribe(params => {
      this.currentProductID = params['id'];
      this.setupComponent(params['id']);
    });
    this.loadLibrary();
  }

  filter() {
    if (this.filterText !== '') {
      this.filteredLibraried = this.savedLibraries.filter(lib =>  lib[0].name.toLowerCase().indexOf(this.filterText) > -1 || lib[0].description.toLowerCase().indexOf(this.filterText) > -1 )
    } else {
      this.filteredLibraried = this.savedLibraries
    }
  }

  setupComponent(someParam) {
    this.setupMessage = 'set up at ' + new Date();
    this.someParameterValue = someParam;
    this.currentProductID = someParam;
  }

  getSavedLibraies (guid) {
    this.apiService.getSavedLibraries( guid, this.currentProductID ).subscribe((res:any) => {
      var values = []; 
      var productID = this.currentProductID; 
      if (res.data.length > 0) {
        res.data.map(function(o1:any) {
          localStorage.setItem( o1.meta_key, o1.meta_value );
          var valueData = [];
          valueData.push( JSON.parse( localStorage.getItem( o1.meta_key ) ) );
          valueData.push( o1.meta_key );
          valueData.push( productID );
          valueData.push( o1.id );
          values.push( valueData );
          // values.push( JSON.parse( localStorage.getItem( o1.meta_key ) ) );
        });
        this.savedLibraries = values;
        this.filteredLibraried = values;
        return res.data;
      }
    }, error => {
      console.error('error', error);
    });
  }

  deleteCanvas( id ) {
    this.apiService.deleteCanvas(id).subscribe((res) => {
      alert(res);
    }, error => {
      console.error('error', error);
    });
  }

  loadLibrary() {
    this.getSavedLibraies(this.dbUserID); 
  }

  deleteCanvasFn(id) {
    console.log('entryId',id);
    if(confirm("Are you sure to delete Canvas")) {
      this.deleteCanvas(id);
    }
    this.loadLibrary();
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
