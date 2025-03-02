import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { Utility } from '../utility.component';

export interface DialogData {
  file: any;
}


@Component({
  selector: 'app-photocrop',
  templateUrl: './photocrop.component.html',
  styleUrls: ['./photocrop.component.css']
})
export class PhotocropComponent implements OnInit {
  imgFile!:         string;
  w!:               number;
  orW!:             number; //larghezza immagine originale
  orH!:             number; //altezza   immagine originale
  dragPosition = {x: 50, y: 50};
  @ViewChild('myImg', {static: false}) immagineDOM!: ElementRef;
  @ViewChild('myCanvas', {static: false}) canvasDOM!: ElementRef;


  
  constructor( public dialogRef: MatDialogRef<PhotocropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {


}

  ngOnInit(): void {

    // console.log (this.data.file);
    const [file] = this.data.file;
    this.w = 100;
    const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgFile = reader.result as string;

        //vado a leggere le dimensioni dell'immagine d'origine
        const img = new Image();
        img.src = this.imgFile;
        img.onload = () => {
          this.orW = img.width;
          this.orH = img.height;

          const ratio = this.orH/this.orW;
          if (ratio>1) {
            this.w = 200/ratio;
          } else {
            this.w = 200;
          }
        }
        

        //this.immagineDOM.nativeElement.src = this.imgFile;
      };
  }


  onSliderChange(event: MatSliderChange) {
    const ratio = this.orH/this.orW;
    if ( ratio > 1) {
      this.w = 200/ratio * (event.value!) /100;
    } else {
      this.w = 200 * (event.value!) / 100
    }

  }





  dragEnded(event: any) {
    let element = event.source.getRootElement();
    let boundingClientRect = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);
  }
  
  getPosition(el: any) {
    let x = 0;
    let y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }



}


