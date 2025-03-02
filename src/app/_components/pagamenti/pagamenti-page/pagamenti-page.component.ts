//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { NavigationService } from '../../utilities/navigation/navigation.service';

//components
import { PagamentiFilterComponent } from '../pagamenti-filter/pagamenti-filter.component';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';

//#endregion
@Component({
  selector: 'app-pagamenti-page',
  templateUrl: './pagamenti-page.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiPageComponent implements OnInit {

//#region ----- ViewChild Input Output -------
  @ViewChild(PagamentiListComponent) pagamentiList!: PagamentiListComponent; 
  @ViewChild(PagamentiFilterComponent) pagamentiFilterComponent!: PagamentiFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

  constructor(private _navigationService:  NavigationService) { }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {
    this._navigationService.passPage("pagamentiPage");
  }
//#endregion

//#region ----- Add Edit Drop ------------------

  addRecord() {
    this.pagamentiList.addRecord()
  }
//#endregion

//#region ----- Reset vari ---------------------

  resetFiltri() {

    //QUI!!!
    //AS: problema: il tipoPAgamento è un oggetto
    // this.pagamentiFilterComponent.tipoPagamentoFilter.setValue('');
    // this.pagamentiFilterComponent.causaleFilter.setValue('');
  }
//#endregion

//#region ----- Altri metodi -------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
    //console.log ("apriDrawer");
  }

  
  refreshChildCols(){
    this.pagamentiList.loadLayout();
  }
//#endregion

}
