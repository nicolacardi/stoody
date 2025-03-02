//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDrawer }                            from '@angular/material/sidenav';

//components
import { GenitoriFilterComponent }              from '../genitori-filter/genitori-filter.component';
import { GenitoriListComponent }                from '../genitori-list/genitori-list.component';

//services
import { NavigationService }                    from '../../utilities/navigation/navigation.service';

//#endregion

@Component({
  selector: 'app-genitori-page',
  templateUrl: './genitori-page.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriPageComponent implements OnInit {

//#region ----- ViewChild Input Output -------
  @ViewChild(GenitoriListComponent) genitoriList!: GenitoriListComponent; 
  @ViewChild(GenitoriFilterComponent) genitoriFilterComponent!: GenitoriFilterComponent; 
  @ViewChild('filterSidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

  constructor(private _navigationService:  NavigationService) { }

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this._navigationService.passPage("genitoriList");
  }
//#endregion

//#region ----- Add Edit Drop -------
  addRecord() {
    this.genitoriList.addRecord()
  }
//#endregion

//#region ----- Reset vari -------

  resetFiltri() {
    this.genitoriFilterComponent.resetAllInputs();
  }
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }

  refreshChildCols(){
    this.genitoriList.loadLayout();
  }
//#endregion

}
