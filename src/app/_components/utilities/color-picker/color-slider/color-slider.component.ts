import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-color-slider',
  templateUrl: './color-slider.component.html',
  styleUrls: ['./color-slider.component.css']
})
export class ColorSliderComponent implements OnInit {

  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;

  // @Output()
  // color: EventEmitter<string> = new EventEmitter()

  @Output()
  color: EventEmitter<number[]> = new EventEmitter()



  
  
  private ctx!: CanvasRenderingContext2D;
  private mousedown: boolean = false;
  private selectedHeight!: number;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.draw();
  }

draw() {
  // console.log ("colorslider draw before this.ctx")

  if (!this.ctx) {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
  }
  const width = this.canvas.nativeElement.width;
  const height = this.canvas.nativeElement.height;
  this.ctx.clearRect(0, 0, width, height);
  const gradient = this.ctx.createLinearGradient(0, 0, 0, height);

  gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
  gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
  gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
  gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
  gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
  gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

  this.ctx.beginPath();
  this.ctx.rect(0, 0, width, height);
  this.ctx.fillStyle = gradient;
  this.ctx.fill();
  this.ctx.closePath();

}

@HostListener('window:mouseup', ['$event'])
onMouseUp(evt: MouseEvent) {
  this.mousedown = false;
}

onMouseDown(evt: MouseEvent) {
  this.mousedown = true;
  this.selectedHeight = evt.offsetY;
  this.draw();
  this.emitColor(evt.offsetX, evt.offsetY);
}

onMouseMove(evt: MouseEvent) {
  if (this.mousedown) {
    this.selectedHeight = evt.offsetY;
    this.draw();
    this.emitColor(evt.offsetX, evt.offsetY);
  }
}

emitColor(x: number, y: number) {
  //const rgbaColor = this.getColorAtPosition(x, y);
  //this.color.emit(rgbaColor);
  //const ascColor = this.getColorAtPosition(x, y);
  //this.color.emit(ascColor);
  const arrColor = this.getColorAtPosition(x, y);
  this.color.emit(arrColor);

}

getColorAtPosition(x: number, y: number) {
  const imageData = this.ctx.getImageData(x, y, 1, 1).data;
  //return 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
  //return '#'+imageData[0].toString(16)+imageData[1].toString(16)+imageData[2].toString(16);

  let arrColor = [0,0,0];
  arrColor[0] = imageData[0];
  arrColor[1] = imageData[1];
  arrColor[2] = imageData[2];
  return arrColor;
}

}
