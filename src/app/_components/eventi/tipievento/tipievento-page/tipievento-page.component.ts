//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { TipiEventoListComponent } from '../tipievento-list/tipievento-list.component';
//#endregion
@Component({
  selector: 'app-tipievento-page',
  templateUrl: './tipievento-page.component.html',
  styleUrls: ['../../eventi.css']
})
export class TipiEventoPageComponent implements OnInit {


  @ViewChild(TipiEventoListComponent) tipieventoList!: TipiEventoListComponent; 

  
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.tipieventoList.addRecord()
  }

}
