import { Component, OnInit, ViewChild, ViewChildren, Pipe, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { FabricjsEditorComponent } from 'projects/angular-editor-fabric-js/src/public-api';
import { fabric } from 'fabric';
import { $ } from 'protractor';
import { ApiService } from './../services/api.service';
import { ModalService } from './../_modal/modal.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
// import { exit } from 'node:process';
import { bitmap2vector } from 'bitmap2vector';
import CircleType from 'circletype';
import ArcText from 'arc-text';
import { DomSanitizer } from '@angular/platform-browser';

var potrace = require('potrace');
var arcText = require("arc-text");
var htmlToImage = require('html-to-image')
// var fs = require('fs');

var imagetracerjs = require("imagetracerjs")
declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.scss'],
})

export class CustomizerComponent implements OnInit {

  loginbtn: boolean;
  logoutbtn: boolean;

  title = '';
  productURL = '';
  showFiller: boolean = true;
  showGrid: boolean = false;
  productOptions = [];
  colors = [];
  bgcolors = [];
  mounting = [];
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
    image: '',
    fabricatorImage: ''
  };

  saveImageLocalData: any = {
    productid: '',
    cansize: '',
    name: '',
    description: '',
    keyword: '',
    json: '',
    image: ''
  };
  zoom_value: any = 100;
  zoom_max: any = 50;
  zoom_min: any = -50;
  zoom_current: any = 100;

  savedLibraries: any = [];
  savedImageLibraries: any = [];

  libraryLink = '';
  paramsName = '';
  productOptionID = '';
  productOptionValue = '';
  guestUserID = '';
  dbUserID = '1';
  colorID; colorOptionsLabel; colorOptionsID;
  bgcolorID; bgcolorOptionsLabel; bgcolorOptionsID;
  mountingID; mountingOptionsLabel; mountingOptionsID;
  customizedProduct; customizedProductValue; customizedImageId;
  registerForm: FormGroup;
  submitted = false;
  uploadedImgSVG;

  canvasActiveP = 'active';
  canvasActiveM = '';

  imageActiveP = 'active';
  imageActiveM = '';

  @ViewChildren('myCanvas') myCanvas: FabricjsEditorComponent;
  @ViewChild('canvas', { static: false }) canvas: FabricjsEditorComponent;
  @ViewChild('svgEl') svgEl;

  constructor(private apiService: ApiService, private modalService: ModalService, private cookieService: CookieService, private formBuilder: FormBuilder, private activateRoute: ActivatedRoute, public sanitizer: DomSanitizer) {
    //set product id into the cutomizer
    activateRoute.params.subscribe(params => {
      this.setupComponent(params['id']);
      this.selectedKey = params['id2'];
    })

    this.getProductdetails(this.currentProductID);

    //Admin Login case
    //this.apiService.getLoggedInName.subscribe(name => this.changeName(name));
    if (this.apiService.isLoggedIn()) {
      
      this.loginbtn = false;
      this.logoutbtn = true
    } else {
      this.loginbtn = true;
      this.logoutbtn = false
    }

    this.checkJavascript();

    //set cookie for new user guid
    if (!this.cookieService.get('SIMON_GUID')) {
      this.cookieService.set('SIMON_GUID', this.getUniqueId(5)); // To Set Cookie
      this.addCurrentUserCookie(this.currentProductID, this.cookieService.get('SIMON_GUID'))
    } else {
      this.guestUserID = this.cookieService.get('SIMON_GUID');
      this.dbUserID = localStorage.getItem('DBUSERID');
    }

    this.libraryLink = '/library/'+this.currentProductID;

  }

  ngOnInit() {
    this.checkJavascript();
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.getProductOptionsMountingColor(this.currentProductID);
    this.getProductModifiersOptions(this.currentProductID);
    // this.getProductOptionsColor(this.currentProductID);
    // this.getProductOptionsbgColor(this.currentProductID);
  }

  showFillerEvent() {
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

  logout() {
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
    this.apiService.userlogin(this.registerForm.value.email, this.registerForm.value.password).pipe(first()).subscribe(data => {
      
      localStorage.setItem('DBUSERID', '1');
      this.dbUserID = '1';
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
    for (let i = 0; i < parts; i++) {
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
    
    if(this.showGrid == true){
      this.canvas.removeGrid();
      this.canvas.addGrid();
    }  
  }

  public addText() {
    this.canvas.addText({ fill: this.selectedColor });

    
    // Instantiate `CircleType` with an HTML element.
    const circleType = new CircleType(document.getElementById('test_show'));
    
    // Set the text radius and direction. Note: setter methods are chainable.
    console.log ( 'Circle image: ', circleType.radius(0).dir(1) );

    var node = document.getElementById('test_show');

    htmlToImage.toPng(node)
    .then(function (dataUrl) {
      var img = new Image();
      img.src = dataUrl;
      document.body.appendChild(img);
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error);
    });

    this.closeModal("text-modal");

  }

  public filterSVG (node) {
    return (node.tagName !== 'i');
  }

  public addCurveText() {
    this.canvas.addCurveText({ fill: this.selectedColor });
  }

  public setDiameter() {
    this.canvas.setDiameter();
  }

  public setKerning() {
    this.canvas.setKerning();
  }

  public getImgPolaroid(event) {
    this.canvas.getImgPolaroid(event, this.selectedColor);
  }

  public getImageSVGPolaroid(event) {
    this.canvas.getImageSVGPolaroid(event, this.selectedColor);
  }

  public addImageOnCanvas(url) {
    let ref = this;
    // imagetracerjs.imageToSVG(url, function (svgstr) {
    //   ref.canvas.getImageSVGPolaroid(svgstr, ref.selectedColor);
    // }, "default");
    potrace.trace(url, function (err, svg) {
      if (err) throw err;
      ref.canvas.getImageSVGPolaroid(svg, ref.selectedColor);
   
      ref.saveImageLocalData.image = svg;
      ref.saveImage();
    });


    // this.canvas.addImageOnCanvas(url);
    // this.canvas.getImageSVGPolaroid(this.uploadedImgSVG, ref.selectedColor);
    this.closeModal('upload-image-model');
  }


  public readUrl(event) {
    const file = event.target.files[0];
    this.canvas.readUrl(event);
    // const reader = new FileReader();
    // let ref = this;
    // reader.onload = (readerEvent) => {
    //   potrace.trace(readerEvent.target.result, function (err, svg) {
    //     if (err) throw err;
    //     ref.uploadedImgSVG = svg;
    //     ref.canvas.getImageSVGPolaroid(svg, ref.selectedColor);
    //     
    //   });
    // };
    // reader.readAsDataURL(event.target.files[0]);
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

  public setCanvasFill(color) {
    this.canvas.setCanvasFill(color);
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
    setTimeout(() => {
      this.canvas.setFontFamily();
    }, 500)
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
    if (product_id) {
      this.currentProductID = product_id;
      currentObject.getProductOptions(product_id);
    } else {
      window.history.back();
    }

  }

  getParma(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
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
    
    this.apiService.getProductOptions(productID).subscribe((res: any) => {
      
      this.productOptionID = res.data[0].id;
      this.productOptions = res.data[0].option_values;
      this.selectedOptionId = this.productOptions[0].id;
      this.sizeChangeHandler();
      var newcontent = document.createElement('div');
      newcontent.innerHTML = JSON.stringify(res);
      //set selected lib data in the canvas
      var keyData = JSON.parse(localStorage.getItem(this.selectedKey));
      
      // this.loadCanvas(keyData.json,keyData.cansize);
      if (keyData.cansize == '108') {
        this.loadCanvas(keyData.json, this.selectedOptionId);
      } else {
        this.loadCanvas(keyData.json, keyData.cansize);
      }

    }, error => {
      console.error('error', error);
    });
  }

  sizeChangeHandler() {
    this.productOptionValue = this.selectedOptionId;
    const selectedOption = this.productOptions.filter(opt => parseInt(opt.id, 10) === parseInt(this.selectedOptionId, 10));
    

    
    const label = selectedOption[0].label;

    var iHeight = 190*selectedOption[0].width;
    var iWidth = 190*selectedOption[0].height;

    // 1mm =  3.779527559px
    /*let s = label.substring(label.indexOf("(") + 1);
    s = s.substring(0, s.indexOf(")"));
    const height = s.substring(0, s.indexOf("mm"));
    if (height) {
      this.canvas.size.height = Math.round((height * 3.779527559) * 10) / 10;
    }
    let width = s.substring(s.indexOf("x") + 1);
    if (width) {
      width = width.substring(0, width.indexOf("mm"));
      if (width) {
        this.canvas.size.width = Math.round((width * 3.779527559) * 10) / 10;
      }
    }*/

    if (iHeight) {
      this.canvas.size.height = Math.round(iHeight);
    }
    if (iWidth) {
        this.canvas.size.width = Math.round(iWidth);
    }

    this.changeSize();

  }

  getProductdetails(productID) {
    this.apiService.getProductdetails(productID).subscribe((res) => {
      this.title = res.data.name;
      this.productURL = 'https://simonstampcom.mybigcommerce.com'+res.data.custom_url.url;
    }, error => {
      console.error('error', error);
    });
  }

  getProductModifiersSwatch(productID, colorCode: string) {
    this.apiService.getProductModifiersSwatch(productID, colorCode).subscribe((res) => {
      this.colorID = res[0].id;
      this.colorOptionsLabel = res[0].label;
      this.colorOptionsID = res[0].option_id;
    }, error => {
      console.error('error', error);
    });
  }

  getProductModifiersOptions(productID) {
    this.apiService.getProductModifiersSwatch(productID, 'NULL').subscribe((res) => {
      // 
      this.customizedProduct = res[0].customized_product;
      this.customizedProductValue = res[0].customized_product_value;
      this.customizedImageId = res[0].customized_image_id;
    }, error => {
      console.error('error', error);
    });
  }

  getProductOptionsColor(productID) {
    this.apiService.getProductOptionsColor(productID).subscribe((res) => {
      // 
      this.colors = res;
    }, error => {
      console.error('error', error);
    });
  }

  getProductOptionsbgColor(productID) {
    this.apiService.getProductOptionsbgColor(productID).subscribe((res) => {
      // 
      this.bgcolors = res;
    }, error => {
      console.error('error', error);
    });
  }
  
  getProductOptionsMountingColor(productID) {
    this.apiService.getProductOptionsMountingColor(productID).subscribe((res) => {
      
      for (const [key, value] of Object.entries(res)) {
        if(value['name'] == 'Mounting Options'){
          this.mountingOptionsID = key;
          this.mounting = value['data'];
        }else if(value['name'] == 'Color' || value['name'] == 'Ink Color' || value['name'] == 'Custom rubber stamps'){
          this.colorOptionsID = key;
          this.colors = value['data'];
        }else if(value['name'] == 'Background Color'){
          this.bgcolorOptionsID = key;
          this.bgcolors = value['data'];
        }
        
      }

      //this.mounting = res;
    }, error => {
      console.error('error', error);
    });
  }

  addCurrentUserCookie(productID, guestId: string) {
    this.apiService.addCurrentUserCookie(productID, guestId).subscribe((res) => {
      
      localStorage.setItem('DBUSERID', res.id);
      this.dbUserID = res.id;
    }, error => {
      console.error('error', error);
    });
  }

  addUserLibraryData(data: any, option_id) {
    this.apiService.addUserLibraryData(data, option_id).subscribe((res) => {
      
    }, error => {
      console.error('error', error);
    });
  }

  openModal(id: string) {
    if (id === 'load-library') {
      this.loadLibrary();
    }
    else if (id === 'load-image-library') {
      this.loadImageLibrary();
    }
    else if (id === 'save-local') {
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

    if (this.colors.length > 0) {
      if (this.colorID === undefined || this.colorOptionsID === undefined) {
        alert('Please select Ink Color');
        return false;
      }
    } else {
      this.colorID = '0';
      this.colorOptionsID = '0';
    }

    
    this.saveLocalData.productid = this.currentProductID;
    this.saveLocalData.cansize = this.selectedOptionId;
    this.saveLocalData.name = "added-to-cart-" + localStorage.getItem('lastsave');
    this.saveLocalData.description = "added-to-cart-" + localStorage.getItem('lastsave');
    this.saveLocalData.keyword = "added-to-cart-" + localStorage.getItem('lastsave');
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

    

    this.apiService.addToCartData(attributes).subscribe((res: any) => {
      
      window.location = res.cart_url;
    }, error => {
      console.error('error', error);
    });
  }

  cancel() {
    
    window.location = this.productURL;
  }

  setAllElementColor(color) {
    
    this.selectedColor = color;
    var split_hash = color.replace('#', '');
    this.canvas.setAllElementColor(color);
    this.getProductModifiersSwatch(this.currentProductID, split_hash);
  }

  getSavedLibraies(guid, auid) {
    // this.apiService.getSavedLibraries(guid, this.currentProductID).subscribe((res: any) => {
    this.apiService.getSavedLibrariesTab(guid, this.currentProductID, auid).subscribe((res: any) => {
      var productOP = this.productOptions;
      var values = [];
      if (res.data != null && res.data.length > 0) {
        res.data.map(function (o1: any) {
          
          localStorage.setItem(o1.meta_key, o1.meta_value);
          var valueData = [];
          // values.push(JSON.parse(localStorage.getItem(o1.meta_key)));
          valueData.push(JSON.parse(localStorage.getItem(o1.meta_key)));
          valueData.push(o1.meta_key);
          valueData.push(o1.product_id);
          valueData.push(o1.id);
          valueData.push(o1.guid);
          valueData.push(o1.keywords.split(","));
          const selectedOption = productOP.filter(opt => parseInt(opt.id, 10) === parseInt(o1.canvas_size, 10));
          
          const label = selectedOption[0].label;
          
          valueData.push( label );
          values.push(valueData);
        });
        this.savedLibraries = values;
        
        return res.data;
      }
    }, error => {
      console.error('error', error);
    });
  }

  loadLibrary() {
    this.savedLibraries = [];
    this.canvasActiveP = 'active';
    this.canvasActiveM = '';
    this.getSavedLibraies(1, 1);
  }

  loadMyLibrary() {
    this.savedLibraries = [];
    this.canvasActiveP = '';
    this.canvasActiveM = 'active';
    this.getSavedLibraies(this.dbUserID, 2);
  }

  saveJson() {
    this.saveLocalData.productid = this.currentProductID;
    this.saveLocalData.cansize = this.selectedOptionId;
    this.saveLocalData.image = this.canvas.getCanvasSvg();
    this.canvas.saveCanvasToJSON(this.saveLocalData);
    this.setAllElementColor('#000000');
    this.saveLocalData.fabricatorImage = this.canvas.getCanvasSvg();
    this.addUserLibraryData(this.saveLocalData, this.selectedOptionId);

    


    this.closeModal("save-local");
    this.saveLocalData = {
      productid: '',
      cansize: '',
      name: '',
      description: '',
      keyword: '',
      json: '',
      image: '',
      fabricatorImage: ''
    };
  }

  saveOnAddToCart() {
    this.saveLocalData.productid = this.currentProductID;
    this.saveLocalData.cansize = this.selectedOptionId;
    this.saveLocalData.image = this.canvas.getCanvasSvg();
    this.canvas.saveCanvasToJSON(this.saveLocalData);
    this.setAllElementColor('#000000');
    this.saveLocalData.fabricatorImage = this.canvas.getCanvasSvg();
    this.addUserLibraryData(this.saveLocalData, this.selectedOptionId);

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

    this.saveLocalData = {
      productid: '',
      cansize: '',
      name: '',
      description: '',
      keyword: '',
      json: '',
      image: '',
      fabricatorImage: ''
    };
  }

  loadCanvas(json, size) {
    
    this.selectedOptionId = size;
    this.sizeChangeHandler();
    this.canvas.loadCanvas(json);
  }

  addUserImageLibraryData(data: any, option_id) {
    this.apiService.addUserImageLibraryData(data, option_id).subscribe((res) => {
      
    }, error => {
      console.error('error', error);
    });
  }

  saveImage() {
    this.addUserImageLibraryData(this.saveImageLocalData, this.currentProductID);
    this.closeModal("save-local");
    this.saveImageLocalData = {
      productid: '',
      cansize: '',
      name: '',
      description: '',
      keyword: '',
      json: '',
      image: ''
    };
  }

  loadImageLibrary() {
    this.savedImageLibraries = [];
    this.imageActiveP = 'active';
    this.imageActiveM = '';
    this.getSavedImageLibraies(1, 1);
  }

  loadMyImageLibrary() {
    this.savedImageLibraries = [];
    this.imageActiveP = '';
    this.imageActiveM = 'active';
    this.getSavedImageLibraies(this.dbUserID, 2);
  }

  loadImageCanvas(svg) {
    this.canvas.getImageSVGPolaroid(svg, this.selectedColor);
  }

  getSavedImageLibraies(guid, auid) {
    // this.apiService.getSavedLibraries(guid, this.currentProductID).subscribe((res: any) => {
    this.apiService.getSavedImageLibrariesTab(guid, this.currentProductID, auid).subscribe((res: any) => {
      var values = [];
      if (res.data != null && res.data.length > 0) {
        res.data.map(function (o1: any) {
          values.push(o1);
        });
        this.savedImageLibraries = values;
        
        return res.data;
      }
    }, error => {
      console.error('error', error);
    });
  }

  deleteCanvasFn(id) {
    
    if (confirm("Are you sure to delete Canvas")) {
      this.deleteCanvas(id);
    }
  }

  deleteCanvas(id) {
    this.apiService.deleteCanvas(id).subscribe((res) => {
      alert(res.msg);
      this.loadLibrary();
    }, error => {
      console.error('error', error);
    });
  }

  deleteImageFn(id) {
    
    if (confirm("Are you sure to delete Image")) {
      this.deleteImage(id);
    }
  }

  deleteImage(id) {
    this.apiService.deleteImage(id).subscribe((res) => {
      alert(res.msg);
      this.loadMyLibrary();
    }, error => {
      console.error('error', error);
    });
  }

  zoomout() {
    
    if (this.zoom_value >= 25) {
      this.zoom(this.zoom_value);
    }
  }

  zoomin() {
    if (this.zoom_value <= 400) {
      this.zoom(this.zoom_value);
    }
  }

  zoom(e) {
    // this.canvas.zoomCanvas(this.zoom_value);
    
    
    if(this.zoom_value == '100'){
      var zoomLevel = 1;
    }else{
      var zoomLevel = (this.zoom_current - this.zoom_value) / 100;
    }
    var zoomLevelCan = this.zoom_value / 100;
    

    
    if(zoomLevel > 1){
      this.canvas.zoomCanvas( -Math.abs(zoomLevelCan) );
      this.canvas.zoomsetDimensions({
        width: this.canvas.size.width * 1,
        height: this.canvas.size.height * 1
      });
      this.canvas.zoomsetDimensions({
        width: this.canvas.size.width / zoomLevelCan,
        height: this.canvas.size.height / zoomLevelCan
      });
    }else{
      this.canvas.zoomCanvas( Math.abs(zoomLevelCan) );
      this.canvas.zoomsetDimensions({
        width: this.canvas.size.width * 1,
        height: this.canvas.size.height * 1
      });
      this.canvas.zoomsetDimensions({
        width: this.canvas.size.width * Math.abs(zoomLevelCan),
        height: this.canvas.size.height * Math.abs(zoomLevelCan)
      });
    }
    this.canvas.zoomRuller(zoomLevel,zoomLevelCan);

    this.zoom_current = this.zoom_value;
  }

  addGrid(){
    
    if(this.showGrid == false){
      this.canvas.addGrid();
      this.showGrid = true;
    }else{
      this.canvas.removeGrid();
      this.showGrid = false;
    }
  }
}
