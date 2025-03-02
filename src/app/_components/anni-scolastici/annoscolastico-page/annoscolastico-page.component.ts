
//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { AnniScolasticiListComponent }          from '../anniscolastici-list/anniscolastici-list.component';

//#endregion

@Component({
  selector: 'app-annoscolastico-page',
  templateUrl: './annoscolastico-page.component.html',
  styleUrls: ['../anniscolastici.css']
})
export class AnnoScolasticoPageComponent  {

//#region ----- ViewChild Input Output ---------

  @ViewChild(AnniScolasticiListComponent) anniList!: AnniScolasticiListComponent; 

  //#endregion
  
  constructor() { }

  addRecord() {
    this.anniList.addRecord()
  }

}

