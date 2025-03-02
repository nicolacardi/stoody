//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { DialogDataColoreMateria }              from 'src/app/_models/DialogData';

//#endregion
@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {

  public ascHue!: string;
  public hue!: string;
  public ascColor!: string;
  public color!: string;

  constructor(
    public _dialogRef: MatDialogRef<ColorPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogDataColoreMateria,
  ) {
    _dialogRef.disableClose = true;
   }

   ngOnChanges() {

   }

  ngOnInit(): void {
    //così viene PASSATO alla color palette il colore letto: la color palette si setta sulla Hue giusta
    this.ascHue = this.data.ascRGB;
    this.ascColor = this.data.ascRGB;
    this.color = this.ascRGBToRGB(this.ascColor)!;

  }

  colorSliderEmitted(e: any) {
    this.hue = 'rgba(' + e[0] + ',' + e[1] + ',' + e[2] + ',1)'
    this.ascHue = "#"+e[0].toString(16).padStart(2, '0')+e[1].toString(16).padStart(2, '0')+e[2].toString(16).padStart(2, '0');
  }

  colorPaletteEmitted(e: any) {
    this.color = 'rgba(' + e[0] + ',' + e[1] + ',' + e[2] + ',1)'
    this.ascColor = "#"+e[0].toString(16).padStart(2, '0')+e[1].toString(16).padStart(2, '0')+e[2].toString(16).padStart(2, '0');
  }


  ascRGBToRGB(ascRGB: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(ascRGB);
    return result? 'rgba(' + parseInt(result[1], 16) + ',' +  parseInt(result[2], 16)+ ',' + parseInt(result[3], 16) + ',1)' : null;
  }



}
