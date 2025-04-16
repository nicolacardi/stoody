//#region ----- IMPORTS ------------------------
import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  EventEmitter,
  HostListener,
}                                               from '@angular/core'
//#endregion
@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.css'],
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {
  @Input()
  ascHue!: string

  hue!: string;
  // @Output()
  // color: EventEmitter<string> = new EventEmitter(true)

  @Output()
  color: EventEmitter<number[]> = new EventEmitter(true)


  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>

  private ctx!: CanvasRenderingContext2D

  private mousedown: boolean = false

  public selectedPosition!: { x: number; y: number }

  ngAfterViewInit() {
    if (this.canvas) {
      this.draw()
    }
  }


  draw() {
    


      // Se canvas non è ancora disponibile, esci
  if (!this.canvas?.nativeElement) {
    return;
  }

  if (!this.ctx) {
    this.ctx = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true })!;
    if (!this.ctx) {
      return;
    }
  }


    //console.log ("colorpalette 0")
    const width = this.canvas.nativeElement.width
    //console.log ("colorpalette 1")
    const height = this.canvas.nativeElement.height
    
    this.ctx.fillStyle = this.hue || 'rgba(255,255,255,1)'
    this.ctx.fillRect(0, 0, width, height)

    const whiteGrad = this.ctx.createLinearGradient(0, 0, width, 0)
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)')
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)')

    this.ctx.fillStyle = whiteGrad
    this.ctx.fillRect(0, 0, width, height)

    const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height)
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)')
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)')

    this.ctx.fillStyle = blackGrad
    this.ctx.fillRect(0, 0, width, height)



    if (this.selectedPosition) {
      this.ctx.strokeStyle = 'white'
      this.ctx.fillStyle = 'white'
      this.ctx.beginPath()
      this.ctx.arc(
        this.selectedPosition.x,
        this.selectedPosition.y,
        10,
        0,
        2 * Math.PI
      )
      this.ctx.lineWidth = 2
      this.ctx.stroke()
    } else {

      // console.log ("color-palette: draw: ricevo S da ascRGBToHSB(this.ascHue)[1]", this.ascRGBToHSB(this.ascHue)[1])
      const S = this.ascRGBToHSB(this.ascHue)[1];
      // console.log ("color-palette: draw: ricevo B da ascRGBToHSB(this.ascHue)[2]", this.ascRGBToHSB(this.ascHue)[2])

      const B = this.ascRGBToHSB(this.ascHue)[2];

      this.ctx.strokeStyle = 'white'
      this.ctx.fillStyle = 'white'
      this.ctx.beginPath()
      this.ctx.arc(
        (width * S/100),
        (height - height * B /100),
        10,
        0,
        2 * Math.PI
      )
      this.ctx.lineWidth = 2
      this.ctx.stroke()
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ascHue']) {  //QUI SI INCRICCA
      this.hue = this.ascRGBToRGB(this.ascHue)!;

      this.draw()
      const pos = this.selectedPosition

      if (pos) {
        this.color.emit(this.getColorAtPosition(pos.x, pos.y))
      }
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(evt: MouseEvent) {
    this.mousedown = false
  }

  onMouseDown(evt: MouseEvent) {
    this.mousedown = true
    this.selectedPosition = { x: evt.offsetX, y: evt.offsetY }
    this.draw()
    this.color.emit(this.getColorAtPosition(evt.offsetX, evt.offsetY))
  }

  onMouseMove(evt: MouseEvent) {
    if (this.mousedown) {
      this.selectedPosition = { x: evt.offsetX, y: evt.offsetY }
      this.draw()
      this.emitColor(evt.offsetX, evt.offsetY)
    }
  }

  emitColor(x: number, y: number) {
    const rgbaColor = this.getColorAtPosition(x, y)
    this.color.emit(rgbaColor)
  }

  getColorAtPosition(x: number, y: number) {
    const imageData = this.ctx.getImageData(x, y, 1, 1).data
    // return (
    //   'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)'
    // )
    let arrColor = [0,0,0];
    arrColor[0] = imageData[0];
    arrColor[1] = imageData[1];
    arrColor[2] = imageData[2];
    return arrColor;

  }



  ascRGBToHSB(ascRGB: string) {
  
    //console.log ("color-palette: ascRGBtoHSB: ascRGB arrivato", ascRGB); 
    const hexR = ascRGB.substring(1, 3);
    const hexG = ascRGB.substring(3, 5);
    const hexB = ascRGB.substring(5, 7);

    //console.log ("color-palette: ascRGBtoHSB: hexRGB generato", hexR, hexG, hexB);

    let decR = parseInt(hexR, 16);
    let decG = parseInt(hexG, 16);
    let decB = parseInt(hexB, 16);

    //console.log ("color-palette: ascRGBtoHSB: RGB generato", decR, decG, decB);
    decR /= 255;
    decG /= 255;
    decB /= 255;
    const v = Math.max(decR, decG, decB),
      n = v - Math.min(decR, decG, decB);
    const h =
      n === 0 ? 0 : n && v === decR ? (decG - decB) / n : v === decG ? 2 + (decB - decR) / n : 4 + (decR - decG) / n;
    //console.log ("color-palette: ascRGBtoHSB: HSB restituito", [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100]);
    return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];

  }

  ascRGBToRGB(ascRGB: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(ascRGB);
    return result? 'rgba(' + parseInt(result[1], 16) + ',' +  parseInt(result[2], 16)+ ',' + parseInt(result[3], 16) + ',1)' : null;
  }

}