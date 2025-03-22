//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
import { SociFilterComponent } from '../soci-filter/soci-filter.component';
import { SociListComponent } from '../soci-list/soci-list.component';

//#endregion

@Component({
  selector: 'app-soci-page',
  templateUrl: './soci-page.component.html',
  styleUrls: ['../soci.css']
})

export class SociPageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------
  @ViewChild(SociListComponent) sociList!: SociListComponent; 
  @ViewChild(SociFilterComponent) sociFilterComponent!: SociFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

  constructor() { }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {
  }

//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord() {
    this.sociList.addRecord()
  }
  
//#endregion

//#region ----- Reset vari ---------------------
  resetFiltri() {
    this.sociFilterComponent.nomeFilter.setValue('');
    this.sociFilterComponent.cognomeFilter.setValue('');
  }
//#endregion

//#region ----- Altri metodi -------------------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
    //console.log ("apriDrawer");
  }

  refreshChildCols(){
    this.sociList.loadLayout();
  }
//#endregion

}

