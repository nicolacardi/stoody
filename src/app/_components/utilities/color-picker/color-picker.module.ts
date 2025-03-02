import { NgModule }                             from '@angular/core';
import { CommonModule }                         from '@angular/common';

import { ColorPickerComponent }                 from './color-picker.component';
import { ColorSliderComponent }                 from './color-slider/color-slider.component'
import { ColorPaletteComponent }                from './color-palette/color-palette.component';

import { MaterialModule }                       from '../../../_material/material.module';

@NgModule({
  declarations: [
    ColorPickerComponent,
    ColorSliderComponent,
    ColorPaletteComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class ColorPickerModule { }
