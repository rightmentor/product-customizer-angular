import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FabricjsEditorComponent } from 'projects/angular-editor-fabric-js/src/public-api';
import { $ } from 'protractor';
import { ApiService } from './services/api.service';
import { ModalService } from './_modal/modal.service';
import { CookieService } from 'ngx-cookie-service';
import { exit } from 'node:process';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  
  loginbtn:boolean;
  logoutbtn:boolean;

  title = 'angular-editor-fabric-js';
  productOptions = [];
  colors = ["#0A0A0A", "#0000FF", "#009A85",  "#FF0000", "#CC66CC" ];
  selectedColor = "#000000";
  selectedOptionId;
  currentProductID: any = 0;
  bodyText: string;
  private currentCanvas: fabric.Canvas;
  localStorageKeys = [];
  selectedKey;
  saveLocalData: any = {
    name: '',
    description: '',
    keyword: '',
    json: '',
    image: ''
  };
  savedLibraries: any = [];

  productOptionID = '';
  productOptionValue = '';
  guestUserID = '';
  dbUserID = '1';
  colorID; colorOptionsLabel; colorOptionsID;

  registerForm: FormGroup;
  submitted = false;

  @ViewChildren('myCanvas') myCanvas: FabricjsEditorComponent;
  @ViewChild('canvas', { static: false }) canvas: FabricjsEditorComponent;

  constructor(private apiService: ApiService, private modalService: ModalService, private cookieService: CookieService, private formBuilder: FormBuilder)  {

    //Admin Login case
    //this.apiService.getLoggedInName.subscribe(name => this.changeName(name));
    if(this.apiService.isLoggedIn())
    {
      console.log("loggedin");
      this.loginbtn=false;
      this.logoutbtn=true
    }else{
      this.loginbtn=true;
      this.logoutbtn=false
    }
    
    this.checkJavascript();

    //set cookie for new user guid
    if(!this.cookieService.get('SIMON_GUID')){
      this.cookieService.set( 'SIMON_GUID', this.getUniqueId(5) ); // To Set Cookie
      this.addCurrentUserCookie(this.currentProductID,this.cookieService.get('SIMON_GUID'))
    }else{
      this.guestUserID = this.cookieService.get('SIMON_GUID');
      this.dbUserID = localStorage.getItem('DBUSERID');
    }

  }

  ngOnInit() {
    this.checkJavascript();
    this.registerForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6) ]]
    });
  }

  private changeName(name: boolean): void {
    this.logoutbtn = name;
    this.loginbtn = !name;
  }
  
  logout()
  {
    this.apiService.deleteToken();
    window.location.href = window.location.href;
  }

  get f() { return this.registerForm.controls; }
  
  onSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      if (this.registerForm.invalid) {
          return;
      }
      this.apiService.userlogin(this.registerForm.value.email,this.registerForm.value.password).pipe(first()).subscribe( data => {
        console.log('you are login to my site');
        this.closeModal("login-local");
      },
      error => {
          alert("User name or password is incorrect")
      });
  }
  
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
      

  public getUniqueId(parts: number): string {
    const stringArr = [];
    for(let i = 0; i< parts; i++){
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

  public rasterize() {
    this.canvas.rasterize();
  }

  public rasterizeSVG() {
    this.canvas.rasterizeSVG();
  }

  // public saveCanvasToJSON() {
  //   this.canvas.saveCanvasToJSON();
  //   this.addUserLibraryData();
  // }

  public loadCanvasFromJSON() {
    this.canvas.loadCanvasFromJSON(this.selectedKey);
  }

  public confirmClear() {
    this.canvas.confirmClear();
  }

  public changeSize() {
    this.canvas.changeSize();
  }

  public addText() {
    this.canvas.addText({fill: this.selectedColor});
  }

  public getImgPolaroid(event) {
    this.canvas.getImgPolaroid(event, this.selectedColor);
  }

  public addImageOnCanvas(url) {
    this.canvas.addImageOnCanvas(url);
  }

  public readUrl(event) {
    this.canvas.readUrl(event);
  }

  public removeWhite(url) {
    this.canvas.removeWhite(url);
  }

  public addFigure(figure) {
    this.canvas.addFigure(figure, this.selectedColor);
  }

  public removeSelected() {
    this.canvas.removeSelected();
  }

  public sendToBack() {
    this.canvas.sendToBack();
  }

  public bringToFront() {
    this.canvas.bringToFront();
  }

  public clone() {
    this.canvas.clone();
  }

  public cleanSelect() {
    this.canvas.cleanSelect();
  }

  public setCanvasFill() {
    this.canvas.setCanvasFill();
  }

  public setCanvasImage() {
    this.canvas.setCanvasImage();
  }

  public setId() {
    this.canvas.setId();
  }

  public setOpacity() {
    this.canvas.setOpacity();
  }

  public setFill() {
    this.canvas.setFill();
  }

  public setFontFamily() {
    this.canvas.setFontFamily();
  }

  public setTextAlign(value) {
    this.canvas.setTextAlign(value);
  }

  public setObjectAlign(value) {
    this.canvas.processAlign(value);
  }

  public setBold() {
    this.canvas.setBold();
  }

  public setFontStyle() {
    this.canvas.setFontStyle();
  }

  public hasTextDecoration(value) {
    this.canvas.hasTextDecoration(value);
  }

  public setTextDecoration(value) {
    this.canvas.setTextDecoration(value);
  }

  public setFontSize() {
    this.canvas.setFontSize();
  }

  public setLineHeight() {
    this.canvas.setLineHeight();
  }

  public setCharSpacing() {
    this.canvas.setCharSpacing();
  }

  public rasterizeJSON() {
    this.canvas.rasterizeJSON();
  }

  public redo() {
    this.canvas.redoCanvas();
  }

  public undo() {
    this.canvas.undoCanvas();
  }

  checkJavascript() {
    let parent = null;
    const currentObject = this;
    var QueryString = currentObject.getRequestsParam();
    var product_id = QueryString['product_id'];
    var customer_id = QueryString['customer_id'];
    if (product_id){
      this.currentProductID = product_id;
      currentObject.getProductOptions(product_id);
    }else{
      window.history.back();
    }

  }

  getParma(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
       return decodeURIComponent(name[1]);
  }

  getRequestsParam() {
    var s1 = location.search.substring(1, location.search.length).split('&'),
        r = {}, s2, i;
    for (i = 0; i < s1.length; i += 1) {
        s2 = s1[i].split('=');
        r[decodeURIComponent(s2[0]).toLowerCase()] = decodeURIComponent(s2[1]);
    }
    return r;
  };

  getProductOptions(productID) {
    console.log('calling getProductOptions');
    this.apiService.getProductOptions(productID).subscribe((res: any) => {
      console.log('res', res);
      this.productOptionID = res.data[0].id;
      this.productOptions = res.data[0].option_values;
      this.selectedOptionId = this.productOptions[0].id;
      this.sizeChangeHandler();
      var newcontent = document.createElement('div');
      newcontent.innerHTML = JSON.stringify(res);
    }, error => {
      console.error('error', error);
    });
  }

  sizeChangeHandler() {
    this.productOptionValue = this.selectedOptionId;
    const selectedOption = this.productOptions.filter(opt => parseInt(opt.id, 10) === parseInt(this.selectedOptionId, 10));
    const label = selectedOption[0].label;
    // 1mm =  3.779527559px
    let s = label.substring(label.indexOf("(") + 1);
    s = s.substring(0, s.indexOf(")"));
    const height = s.substring(0, s.indexOf("mm")) * 2;
    if (height) {
      this.canvas.size.height = Math.round((height * 3.779527559) * 10) / 10;
    }
    let width = s.substring(s.indexOf("x") + 1);
    if (width) {
      width = width.substring(0, width.indexOf("mm")) * 2;
      if (width) {
        this.canvas.size.width = Math.round((width * 3.779527559) * 10) / 10;
      }
    }

    this.changeSize();
  }

  getProductModifiersSwatch(productID,colorCode: string) {
    this.apiService.getProductModifiersSwatch(productID,colorCode).subscribe((res) => {
      this.colorID = res[0].id;
      this.colorOptionsLabel = res[0].label;
      this.colorOptionsID = res[0].option_id;
    }, error => {
      console.error('error', error);
    });
  }


  addCurrentUserCookie(productID,guestId: string) {
    this.apiService.addCurrentUserCookie(productID,guestId).subscribe((res) => {
      console.log(res);
      localStorage.setItem('DBUSERID', res.id);
        this.dbUserID = res.id;
    }, error => {
      console.error('error', error);
    });
  }

  addUserLibraryData(data: any, option_id) {
    this.apiService.addUserLibraryData(data, option_id).subscribe((res) => {
      console.log('res', res);
    }, error => {
      console.error('error', error);
    });
  }

  openModal(id: string) {
    if (id === 'load-library') {
      this.loadLibrary();
    } else if (id === 'save-local') {
      if (this.canvas.canvas._objects.length === 0) {
        alert('Canvas is empty');
        return false;
      }
    }
    this.modalService.open(id);
  }

  closeModal(id: string) {
      this.modalService.close(id);
  }

  save() {
    if (this.canvas.canvas._objects.length === 0) {
      alert('Canvas is empty');
      return false;
    }

    if (this.colorID === undefined || this.colorOptionsID === undefined) {
      alert('Please select Ink Color');
      return false;
    }

    console.log(' Save func called ', this.canvas); 
    this.saveLocalData.name = "addtocart";
    this.saveLocalData.description = "addtocart";
    this.saveLocalData.keyword = "addtocart";
    this.saveJson();
    this.saveLocalData = JSON.parse(localStorage.getItem(localStorage.getItem('lastsave')));

    var attributes = {
      quantity: 1,
      product_id: this.currentProductID,
      variant_id: '',
      modifire_id: this.productOptionID,
      modifire_value: this.productOptionValue,
      option_selections: [
        {
          option_id: this.colorOptionsID,
          option_value: this.colorID
        },
        {
          option_id: 132,
          option_value: 638
        },
        {
          option_id: 133,
          option_value: localStorage.getItem('lastsave')
        }
      ]
    }
    
    this.apiService.addToCartData(attributes).subscribe((res: any) => {
      console.log('res', res);
         }, error => {
      console.error('error', error);
    });
  }

  cancel() {
    console.log(' cancel func called ');
    window.location = "/";
  }

  setAllElementColor(color) {
    console.log(color);
    this.selectedColor = color;
    var split_hash = color.replace('#', '');
    this.canvas.setAllElementColor(color);
    this.getProductModifiersSwatch(this.currentProductID,split_hash);
  }

  getSavedLibraies (guid) {
    this.apiService.getSavedLibraries(guid).subscribe((res:any) => {
      var values = [];  
      if (res.data.length > 0) {
        res.data.map(function(o1:any) {
          console.log('res-get-libraies', o1);
          localStorage.setItem( o1.meta_key, o1.meta_value );
          values.push( JSON.parse( localStorage.getItem( o1.meta_key ) ) );
        });
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

  saveJson() {
    this.saveLocalData.image = this.canvas.getCanvasSvg();
    this.canvas.saveCanvasToJSON(this.saveLocalData);
    this.addUserLibraryData(this.saveLocalData,this.selectedOptionId);
    this.closeModal("save-local");
    this.saveLocalData =  {
      name: '',
      description: '',
      keyword: '',
      json: '',
      image: ''
    };
  }

  saveOnAddToCart() {
    this.saveLocalData.image = this.canvas.getCanvasSvg();
    this.canvas.saveCanvasToJSON(this.saveLocalData);
    this.addUserLibraryData(this.saveLocalData,this.selectedOptionId);

    var attributes = [
      {
        name: this.productOptionID,
        value: this.productOptionValue
      },
      {
        name: this.colorOptionsID,
        value: this.colorID
      },
      {
        name: '132',
        value: '638'
      },
      {
        name: '133',
        value: this.guestUserID
      }
    ];

    this.saveLocalData =  {
      name: '',
      description: '',
      keyword: '',
      json: '',
      image: ''
    };
  }

  loadCanvas(json) {
    this.canvas.loadCanvas(json);
  }

  
}
