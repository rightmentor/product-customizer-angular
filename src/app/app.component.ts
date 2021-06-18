import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
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
  colorID; colorOptionsLabel; colorOptionsID;

  @ViewChildren('myCanvas') myCanvas: FabricjsEditorComponent;
  @ViewChild('canvas', { static: false }) canvas: FabricjsEditorComponent;

  constructor(private apiService: ApiService, private modalService: ModalService, private cookieService: CookieService)  {
    
    this.checkJavascript();
   // this.getSavedLibraies(12);
   this.loadLibrary();
    if(!this.cookieService.get('SIMON_GUID')){
      this.cookieService.set( 'SIMON_GUID', this.getUniqueId(5) ); // To Set Cookie
      //console.log('cookie is set: ',this.cookieService.get('SIMON_GUID') );
      this.addCurrentUserCookie(this.currentProductID,this.cookieService.get('SIMON_GUID'))
    }else{
      this.guestUserID = this.cookieService.get('SIMON_GUID');
    }
  }

  ngOnInit() {
    this.checkJavascript();
    // this.getProductOptions('112');
  }

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
    
    /*
    window.addEventListener("message", ({ data, source }) => {
      if (parent === null) {
        parent = source;
      }
      console.log('data', data);
      console.log('data', data[0].productID);
      
      if (data[0].productID) {
        var newcontent = document.createElement('div');
        newcontent.innerHTML = JSON.stringify(data);
        //document.getElementById("test_show").appendChild(newcontent);

        currentObject.getProductOptions(data[0].productID);
      }
    });*/
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
      // document.getElementById("test_show_0").appendChild(newcontent);
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
    console.log('calling getProductOptions',colorCode);
    this.apiService.getProductModifiersSwatch(productID,colorCode).subscribe((res) => {
      console.log('res', res[0].option_id);

      this.colorID = res[0].id;
      this.colorOptionsLabel = res[0].label;
      this.colorOptionsID = res[0].option_id;
    }, error => {
      console.error('error', error);
    });
  }


  addCurrentUserCookie(productID,guestId: string) {
    this.apiService.addCurrentUserCookie(productID,guestId).subscribe((res) => {
      console.log('res', res);
      //var guid = res.id;
      localStorage.setItem('DBUSERID', res.id);
    }, error => {
      console.error('error', error);
    });
  }

  addUserLibraryData() {
    this.apiService.addUserLibraryData().subscribe((res) => {
      console.log('res', res);
    }, error => {
      console.error('error', error);
    });
  }

  openModal(id: string) {
    if (id === 'load-library') {
      this.loadLibrary();
      // this.localStorageKeys = Object.keys(localStorage);
      // console.log(this.localStorageKeys);
    }
    this.modalService.open(id);
  }

  closeModal(id: string) {
      this.modalService.close(id);
  }

  save() {
    console.log(' Save func called ', this.canvas); 
    var mapForm = document.createElement("form");
    // mapForm.target = "_blank";
    mapForm.method = "POST"; // or "post" if appropriate
    mapForm.action = "https://simonstampcom.mybigcommerce.com/cart.php";
    var attributes = [
      {
        name: 'attribute['+this.productOptionID+']',
        value: this.productOptionValue
      },
      {
        name: 'attribute['+this.colorOptionsID+']',
        value: this.colorID
      },
      {
        name: 'attribute[132]',
        value: '638'
      },
      {
        name: 'attribute[133]',
        value: this.guestUserID
      },
      {
        name: 'qty[]',
        value: '1'
      }
    ];

    // console.log(attributes);


    var actionInput = document.createElement("input");
        actionInput.type = "hidden";
        actionInput.name = "action";
        actionInput.setAttribute("value", "add");
        mapForm.appendChild(actionInput);

    var productIdInput = document.createElement("input");
      productIdInput.type = "hidden";
      productIdInput.name = "product_id";
      productIdInput.setAttribute("value", this.currentProductID);
      mapForm.appendChild(productIdInput);        
        
    attributes.forEach(function(attr){
      var mapInput = document.createElement("input");
      mapInput.type = "hidden";
      mapInput.name = attr.name;
      mapInput.setAttribute("value", attr.value);
      mapForm.appendChild(mapInput);
    });
    
    document.body.appendChild(mapForm);
    mapForm.submit();   
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
      console.log('res', res);  
      if (res.data.length > 0) {
        this.savedLibraries = res.data;
      }
    }, error => {
      console.error('error', error);
    });
  }

  loadLibrary() {
    var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;

    while ( i-- ) {
        values.push( JSON.parse(localStorage.getItem(keys[i])) );
    }
    this.savedLibraries = values;
    console.log(this.savedLibraries)
  }

  saveJson() {
    this.saveLocalData.image = this.canvas.getCanvasSvg();
    this.canvas.saveCanvasToJSON(this.saveLocalData);
    this.closeModal("save-local");
    this.saveLocalData =  {
      name: '',
      description: '',
      keyword: '',
      json: '',
      image: ''
    };
    console.log(this.saveLocalData);
    //   this.addUserLibraryData();
  }

  loadCanvas(json) {
    this.canvas.loadCanvas(json);
  }

  
}
