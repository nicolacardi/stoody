//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

//components
import { ParametriFilterComponent } from '../parametri-filter/parametri-filter.component';
import { ParametriListComponent } from '../parametri-list/parametri-list.component';

//services
// import { NavigationService } from '../../utilities/navigation/navigation.service';

//#endregion

@Component({
  selector: 'app-parametri-page',
  templateUrl: './parametri-page.component.html',
  styleUrls: ['../parametri.css']
})

export class ParametriPageComponent implements OnInit {

//#region ----- ViewChild Input Output -------
  @ViewChild(ParametriListComponent) ParametriList!: ParametriListComponent; 
  @ViewChild(ParametriFilterComponent) ParametriFilterComponent!: ParametriFilterComponent; 
  @ViewChild('filterSidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

  constructor() { }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {

  }
//#endregion

//#region ----- Add Edit Drop -------
  // addRecord() {
  //   this.ParametriList.addRecord()
  // }
//#endregion

//#region ----- Reset vari -------

  // resetFiltri() {
  //   this.ParametriFilterComponent.resetAllInputs();
  // }
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }

  refreshChildCols(){
    this.ParametriList.loadLayout();
  }
//#endregion

}
