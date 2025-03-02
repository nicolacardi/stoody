//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { TipiScadenzaListComponent } from '../tipiscadenza-list/tipiscadenza-list.component';
//#endregion
@Component({
  selector: 'app-tipiscadenza-page',
  templateUrl: './tipiscadenza-page.component.html',
  styleUrls: ['../../scadenze.css']
})
export class TipiScadenzaPageComponent implements OnInit {


  @ViewChild(TipiScadenzaListComponent) tipiscadenzaList!: TipiScadenzaListComponent; 

  
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.tipiscadenzaList.addRecord()
  }

}
