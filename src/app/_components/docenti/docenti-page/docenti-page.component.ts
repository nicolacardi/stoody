//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
import { DocentiFilterComponent } from '../docenti-filter/docenti-filter.component';
import { DocentiListComponent } from '../docenti-list/docenti-list.component';

//#endregion

@Component({
  selector: 'app-docenti-page',
  templateUrl: './docenti-page.component.html',
  styleUrl: '../docenti.css'
})

export class DocentiPageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------
  @ViewChild(DocentiListComponent) docentiList!: DocentiListComponent; 
  @ViewChild(DocentiFilterComponent) docentiFilterComponent!: DocentiFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

constructor() { }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {
  }

//#region ----- Add Edit Drop ------------------
  addRecord() {
    this.docentiList.addRecord()
  }

//#endregion

//#region ----- Reset vari ---------------------
  resetFiltri() {
    this.docentiFilterComponent.nomeFilter.setValue('');
    this.docentiFilterComponent.cognomeFilter.setValue('');
  }
//#endregion

//#region ----- Altri metodi -------------------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
    //console.log ("apriDrawer");
  }

  refreshChildCols(){
    this.docentiList.loadLayout();
  }
//#endregion

}


 
