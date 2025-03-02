//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MaterieListComponent }                 from '../materie-list/materie-list.component';

//#endregion
@Component({
  selector: 'app-materie-page',
  templateUrl: './materie-page.component.html',
  styleUrls: ['../materie.css']
})
export class MateriePageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------

  @ViewChild(MaterieListComponent) materieList!: MaterieListComponent; 

  //#endregion
  
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
    this.materieList.addRecord()
  }

}
