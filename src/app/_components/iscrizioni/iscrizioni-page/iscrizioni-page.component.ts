//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { IscrizioniListComponent }              from '../iscrizioni-list/iscrizioni-list.component';

//#endregion
@Component({
  selector: 'app-iscrizioni-page',
  templateUrl: './iscrizioni-page.component.html',
  styleUrls: ['./../iscrizioni.css']
})
export class IscrizioniPageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------
  @ViewChild(IscrizioniListComponent) iscrizioniList!: IscrizioniListComponent; 
//#endregion
  
  // @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
  constructor() { }

  ngOnInit(): void {
  }

  addRecord() {
      this.iscrizioniList.addRecord()
  }
  resetFiltri() {
  }


}
