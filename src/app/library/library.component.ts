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
  guestUserID = '';
  currentProductID: any = 0;
  savedLibraries: any = [];
  filteredLibraried: any = [];
  setupMessage = 'not set up yet';
  someParameterValue = null;
  filterText = '';
  searchString = '';
  productOptionID = '';
  productOptions: any = [];

  constructor(private apiService: ApiService, private activateRoute: ActivatedRoute, private router: Router, private cookieService: CookieService) {
    activateRoute.params.subscribe(params => {
      this.currentProductID = params['id'];
      this.setupComponent(params['id']);
    });

    if (activateRoute.queryParams['_value'].search !== undefined) {
      this.searchString = activateRoute.queryParams['_value'].search;
    }

    //set cookie for new user guid
    if (!this.cookieService.get('SIMON_GUID')) {
      this.cookieService.set('SIMON_GUID', this.getUniqueId(5)); // To Set Cookie
      this.addCurrentUserCookie(this.currentProductID, this.cookieService.get('SIMON_GUID'))
    } else {
      this.guestUserID = this.cookieService.get('SIMON_GUID');
      this.dbUserID = localStorage.getItem('DBUSERID');
    }
    console.log(this.currentProductID);
    this.getProductOptions(this.currentProductID);
    
  }

  public getUniqueId(parts: number): string {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

  addCurrentUserCookie(productID, guestId: string) {
    this.apiService.addCurrentUserCookie(productID, guestId).subscribe((res) => {
      console.log(res);
      localStorage.setItem('DBUSERID', res.id);
      this.dbUserID = res.id;
    }, error => {
      console.error('error', error);
    });
  }

  filter() {
    if (this.filterText !== '') {
      this.filteredLibraried = this.savedLibraries.filter(lib =>  lib[0].name.toLowerCase().indexOf(this.filterText) > -1 || lib[0].description.toLowerCase().indexOf(this.filterText) > -1  || lib[6].toLowerCase().indexOf(this.filterText) > -1 )
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
      var productOP = this.productOptions; 
      console.log('before: ',productOP);
      if (res.data.length > 0) {
        res.data.map(function(o1:any) {
          localStorage.setItem( o1.meta_key, o1.meta_value );
          var valueData = [];
          valueData.push( JSON.parse( localStorage.getItem( o1.meta_key ) ) );
          valueData.push( o1.meta_key );
          valueData.push( productID );
          valueData.push( o1.id );
          valueData.push( o1.guid );
          valueData.push( o1.keywords.split(",") );
          const selectedOption = productOP.filter(opt => parseInt(opt.id, 10) === parseInt(o1.canvas_size, 10));
          console.log(o1.canvas_size);
          const label = selectedOption[0].label;
          
          valueData.push( label );
          values.push( valueData );
          
          // values.push( JSON.parse( localStorage.getItem( o1.meta_key ) ) );
        });
        console.log(values);
        this.savedLibraries = values;
        this.filteredLibraried = values;
        return res.data;
      }
    }, error => {
      console.error('error', error);
    });
  }

  getCanvasSizeDetails(canvas_size){
    const selectedOption = this.productOptions.filter(opt => parseInt(opt.id, 10) === parseInt(canvas_size, 10));
    console.log(selectedOption);
    const label = selectedOption[0].label;
    return label;
  }

  getProductOptions(productID) {
    console.log('calling getProductOptions');
    this.apiService.getProductOptions(productID).subscribe((res: any) => {
      console.log('res', res);
      this.productOptionID = res.data[0].id;
      this.productOptions = res.data[0].option_values;
      console.log(this.productOptions);
      this.loadLibrary();

    }, error => {
      console.error('error', error);
    });
  }

  deleteCanvas( id ) {
    this.apiService.deleteCanvas(id).subscribe((res) => {
      alert(res.msg);
      this.loadLibrary();
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
