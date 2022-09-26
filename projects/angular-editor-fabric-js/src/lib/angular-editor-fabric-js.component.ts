import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fabric } from 'fabric';
import { CookieService } from 'ngx-cookie-service';
import { $$ } from 'protractor';

@Component({
  selector: 'angular-editor-fabric-js',
  templateUrl: './angular-editor-fabric-js.component.html',
  styleUrls: ['./angular-editor-fabric-js.component.css'],
})
export class FabricjsEditorComponent implements AfterViewInit {
  @ViewChild('htmlCanvas') htmlCanvas: ElementRef;
  @ViewChild('htmlTCanvas') htmlTCanvas: ElementRef;
  @ViewChild('htmlLCanvas') htmlLCanvas: ElementRef;

  public canvas: fabric.Canvas;
  public props = {
    canvasFill: '#ffffff',
    canvasImage: '',
    text: null,
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
    textEffect: null,
    strokeStyle: null,
    strokeWidth: null,
    type: null,
    diameter: null,
    kerning: null,
    flipped: null,
    cacheProperties: null,
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
  

  public topRuler = new fabric.Canvas('top-ruler');
  public leftRuler = new fabric.Canvas('left-ruler');

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
  public curveTextEditor = false;
  private imageEditor = false;
  public figureEditor = false;
  public selected: any;
  private guid: any;
  public defaltZoom = 1;
  public gridGroup;
  public mainCanWidth;
  public mainCanHeight;
  public mainCanvas;

  constructor(private cookieService: CookieService) {
    this.guid = this.cookieService.get('SIMON_GUID')
    
  }

  ngAfterViewInit(): void {
    //setup ruler canvas
    this.topRuler = new fabric.Canvas(this.htmlTCanvas.nativeElement, {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
      preserveObjectStacking: true
    });
    this.leftRuler = new fabric.Canvas(this.htmlLCanvas.nativeElement, {
      hoverCursor: 'pointer',
      selection: true,
      selectionBorderColor: 'blue',
      preserveObjectStacking: true
    });

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
      'selection:updated': (e) => {
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
            case 'i-text-cruve':
              this.curveTextEditor = true;
              this.getText();
              this.getDiameter();
              this.getFlipped();
              this.getKerning();
              this.getFill();
              this.getFontFamily();
              break;
            case 'image':
              break;
          }
        }
      },
      'selection:created': (e) => {
        this.resetPanels();
        
        const selectedObject = e.target;
        this.selected = selectedObject;
        selectedObject.hasRotatingPoint = true;
        selectedObject.transparentCorners = false;
        selectedObject.cornerColor = 'rgba(255, 87, 34, 0.7)';


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
            case 'i-text-cruve':
              this.curveTextEditor = true;
              this.getText();
              this.getDiameter();
              this.getFlipped();
              this.getKerning();
              this.getFill();
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
    this.redrawRulers();
  }

  redrawRulers() {
    this.topRuler.clear();
    this.leftRuler.clear();
    this.topRuler.backgroundColor ='#aaa';
    this.leftRuler.backgroundColor ='#aaa';



    this.topRuler.setWidth(this.mainCanWidth+3);
    this.topRuler.setHeight(50);

    this.leftRuler.setWidth(50);
    this.leftRuler.setHeight(this.mainCanHeight+3);
  
    var zoomLevel = this.canvas.getZoom();

    for (i = 0; i <= this.canvas.getWidth(); i += (19* zoomLevel)) {

      var topLine = new fabric.Line([i, 25, i, 50], {
        stroke: 'black',
        strokeWidth: 1
      });
      this.topRuler.add(topLine);
      var leftLine = new fabric.Line([25, i, 50, i], {
        stroke: 'black',
        strokeWidth: 1
      });
      this.leftRuler.add(leftLine);
    }
    
    // Numbers
    var inch = 0;
    for (var i = 0; i < this.topRuler.getWidth();  i += (95 * zoomLevel)) {
      var inchSt = `${inch}''`;
      var text = new fabric.Text( ( inchSt ).toString(), {
        left: i,
        top: 10,
        fontSize: 8
      });
      this.topRuler.add(text);
      inch += 0.5;
    }

    inch = 0;
    for (var i = 0; i < this.leftRuler.getHeight();  i += (95 * zoomLevel)) {
      var inchSt = `${inch}''`;
      var text = new fabric.Text( ( inchSt ).toString(), {
        top: i,
        left: 5,
        fontSize: 8
      });
      this.leftRuler.add(text);
      inch += 0.5;
    }
  }
  /*------------------------Block elements------------------------*/

  // Change all canvas elements color 

  setAllElementColor(color) {
    var objs = this.canvas.getObjects().map(function (o: any) {
      // console.log('canvas object: ', o);
      if (o._objects) {
        o._objects.map(function (o1: any) {
          if (o1.fill == '#FFFFFF' || o1.fill == '#ffffff' || o1.stroke == '#ffffff') {
            o1.set('stroke', '#FFFFFF');
            return o1.set('fill', '#FFFFFF');
          } else {
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

    this.mainCanWidth = this.size.width;
    this.mainCanHeight = this.size.height;
    this.redrawRulers();
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
    // const path = new fabric.Path("M70 0 C140 0, 140 100, 70 100 C0 100, 0 0, 70 0Z");
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
      this.canvas.centerObject(text);
      this.canvas.requestRenderAll();
      this.selectItemAfterAdded(text);
      // this.textString = '';

      // const texta = new fabric.Text(text,{fontSize: 10, patha});
      //const circle = new fabric.Circle();
      // const path = new fabric.Path(circle);
      //const path = new fabric.Path("M70 0 C140 0, 140 100, 70 100 C0 100, 0 0, 70 0Z");
      //console.log('patha ', path);
      // var texta = new fabric.IText('Text', { fontSize: 10, path: path, top: path.top, left: path.left });
      // this.canvas.add(texta);
    }
  }

  addCurveText(attr){
    this.removeSelected();
    if (this.textString) {
      const text = new fabric.TextCurved(this.textString, {
        diameter: 360,
        flipped: false,
        kerning: 1,
        fontSize: 32,
        fontFamily: 'helvetica',
        left: 50,
        top: 50,
        fill: attr.fill,
      });


      this.extend(text, this.randomId());
      this.canvas.add(text);
      this.selectItemAfterAdded(text);

       /**
       * The canvas test code start
       */
      
      /* var textDat= "Thequickbrownfoxjumpsoverthelazydog"
      var headingText = [];
      var startAngle = -58;
      var textLength = textDat.length;

      // var r = this.getTranslationDistance(text);
      var r = 300;
      var j=-1;
      var angleInterval = 116/textLength;
      for(var iterator=(-textLength/2), i=textLength-1; iterator<textLength/2;iterator++,i--) {
        
          var rotation = 90-(startAngle+(i)*angleInterval) ;
        
          headingText.push(new fabric.IText(textDat[i], {
              angle : j*((startAngle)+(i*angleInterval)),
              fontSize:28,
              left: (r)*Math.cos((Math.PI/180)*rotation),
              top: (r)*Math.sin((Math.PI/180)*rotation)
            
          }));
            
      }

      console.log(headingText);

      var group2 = new fabric.Group(headingText, { 
        left: 0,
        top: this.canvas.height/2, 
        strokeWidth: 1,
      });
      this.canvas.add(group2);
      console.log(group2)*/
    }
  }

  getTranslationDistance(text){
    const htmls = "<div id='tempdiv' style='display:table-cell;font-family:Arial; font-size:28px;'>"+text+"</div>";
    var boundingRectangle = document.getElementById('test_show').append(htmls);
    
    var translationDistance = document.getElementById('tempdiv').clientWidth;
    document.getElementById('test_show').remove();
    return translationDistance;
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
      var objs = objects.map(function (o: any) {

        if (o.group) {

          o.group._objects.map(function (o1: any) {

            if (o1.fill == '#FFFFFF' || o1.fill == '#ffffff' || o1.stroke == '#ffffff') {
              o1.set('stroke', '#FFFFFF');
              return o1.set('fill', '#FFFFFF');
            } else {
              return o1.set('fill', color);
            }
          });
        } else {

          return o.set('fill', color);
        }
      });

      // this.extend(image, this.randomId());
      this.canvas.add(image);
      this.selectItemAfterAdded(image);
    });
  }

  getImageSVGPolaroid(svgStr: string, color: string) {
    let ref = this;
    fabric.loadSVGFromString(svgStr, function (objects, options) {
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

      var objs = objects.map(function (o: any) {

        if (o.group) {

          o.group._objects.map(function (o1: any) {
            // console.log('objects', o1);
            if (o1.fill == '#FFFFFF' || o1.fill == '#ffffff' || o1.stroke == '#ffffff') {
              o1.set('stroke', '#FFFFFF');
              return o1.set('fill', '#FFFFFF');
            } else {
              return o1.set('fill', color);
            }
          });
        } else {

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
    this.canvas.centerObject(obj);
    // console.log(obj)
  }

  setCanvasFill(color) {
    if (!this.props.canvasImage) {
      // this.canvas.backgroundColor = this.props.canvasFill;
      this.canvas.backgroundColor = color;
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

    const viwePortCoords = this.canvas.vptCoords;
    switch (val) {
      case 'left':
        object.set({
          left: 0
        });
        break;
      case 'right':
        object.set({
          left: ( this.canvas.getWidth() / this.defaltZoom ) - ( object.width * object.scaleX  )
        });
        break;
      case 'top':
        object.set({
          top: 0
        });
        break;
      case 'bottom':
        object.set({
          top: (this.canvas.getHeight() / this.defaltZoom ) - (object.height * object.scaleY)
        });
        break;
      case 'center':
        object.set({
          left: (this.canvas.getWidth() / ( 2 * this.defaltZoom) ) - ((object.width * object.scaleX) / 2)
        });
        break;
      case 'hcenter':
        object.set({
          top: (this.canvas.getHeight() / ( 2 * this.defaltZoom) ) - ((object.height * object.scaleY) / 2)
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
    // console.log('setobject: ', object);
    if (!object) { return; }
    object.set(name, value).setCoords();
    fabric.util.clearFabricFontCache();
    setTimeout(() => {
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
        case 'i-text-curve':
          clone = new fabric.TextCurved('', activeObject.toObject());
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
    this.setActiveProp('fontFamily', this.props.fontFamily);
  }

  getText() {
    this.props.text =  this.getActiveProp('text');
  }

  setText(name,value) {
    // console.log('text value: ', value);
    // this.setActiveProp('text', value);
    const object = this.canvas.getActiveObject();
    if (!object) { return; }
    object.set(name, value).setCoords();
    // console.log('setobject: ', object);
    this.setActiveProp('flipped', this.props.flipped);
    // this.canvas.renderAll();
  }

  /**Curve text element function */
  getDiameter() {
    this.props.diameter = this.getActiveProp('diameter');
  }

  setDiameter() {
    this.setActiveProp('diameter', this.props.diameter);
  }

  getKerning() {
    this.props.kerning = this.getActiveProp('kerning');
  }

  setKerning() {
    this.setActiveProp('kerning', this.props.kerning);
  }

  getFlipped() {
    this.props.flipped = this.getActiveProp('flipped');
  }

  setFlipped() {
    this.setActiveProp('flipped', this.props.flipped);
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

  }

  loadCanvasFromJSON(key) {
    const CANVAS = localStorage.getItem(key);

    // and load everything from the same json
    this.canvas.loadFromJSON(CANVAS, () => {
      // making sure to render canvas at the end
      this.canvas.renderAll();
    });
  }

  loadCanvas(json) {
    // and load everything from the same json
    this.canvas.loadFromJSON(json, () => {
      // making sure to render canvas at the end
      this.canvas.renderAll();

      // and checking if object's "name" is preserved
    });
  }

  getUniqueId(parts: number): string {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
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
    this.curveTextEditor = false;
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

  zoomCanvas(zoom_value) {
    var zoom = 1;
    this.defaltZoom = zoom_value;
    zoom *= 1 * zoom_value;

    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;

    const trns = [1,0,0,3,0,0];

    this.canvas.setViewportTransform(trns);
    this.canvas.viewportTransform[0] = 1;
    this.canvas.viewportTransform[3] = 1;

    // this.canvas.zoomToPoint(new fabric.Point(this.canvas.width / zoom, this.canvas.height / zoom), zoom);
    // for (var i = 0, len = this.canvas._objects.length; i < len; i++) {
    //   console.log('coords: ', this.canvas._objects[0].getCoords());
    //   this.canvas._objects[i].setCoords();
    // }

    this.canvas.forEachObject(function(object){
      object.setCoords();
    })

    this.canvas.setZoom(zoom);
    this.canvas.renderAll();

  }

  zoomRuller(zoomLevel,zoomLevelCan){
    if(zoomLevelCan < 1){
      this.mainCanWidth = this.size.width / zoomLevelCan;
      this.mainCanHeight = this.size.height / zoomLevelCan;
    }else if(zoomLevelCan == 1){

      this.mainCanWidth = this.size.width;
      this.mainCanHeight =this.size.height;

    }else{

      this.mainCanWidth = this.size.width * Math.abs(zoomLevelCan);
      this.mainCanHeight = this.size.height * Math.abs(zoomLevelCan);
    }

    this.mainCanWidth = this.size.width * zoomLevelCan;
    this.mainCanHeight = this.size.height * zoomLevelCan;

    this.redrawRulers();  

  }

  zoomsetDimensions(widthHeight) {
    this.canvas.setDimensions(widthHeight);
  }

  setViewportTransform(vpt: number[]) {
    this.canvas.setViewportTransform(vpt);
  }

  removeGrid() {
    
    this.gridGroup && this.canvas.remove(this.gridGroup);
    this.gridGroup = null;
  }

  addGrid(grid_size = 25) {
    if (this.gridGroup) return;
    let options = {
        distance: 19,
        width: this.canvas.getWidth(),
        height: this.canvas.getWidth(),
        param: {
          stroke: '#ebebeb',
          strokeWidth: 1,
          selectable: false
        }
    },
    gridLen = options.width / options.distance;

    var gridLines = [];
    for (var i = 0; i < gridLen; i++) {
      var distance   = i * options.distance,
          
      horizontal = new fabric.Line([ distance, 0, distance, options.width], options.param),
      vertical   = new fabric.Line([ 0, distance, options.width, distance], options.param);
      
      // this.canvas.add(horizontal);
      // this.canvas.add(vertical);

      if(i%5 === 0){
        horizontal.set({stroke: '#cccccc'});
        vertical.set({stroke: '#cccccc'});
      }
      gridLines.push(horizontal);
      gridLines.push(vertical);
    }
    this.gridGroup = new fabric.Group(gridLines, {
      selectable: false,
      evented: false
    });
    this.canvas.add(this.gridGroup);
  }

}
(function(fabric) {

  /*
   * TextCurved object for fabric.js
   * @author Arjan Haverkamp (av01d)
   * @date January 2018
   */
  
  fabric.TextCurved = fabric.util.createClass(fabric.Object, {
    type: 'i-text-cruve',
    diameter: 250,
    kerning: 1,
    text: '',
    angle: -180,
    startAngle: 0,
    flipped: false,
    fill: '#000',
    fontFamily: 'Times New Roman',
    fontSize: 24, // in px
    fontWeight: 'normal',
    fontStyle: '', // "normal", "italic" or "oblique".
    cacheProperties: fabric.Object.prototype.cacheProperties.concat('diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'strokeStyle', 'strokeWidth'),
    strokeStyle: null,
    strokeWidth: 0,
  
    initialize: function(text, options) {
      options || (options = {});
      this.text = text;
  
      this.callSuper('initialize', options);
      this.set('lockUniScaling', true);
  
      // Draw curved text here initially too, while we need to know the width and height.
      var canvas = this.getCircularText();
      this._trimCanvas(canvas);
      this.set('width', canvas.width);
      this.set('height', canvas.height);
    },
  
    _getFontDeclaration: function()
    {
      return [
        // node-canvas needs "weight style", while browsers need "style weight"
        (fabric.isLikelyNode ? this.fontWeight : this.fontStyle),
        (fabric.isLikelyNode ? this.fontStyle : this.fontWeight),
        this.fontSize + 'px',
        (fabric.isLikelyNode ? ('"' + this.fontFamily + '"') : this.fontFamily)
      ].join(' ');
    },
  
    _trimCanvas: function(canvas)
    {
      var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        pix = {x:[], y:[]}, n,
        imageData = ctx.getImageData(0,0,w,h),
        fn = function(a,b) { return a-b };
  
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          if (imageData.data[((y * w + x) * 4)+3] > 0) {
            pix.x.push(x);
            pix.y.push(y);
          }
        }
      }
      pix.x.sort(fn);
      pix.y.sort(fn);
      n = pix.x.length-1;
  
      w = pix.x[n] - pix.x[0];
      h = pix.y[n] - pix.y[0];
      var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);
  
      canvas.width = w;
      canvas.height = h;
      ctx.putImageData(cut, 0, 0);
    },
  
    // Source: http://jsfiddle.net/rbdszxjv/
    getCircularText: function()
    {
      var text = this.text,
        diameter = this.diameter,
        flipped = this.flipped,
        kerning = this.kerning,
        fill = this.fill,
        inwardFacing = true,
        startAngle = 0,
        canvas = fabric.util.createCanvasElement(),
        ctx = canvas.getContext('2d'),
        cw, // character-width
        x, // iterator
        clockwise = -1; // draw clockwise for aligned right. Else Anticlockwise
  
      if (flipped) {
        startAngle = 180;
        inwardFacing = false;
      }
  
      startAngle *= Math.PI / 180; // convert to radians
  
      // Calc heigt of text in selected font:
      var d = document.createElement('div');
      d.style.fontFamily = this.fontFamily;
      d.style.whiteSpace = 'nowrap';
      d.style.fontSize = this.fontSize + 'px';
      d.style.fontWeight = this.fontWeight;
      d.style.fontStyle = this.fontStyle;
      d.textContent = text;
      document.body.appendChild(d);
      var textHeight = d.offsetHeight;
      document.body.removeChild(d);
  
      canvas.width = canvas.height = diameter;
      ctx.font = this._getFontDeclaration();
  
      // Reverse letters for center inward.
      if (inwardFacing) { 
        text = text.split('').reverse().join('') 
      };
  
      // Setup letters and positioning
      ctx.translate(diameter / 2, diameter / 2); // Move to center
      startAngle += (Math.PI); // Rotate 180 if outward
      ctx.textBaseline = 'middle'; // Ensure we draw in exact center
      ctx.textAlign = 'center'; // Ensure we draw in exact center
  
      // rotate 50% of total angle for center alignment
      for (x = 0; x < text.length; x++) {
        cw = ctx.measureText(text[x]).width;
        // console.log(text[x],cw);
        startAngle += ((cw + (x == text.length-1 ? 0 : kerning)) / (diameter / 2 - textHeight)) / 2 * -clockwise;
      }
  
      // Phew... now rotate into final start position
      ctx.rotate(startAngle);
  
      // Now for the fun bit: draw, rotate, and repeat
      for (x = 0; x < text.length; x++) {
        cw = ctx.measureText(text[x]).width; // half letter
        // rotate half letter
        ctx.rotate((cw/2) / (diameter / 2 - textHeight) * clockwise);
        // draw the character at "top" or "bottom"
        // depending on inward or outward facing
  
        // Stroke
        if (this.strokeStyle && this.strokeWidth) {
          ctx.strokeStyle = this.strokeStyle;
          ctx.lineWidth = this.strokeWidth;
          ctx.miterLimit = 2;
          ctx.strokeText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
        }
  
        // Actual text
        ctx.fillStyle = fill;
        ctx.fillText(text[x], 0, (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2));
  
        ctx.rotate((cw/2 + kerning) / (diameter / 2 - textHeight) * clockwise); // rotate half letter
      }
      return canvas;
    },
  
    _set: function(key, value) {
      switch(key) {
        case 'scaleX':
          this.fontSize *= value;
          this.diameter *= value;
          this.width *= value;
          this.scaleX = 1;
          if (this.width < 1) { this.width = 1; }
          break;
  
        case 'scaleY':
          this.height *= value;
          this.scaleY = 1;
          if (this.height < 1) { this.height = 1; }
          break;
  
        default:
          this.callSuper('_set', key, value);
          break;
      }
    },
  
    _render: function(ctx)
    {
      var canvas = this.getCircularText();
      // console.log(canvas);
      this._trimCanvas(canvas);
  
      this.set('width', canvas.width);
      this.set('height', canvas.height);
  
      ctx.drawImage(canvas, -this.width / 2, -this.height / 2, this.width, this.height);
  
      this.setCoords();
    },
  
    toObject: function(propertiesToInclude) {
      return this.callSuper('toObject', ['text', 'diameter', 'kerning', 'flipped', 'fill', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'strokeStyle', 'strokeWidth', 'styles'].concat(propertiesToInclude));
    }
  });
  
  fabric.TextCurved.fromObject = function(object, callback, forceAsync) {
     return fabric.Object._fromObject('TextCurved', object, callback, forceAsync, 'i-text-cruve');
  };
  
  })(typeof fabric !== 'undefined' ? fabric : require('fabric').fabric);