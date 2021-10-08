import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fabric } from 'fabric';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'angular-editor-fabric-js',
  templateUrl: './angular-editor-fabric-js.component.html',
  styleUrls: ['./angular-editor-fabric-js.component.css'],
})
export class FabricjsEditorComponent implements AfterViewInit {
  @ViewChild('htmlCanvas') htmlCanvas: ElementRef;

  public canvas: fabric.Canvas;
  public props = {
    canvasFill: '#ffffff',
    canvasImage: '',
    id: null,
    opacity: null,
    fill: null,
    fontSize: null,
    lineHeight: null,
    charSpacing: null,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    TextDecoration: ''
  };

  public canvasConfig = {
    canvasState: [],
    currentStateIndex: -1,
    undoStatus: false,
    redoStatus: false,
    undoFinishedStatus: 1,
    redoFinishedStatus: 1,
    redoDisabled: true,
    undoDisabled: true
  };

  public textString: string;
  public currentIndex = 0;
  public url: string | ArrayBuffer = '';
  public size: any = {
    width: 500,
    height: 800
  };

  public canvasSteps: any = [];
  private isUndoRedo = false;
  public json: any;
  private globalEditor = false;
  public textEditor = false;
  private imageEditor = false;
  public figureEditor = false;
  public selected: any;
  private guid: any;

  constructor(private cookieService: CookieService) { 
    this.guid = this.cookieService.get('SIMON_GUID')
    console.log('[this.guid] ',this.guid );
  }

  ngAfterViewInit(): void {
    
    // setup front side canvas
    this.canvas = new fabric.Canvas(this.htmlCanvas.nativeElement, {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
      preserveObjectStacking: true
    });
    
    this.canvas.on({
      'object:moving': (e) => {
      },
      'object:added': (e) => {
        this.modifyCanvas(e);
      },
      'event:drop': (e) => {
        // console.log('dropped');
      },
      'after:render': (e) => {
        // this.modifyCanvas(e);
      },
      'object:modified': (e) => {
        this.modifyCanvas(e);
      },
      'selection:created': (e) => {
        console.log('show canvas selected:',e);
        const selectedObject = e.target;
        this.selected = selectedObject;
        selectedObject.hasRotatingPoint = true;
        selectedObject.transparentCorners = false;
        selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';

        this.resetPanels();

        if (selectedObject.type !== 'group' && selectedObject) {

          this.getId();
          this.getOpacity();

          switch (selectedObject.type) {
            case 'rect':
            case 'circle':
            case 'triangle':
              this.figureEditor = true;
              this.getFill();
              break;
            case 'i-text':
              this.textEditor = true;
              this.getLineHeight();
              this.getCharSpacing();
              this.getBold();
              this.getFill();
              this.getTextDecoration();
              this.getTextAlign();
              this.getFontFamily();
              break;
            case 'image':
              break;
          }
        }
      },
      'selection:cleared': (e) => {
        this.selected = null;
        this.resetPanels();
      }
    });

    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);

    // get references to the html canvas element & its context
    this.canvas.on('mouse:down', (e) => {
      const canvasElement: any = document.getElementById('canvas');
    });
    this.canvasSteps = [];
    this.canvasSteps.push(JSON.stringify(this.canvas.toJSON()));
  }


  /*------------------------Block elements------------------------*/

  // Change all canvas elements color 

  setAllElementColor(color) {
    var objs = this.canvas.getObjects().map(function(o:any) {
      // console.log('canvas object: ', o);
      if(o._objects){
        o._objects.map(function(o1:any) {
          if(o1.fill == '#FFFFFF' || o1.fill == '#ffffff' || o1.stroke == '#ffffff'){
            o1.set('stroke', '#FFFFFF');
            return o1.set('fill', '#FFFFFF');
          }else{
            return o1.set('fill', color);
          }
        });
      } else if (o.stroke === null || o.stroke === '') {
        return o.set('fill', color);
      } else if (o.stroke !== null || o.stroke !== '') {
        return o.set('stroke', color);
      }
    });
    // this.setActiveStyle('fill', color, null);
    this.canvas.renderAll();
  }


  /*------------------------Block elements------------------------*/

  // Block "Size"

  changeSize() {
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }

  // Block "Add text"

  // addText() {
  //   if (this.textString) {
  //     const text = new fabric.IText(this.textString, {
  //       left: 10,
  //       top: 10,
  //       fontFamily: 'helvetica',
  //       angle: 0,
  //       fill: '#000000',
  //       fontSize: 40,
  //       scaleX: 0.5,
  //       scaleY: 0.5,
  //       fontWeight: '',
  //       hasRotatingPoint: true
  //     });

  //     this.extend(text, this.randomId());
  //     this.canvas.add(text);
  //     this.selectItemAfterAdded(text);
  //     this.textString = '';
  //   }
  // }

  addText(attr) {
    if (this.textString) {
      const text = new fabric.IText(this.textString, {
        left: 10,
        top: 10,
        fontFamily: 'helvetica',
        angle: 0,
        fill: attr.fill,
        fontSize: 40,
        scaleX: 0.5,
        scaleY: 0.5,
        fontWeight: '',
        hasRotatingPoint: true
      });

      this.extend(text, this.randomId());
      this.canvas.add(text);
      this.selectItemAfterAdded(text);
      this.textString = '';
    }
  }

  // Block "Add images"

  getImgPolaroid(event: any, color: string) {
    const el = event.target;
    fabric.loadSVGFromURL(el.src, (objects, options) => {
      const image = fabric.util.groupSVGElements(objects, options);
      image.set({
        left: 10,
        top: 10,
        angle: 0,
        padding: 10,
        cornerSize: 10,
        hasRotatingPoint: true
      });
      image.scaleToWidth(100);
      // image.scaleToHeight(100);
      // image.fill=color;
      console.log('on image load: ', objects);
      var objs = objects.map(function(o:any) {
        
        if(o.group){

          o.group._objects.map(function(o1:any) {

            if(o1.fill == '#FFFFFF' || o1.fill == '#ffffff' || o1.stroke == '#ffffff'){
              o1.set('stroke', '#FFFFFF');
              return o1.set('fill', '#FFFFFF');
            }else{
              return o1.set('fill', color);
            }
          });
        }else{

          return o.set('fill', color);
        }
      });

      this.extend(image, this.randomId());
      this.canvas.add(image);
      this.selectItemAfterAdded(image);
    });
  }

  getImageSVGPolaroid(svgStr: string, color: string){
    let ref = this;
    fabric.loadSVGFromString(svgStr, function(objects, options) {
      const image = fabric.util.groupSVGElements(objects, options);
      image.set({
        left: 10,
        top: 10,
        angle: 0,
        padding: 10,
        cornerSize: 10,
        hasRotatingPoint: true
      });
      image.scaleToWidth(100);
      // image.scaleToHeight(100);
      // image.fill=color;
      console.log('on image load: ', objects);
      var objs = objects.map(function(o:any) {
        
        if(o.group){

          o.group._objects.map(function(o1:any) {

            if(o1.fill == '#FFFFFF' || o1.fill == '#ffffff' || o1.stroke == '#ffffff'){
              o1.set('stroke', '#FFFFFF');
              return o1.set('fill', '#FFFFFF');
            }else{
              return o1.set('fill', color);
            }
          });
        }else{

          return o.set('fill', color);
        }
      });

      ref.extend(image, ref.randomId());
      ref.canvas.add(image);
      ref.selectItemAfterAdded(image);
   })

  }

  // Block "Upload Image"

  addImageOnCanvas(url) {
    if (url) {
      fabric.Image.fromURL(url, (image) => {
        image.set({
          left: 10,
          top: 10,
          angle: 0,
          padding: 10,
          cornerSize: 10,
          hasRotatingPoint: true
        });
        image.scaleToWidth(200);
        image.scaleToHeight(200);
        this.extend(image, this.randomId());
        this.canvas.add(image);
        this.selectItemAfterAdded(image);
      });
    }
  }

  readUrl(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        this.url = readerEvent.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  removeWhite(url) {
    this.url = '';
  }

  // Block "Add figure"

  addFigure(figure, color: string) {
    let add: any;
    console.log(color);
    switch (figure) {
      case 'rectangle':
        add = new fabric.Rect({
          width: 200, height: 100, left: 10, top: 10, angle: 0, fill: 'rgba(0,0,0,0)', hasBorders: true, strokeWidth: 1, noScaleCache: false, strokeUniform: true,
          stroke: color
        });
        break;
      case 'square':
        add = new fabric.Rect({
          width: 100, height: 100, left: 10, top: 10, angle: 0, fill: 'rgba(0,0,0,0)', hasBorders: true, strokeWidth: 1, noScaleCache: false, strokeUniform: true,
          stroke: color
        });
        break;
      case 'triangle':
        add = new fabric.Triangle({
          width: 100, height: 100, left: 10, top: 10, fill: 'rgba(0,0,0,0)', hasBorders: true, strokeWidth: 1, noScaleCache: false, strokeUniform: true,
          stroke: color
        });
        break;
      case 'circle':
        add = new fabric.Circle({
          radius: 50, left: 10, top: 10, fill: 'rgba(0,0,0,0)', hasBorders: true, strokeWidth: 1, noScaleCache: false, strokeUniform: true,
          stroke: color
        });
        break;
    }
    this.extend(add, this.randomId());
    this.canvas.add(add);
    this.selectItemAfterAdded(add);
    
  }

  /*Canvas*/

  cleanSelect() {
    this.canvas.discardActiveObject().renderAll();
  }

  selectItemAfterAdded(obj) {
    this.canvas.discardActiveObject().renderAll();
    this.canvas.setActiveObject(obj);
    console.log(obj)
  }

  setCanvasFill() {
    if (!this.props.canvasImage) {
      this.canvas.backgroundColor = this.props.canvasFill;
      this.canvas.renderAll();
    }
  }

  extend(obj, id) {
    obj.toObject = ((toObject) => {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id
        });
      };
    })(obj.toObject);
  }

  setCanvasImage() {
    const self = this;
    if (this.props.canvasImage) {
      this.canvas.setBackgroundColor(new fabric.Pattern({ source: this.props.canvasImage, repeat: 'repeat' }), () => {
        self.props.canvasFill = '';
        self.canvas.renderAll();
      });
    }
  }

  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }

  /*------------------------Global actions for element------------------------*/

  getActiveStyle(styleName, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) { return ''; }

    if (object.getSelectionStyles && object.isEditing) {
      return (object.getSelectionStyles()[styleName] || '');
    } else {
      return (object[styleName] || '');
    }
  }

  setActiveStyle(styleName, value: string | number, object: fabric.IText) {
    object = object || this.canvas.getActiveObject() as fabric.IText;
    if (!object) { return; }

    if (object.setSelectionStyles && object.isEditing) {
      const style = {};
      style[styleName] = value;

      if (typeof value === 'string') {
        if (value.includes('underline')) {
          object.setSelectionStyles({ underline: true });
        } else {
          object.setSelectionStyles({ underline: false });
        }

        if (value.includes('overline')) {
          object.setSelectionStyles({ overline: true });
        } else {
          object.setSelectionStyles({ overline: false });
        }

        if (value.includes('line-through')) {
          object.setSelectionStyles({ linethrough: true });
        } else {
          object.setSelectionStyles({ linethrough: false });
        }
      }

      object.setSelectionStyles(style);
      object.setCoords();

    } else {
      if (typeof value === 'string') {
        if (value.includes('underline')) {
          object.set('underline', true);
        } else {
          object.set('underline', false);
        }

        if (value.includes('overline')) {
          object.set('overline', true);
        } else {
          object.set('overline', false);
        }

        if (value.includes('line-through')) {
          object.set('linethrough', true);
        } else {
          object.set('linethrough', false);
        }
      }

      object.set(styleName, value);
    }

    object.setCoords();
    this.canvas.renderAll();
    this.modifyCanvas(null);
  }

  processAlign(val) {
    const object = this.canvas.getActiveObject();
    if (!object) { return ''; }

    switch (val) {
      case 'left':
        object.set({
          left: 0
        });
        break;
      case 'right':
        object.set({
          left: this.canvas.getWidth() - (object.width * object.scaleX)
        });
        break;
      case 'top':
        object.set({
          top: 0
        });
        break;
      case 'bottom':
        object.set({
          top: this.canvas.getHeight() - (object.height * object.scaleY)
        });
        break;
      case 'center':
        object.set({
          left: (this.canvas.getWidth() / 2) - ((object.width * object.scaleX) / 2)
        });
        break;
    }

    object.setCoords();
    this.canvas.renderAll();
  }

  getActiveProp(name) {
    const object = this.canvas.getActiveObject();
    if (!object) { return ''; }

    return object[name] || '';
  }

  setActiveProp(name, value) {
    const object = this.canvas.getActiveObject();
    console.log('object', object)
    if (!object) { return; }
    object.set(name, value).setCoords();
    console.log('object sdfsdf', object)
    setTimeout(()=>{
      this.canvas.renderAll();
    }, 1000)
  }

  clone() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();
    if (activeObject) {
      let clone;
      switch (activeObject.type) {
        case 'rect':
          clone = new fabric.Rect(activeObject.toObject());
          break;
        case 'circle':
          clone = new fabric.Circle(activeObject.toObject());
          break;
        case 'triangle':
          clone = new fabric.Triangle(activeObject.toObject());
          break;
        case 'i-text':
          clone = new fabric.IText('', activeObject.toObject());
          break;
        case 'image':
          clone = fabric.util.object.clone(activeObject);
          break;
      }
      if (clone) {
        clone.set({ left: 10, top: 10 });
        this.canvas.add(clone);
        this.selectItemAfterAdded(clone);
      }
    }
  }

  getId() {
    this.props.id = this.canvas.getActiveObject().toObject().id;
  }

  setId() {
    const val = this.props.id;
    const complete = this.canvas.getActiveObject().toObject();
    console.log(complete);
    this.canvas.getActiveObject().toObject = () => {
      complete.id = val;
      return complete;
    };
  }

  getOpacity() {
    this.props.opacity = this.getActiveStyle('opacity', null) * 100;
  }

  setOpacity() {
    this.setActiveStyle('opacity', parseInt(this.props.opacity, 10) / 100, null);
  }

  getFill() {
    this.props.fill = this.getActiveStyle('fill', null);
  }

  setFill() {
    this.setActiveStyle('fill', this.props.fill, null);
  }

  getLineHeight() {
    this.props.lineHeight = this.getActiveStyle('lineHeight', null);
  }

  setLineHeight() {
    this.setActiveStyle('lineHeight', parseFloat(this.props.lineHeight), null);
  }

  getCharSpacing() {
    this.props.charSpacing = this.getActiveStyle('charSpacing', null);
  }

  setCharSpacing() {
    this.setActiveStyle('charSpacing', this.props.charSpacing, null);
  }

  getFontSize() {
    this.props.fontSize = this.getActiveStyle('fontSize', null);
  }

  setFontSize() {
    this.setActiveStyle('fontSize', parseInt(this.props.fontSize, 10), null);
  }

  getBold() {
    this.props.fontWeight = this.getActiveStyle('fontWeight', null);
  }

  setBold() {
    this.props.fontWeight = !this.props.fontWeight;
    this.setActiveStyle('fontWeight', this.props.fontWeight ? 'bold' : '', null);
  }

  setFontStyle() {
    this.props.fontStyle = !this.props.fontStyle;
    if (this.props.fontStyle) {
      this.setActiveStyle('fontStyle', 'italic', null);
    } else {
      this.setActiveStyle('fontStyle', 'normal', null);
    }
  }

  getTextDecoration() {
    this.props.TextDecoration = this.getActiveStyle('textDecoration', null);
  }

  setTextDecoration(value) {
    let iclass = this.props.TextDecoration;
    if (iclass.includes(value)) {
      iclass = iclass.replace(RegExp(value, 'g'), '');
    } else {
      iclass += ` ${value}`;
    }
    this.props.TextDecoration = iclass;
    this.setActiveStyle('textDecoration', this.props.TextDecoration, null);
  }

  hasTextDecoration(value) {
    return this.props.TextDecoration.includes(value);
  }

  getTextAlign() {
    this.props.textAlign = this.getActiveProp('textAlign');
  }

  setTextAlign(value) {
    this.props.textAlign = value;
    this.setActiveProp('textAlign', this.props.textAlign);
  }

  getFontFamily() {
    this.props.fontFamily = this.getActiveProp('fontFamily');
  }

  setFontFamily() {
    console.log('this.props.fontFamily', this.props.fontFamily);
    this.setActiveProp('fontFamily', this.props.fontFamily);
  }

  /*System*/


  removeSelected() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      this.canvas.remove(activeObject);
      // this.textString = '';
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      const self = this;
      activeGroup.forEach((object) => {
        self.canvas.remove(object);
      });
    }
  }

  bringToFront() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      activeObject.bringToFront();
      activeObject.opacity = 1;
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      activeGroup.forEach((object) => {
        object.bringToFront();
      });
    }
  }

  sendToBack() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      this.canvas.sendToBack(activeObject);
      activeObject.sendToBack();
      activeObject.opacity = 1;
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      activeGroup.forEach((object) => {
        object.sendToBack();
      });
    }
  }

  confirmClear() {
    if (confirm('Are you sure?')) {
      this.canvas.clear();
      this.canvasSteps = [];
      this.canvasSteps.push(JSON.stringify(this.canvas.toJSON()));
    }
  }

  rasterize() {
    const image = new Image();
    image.src = this.canvas.toDataURL({ format: 'png' });
    console.log('image.src', image.src);
    const w = window.open('');
    w.document.write(image.outerHTML);
  }

  rasterizeSVG() {
    const w = window.open('');
    w.document.write(this.canvas.toSVG());
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(this.canvas.toSVG());
  }

  /************** */
  getCanvasSvg() {
    return this.canvas.toDataURL({ format: 'png' });
  }

  saveCanvasToJSON(data: any) {
    let key = this.guid + "-" + this.getUniqueId(1);
    data.json = JSON.stringify(this.canvas);
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem('lastsave', key);
    console.log(data);
  }

  loadCanvasFromJSON(key) {
    const CANVAS = localStorage.getItem(key);

    // and load everything from the same json
    this.canvas.loadFromJSON(CANVAS, () => {
      // making sure to render canvas at the end
      this.canvas.renderAll();

      // and checking if object's "name" is preserved
      console.log('this.canvas.item(0).name');
      console.log(this.canvas);
    });
  }

  loadCanvas(json) {
    // and load everything from the same json
    this.canvas.loadFromJSON(json, () => {
      // making sure to render canvas at the end
      this.canvas.renderAll();

      // and checking if object's "name" is preserved
      console.log('this.canvas.item(0).name');
      console.log(this.canvas);
    });
  }

  getUniqueId(parts: number): string {
    const stringArr = [];
    for(let i = 0; i< parts; i++){
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

  rasterizeJSON() {
    this.json = JSON.stringify(this.canvas, null, 2);
  }

  resetPanels() {
    this.textEditor = false;
    this.imageEditor = false;
    this.figureEditor = false;
  }

  modifyCanvas(event) {
    if (!this.isUndoRedo) {
      if (this.currentIndex === this.canvasSteps.length - 1) {
        this.canvasSteps.push(JSON.stringify(this.canvas.toJSON()));
        this.currentIndex = this.canvasSteps.length - 1;
      } else {
        for (let i = this.currentIndex + 1; i < this.canvasSteps.length; i++) {

        }
        this.canvasSteps.splice(this.currentIndex + 1, this.canvasSteps.length - (this.currentIndex));
        this.canvasSteps.push(JSON.stringify(this.canvas.toJSON()));
        this.currentIndex = this.canvasSteps.length - 1;
      }
    } else {
      setTimeout(() => {
        this.isUndoRedo = false;
      }, 200);
    }
  }

  redoCanvas() {
    if (this.currentIndex < this.canvasSteps.length) {
      this.currentIndex = this.currentIndex + 1;
      const CANVAS = this.canvasSteps[this.currentIndex];
      this.isUndoRedo = true;
      this.canvas.loadFromJSON(CANVAS, () => {
        // making sure to render canvas at the end
        this.canvas.renderAll();
      });
    }
  }

  undoCanvas() {
    if (this.currentIndex > 0) {
      this.currentIndex = this.currentIndex - 1;
      const CANVAS = this.canvasSteps[this.currentIndex];
      this.isUndoRedo = true;
      this.canvas.loadFromJSON(CANVAS, () => {
        // making sure to render canvas at the end
        this.canvas.renderAll();
      });
    } else {
      this.canvasSteps = [];
      this.canvasSteps.push(JSON.stringify(this.canvas.toJSON()));
      this.currentIndex = this.canvasSteps.length - 1;
    }
  }
}
