//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
import { PersoneFilterComponent } from '../persone-filter/persone-filter.component';
import { PersoneListComponent } from '../persone-list/persone-list.component';

//#endregion
@Component({
  selector: 'app-persone-page',
  templateUrl: './persone-page.component.html',
  styleUrls: ['../persone.css']
})

export class PersonePageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------
  @ViewChild(PersoneListComponent) personeList!: PersoneListComponent; 
  @ViewChild(PersoneFilterComponent) personeFilterComponent!: PersoneFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

  constructor() { }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {
  }
//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord() {
    this.personeList.addRecord()
  }
//#endregion

//#region ----- Reset vari ---------------------
  resetFiltri() {
    this.personeFilterComponent.nomeFilter.setValue('');
    this.personeFilterComponent.cognomeFilter.setValue('');
    this.personeFilterComponent.indirizzoFilter.setValue('');
    this.personeFilterComponent.annoNascitaFilter.setValue('');
    this.personeFilterComponent.comuneFilter.setValue('');
    this.personeFilterComponent.provFilter.setValue('');
    this.personeFilterComponent.emailFilter.setValue('');
    this.personeFilterComponent.telefonoFilter.setValue('');
  }
//#endregion

//#region ----- Altri metodi -------------------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
    //console.log ("apriDrawer");
  }

  refreshChildCols(){
    this.personeList.loadLayout();
  }
//#endregion

}
