import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FabricjsEditorComponent } from 'projects/angular-editor-fabric-js/src/public-api';
import { ApiService } from '../services/api.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './archive-library.component.html',
  styleUrls: ['./archive-library.component.css']
})


export class ArchiveLibraryComponent{
  
  @ViewChildren('myCanvas') myCanvas: FabricjsEditorComponent;
  @ViewChild('canvas', { static: false }) canvas: FabricjsEditorComponent;

  dbUserID = '1';
  currentProductID: any = 0;
  savedLibraries: any = [];
  filteredLibraried: any = [];
  setupMessage = 'not set up yet';
  someParameterValue = null;
  filterText = '';
  searchText = '';

  constructor(private apiService: ApiService, private activateRoute: ActivatedRoute, private router: Router) {
    activateRoute.params.subscribe(params => {
      console.log(params['search']);
      this.searchText = params['search'];
      this.setupComponent(params['search']);
    });
    this.loadLibrary();
  }

  filter() {
    console.log('filter', this.filteredLibraried);
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
    this.searchText = someParam;
  }

  getAllLibraries (guid) {
    this.apiService.getAllLibraries( guid).subscribe((res:any) => {
      var values = []; 
      var productID = this.currentProductID; 
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
        this.filteredLibraried = values;
        console.log(this.savedLibraries)
        return res.data;
      }
    }, error => {
      console.error('error', error);
    });
  }

  loadLibrary() {
    this.getAllLibraries(this.searchText); 
  }

  deleteCanvas( id ) {
    this.apiService.deleteCanvas(id).subscribe((res) => {
      alert(res.msg);
      this.loadLibrary();
    }, error => {
      console.error('error', error);
    });
  }


  deleteCanvasFn(id) {
    console.log('entryId',id);
    if(confirm("Are you sure to delete Canvas")) {
      this.deleteCanvas(id);
    }
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
