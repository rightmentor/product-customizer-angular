import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FabricjsEditorComponent } from 'projects/angular-editor-fabric-js/src/public-api';
import { $ } from 'protractor';
import { ApiService } from './../services/api.service';
import { ModalService } from './../_modal/modal.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { exit } from 'node:process';
import { bitmap2vector } from 'bitmap2vector';

var imagetracerjs = require("imagetracerjs")
declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.scss']
})

export class CustomizerComponent implements OnInit {
  
  loginbtn:boolean;
  logoutbtn:boolean;

  title = 'angular-editor-fabric-js';
  showFiller: boolean = true;
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
    productid: '',
    cansize: '',
    name: '',
    description: '',
    keyword: '',
    json: '',
    image: ''
  };
  savedLibraries: any = [];

  paramsName = '';
  productOptionID = '';
  productOptionValue = '';
  guestUserID = '';
  dbUserID = '1';
  colorID; colorOptionsLabel; colorOptionsID;
  customizedProduct;customizedProductValue;customizedImageId;
  registerForm: FormGroup;
  submitted = false;

  @ViewChildren('myCanvas') myCanvas: FabricjsEditorComponent;
  @ViewChild('canvas', { static: false }) canvas: FabricjsEditorComponent;
  @ViewChild('svgEl') svgEl;

  constructor(private apiService: ApiService, private modalService: ModalService, private cookieService: CookieService, private formBuilder: FormBuilder, private activateRoute: ActivatedRoute)  {
    //set product id into the cutomizer
    activateRoute.params.subscribe(params => {
      this.setupComponent(params['id']);
      this.selectedKey = params['id2'];
    })

  
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
    this.getProductModifiersOptions(this.currentProductID);
    this.getProductOptionsColor(this.currentProductID);
  }

  showFillerEvent(){
    this.showFiller = !this.showFiller;       
  }

  setupComponent(someParam) {
    this.paramsName = someParam;
    this.currentProductID = someParam;
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

  public getImageSVGPolaroid(event) {
    this.canvas.getImageSVGPolaroid(event, this.selectedColor);
  }

  public addImageOnCanvas(url) {
    let ref = this;
    imagetracerjs.imageToSVG(url, function (svgstr) { 
      ref.canvas.getImageSVGPolaroid(svgstr, ref.selectedColor);
    }, "default" );

    // this.canvas.addImageOnCanvas(url);
    this.closeModal('upload-image-model');
  }


  public readUrl(event) {
    const file = event.target.files[0];
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
    console.log('active object');
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
    // var QueryString = currentObject.getRequestsParam();
    var product_id = this.currentProductID;
    // var customer_id = QueryString['customer_id'];
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
      //set selected lib data in the canvas
      var keyData =  JSON.parse( localStorage.getItem(this.selectedKey) );
      console.log('keyData',keyData.cansize);
      // this.loadCanvas(keyData.json,keyData.cansize);
      if(keyData.cansize == '108'){
        this.loadCanvas(keyData.json,this.selectedOptionId);
      }else{
        this.loadCanvas(keyData.json,keyData.cansize);
      }
      
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

  getProductModifiersOptions(productID) {
    this.apiService.getProductModifiersSwatch(productID,'NULL').subscribe((res) => {
      console.log('customizeProducrt: ',res);
      this.customizedProduct = res[0].customized_product;
      this.customizedProductValue = res[0].customized_product_value;
      this.customizedImageId = res[0].customized_image_id;
    }, error => {
      console.error('error', error);
    });
  }

  getProductOptionsColor(productID) {
    this.apiService.getProductOptionsColor(productID).subscribe((res) => {
      console.log('customizeProductColor: ',res);
      this.colors = res;
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
    
    if(this.colors.length > 0){
      if (this.colorID === undefined || this.colorOptionsID === undefined) {
        alert('Please select Ink Color');
        return false;
      }
    }else{
      this.colorID = '0';
      this.colorOptionsID = '0';
    }

    console.log(' Save func called ', this.canvas); 
    this.saveLocalData.productid = this.currentProductID;
    this.saveLocalData.cansize = this.selectedOptionId;
    this.saveLocalData.name = "added-to-cart-"+localStorage.getItem('lastsave');
    this.saveLocalData.description = "added-to-cart-"+localStorage.getItem('lastsave');
    this.saveLocalData.keyword = "added-to-cart-"+localStorage.getItem('lastsave');
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
          color_id: this.colorOptionsID,
          color_value: this.colorID
        },
        {
          customizedImageId: this.customizedImageId,
          customizedImageValue: localStorage.getItem('lastsave')
        }
      ]
    }

    console.log('attributeas: ',attributes);
    
    this.apiService.addToCartData(attributes).subscribe((res: any) => {
      console.log('res', res);
      window.location = res.cart_url;
         }, error => {
      console.error('error', error);
    });
  }

  cancel() {
    console.log(' cancel func called ');
    window.location = "https://simonstampcom.mybigcommerce.com/";
  }

  setAllElementColor(color) {
    console.log(color);
    this.selectedColor = color;
    var split_hash = color.replace('#', '');
    this.canvas.setAllElementColor(color);
    this.getProductModifiersSwatch(this.currentProductID,split_hash);
  }

  getSavedLibraies (guid) {
    this.apiService.getSavedLibraries( guid, this.currentProductID ).subscribe((res:any) => {
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
    this.saveLocalData.productid = this.currentProductID;
    this.saveLocalData.cansize = this.selectedOptionId;
    this.saveLocalData.image = this.canvas.getCanvasSvg();
    this.canvas.saveCanvasToJSON(this.saveLocalData);
    this.addUserLibraryData(this.saveLocalData,this.selectedOptionId);
    this.closeModal("save-local");
    this.saveLocalData =  {
      productid: '',
      cansize: '',
      name: '',
      description: '',
      keyword: '',
      json: '',
      image: ''
    };
  }

  saveOnAddToCart() {
    this.saveLocalData.productid = this.currentProductID;
    this.saveLocalData.cansize = this.selectedOptionId;
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
        name: '135',
        value: this.guestUserID
      }
    ];

    this.saveLocalData =  {
      productid: '',
      cansize: '',
      name: '',
      description: '',
      keyword: '',
      json: '',
      image: ''
    };
  }

  loadCanvas(json,size) {
    console.log("size is define as:",size);
    this.selectedOptionId = size;
    this.sizeChangeHandler();
    this.canvas.loadCanvas(json);
  }

  
}