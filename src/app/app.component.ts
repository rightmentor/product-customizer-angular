import { Component, OnInit, ViewChild } from '@angular/core';
import { FabricjsEditorComponent } from 'projects/angular-editor-fabric-js/src/public-api';
import { $ } from 'protractor';
import { ApiService } from './services/api.service';
import { ModalService } from './_modal/modal.service';
import { CookieService } from 'ngx-cookie-service';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-editor-fabric-js';
  productOptions = [];
  colors = ["#0000ff", "#009a85", "#ff0000",  "#cc66cc" ];
  selectedColor = "#000000";
  selectedOptionId;
  bodyText: string;
  private currentCanvas: fabric.Canvas;
  localStorageKeys = [];
  selectedKey;

  @ViewChild('canvas', { static: false }) canvas: FabricjsEditorComponent;

  constructor(private apiService: ApiService, private modalService: ModalService, private cookieService: CookieService)  {
    if(!this.cookieService.get('SIMON_GUID')){
      this.cookieService.set( 'SIMON_GUID', this.getUniqueId(5) ); // To Set Cookie
      console.log('cookie is set: ',this.cookieService.get('SIMON_GUID') );
    }
    this.checkJavascript();
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

  public saveCanvasToJSON() {
    this.canvas.saveCanvasToJSON();
  }

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
    this.canvas.addFigure(figure);
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
      // this.apiService.getTokens().subscribe((res: any) => {
      console.log('res', res);
      this.productOptions = res.data[0].option_values;
      this.selectedOptionId = this.productOptions[0].id;
      this.sizeChangeHandler();
      console.log('reproductOptionss', this.productOptions);
      var newcontent = document.createElement('div');
      newcontent.innerHTML = JSON.stringify(res);
      // document.getElementById("test_show_0").appendChild(newcontent);
    }, error => {
      console.error('error', error);
    });
  }

  sizeChangeHandler() {
    console.log('size changed', this.selectedOptionId);

    const selectedOption = this.productOptions.filter(opt => parseInt(opt.id, 10) === parseInt(this.selectedOptionId, 10));
    console.log('selectedOption', selectedOption)
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

  openModal(id: string) {
    if (id === 'load-library') {
      this.localStorageKeys = Object.keys(localStorage);
      console.log(this.localStorageKeys);
    }
    this.modalService.open(id);
  }

  closeModal(id: string) {
      this.modalService.close(id);
  }

  save() {
    console.log(' Save func called ', this.canvas);    
  }

  cancel() {
    console.log(' cancel func called ');
    window.location = "/";
  }

  setAllElementColor(color) {
    console.log(color);
    this.selectedColor = color;
    this.canvas.setAllElementColor(color);
  }
}
