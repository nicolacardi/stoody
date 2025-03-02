//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDrawer }                            from '@angular/material/sidenav';

//components
import { AlunniFilterComponent }                from '../alunni-filter/alunni-filter.component';
import { AlunniListComponent }                  from '../alunni-list/alunni-list.component';

//services
import { NavigationService }                    from '../../utilities/navigation/navigation.service';

//#endregion

@Component({
  selector: 'app-alunni-page',
  templateUrl: './alunni-page.component.html',
  styleUrls: ['./../alunni.css'],
  standalone: false
})

export class AlunniPageComponent implements OnInit {

//#region ----- ViewChild Input Output ---------
  @ViewChild(AlunniListComponent) alunniList!: AlunniListComponent; 
  @ViewChild(AlunniFilterComponent) alunniFilterComponent!: AlunniFilterComponent; 
  @ViewChild('filterSidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion
  
  constructor( private _navigationService:  NavigationService) { 
    
  }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {
    this._navigationService.passPage("alunniPage");

  }
//#endregion
  
//#region ----- Add Edit Drop ------------------
  addRecord() {
    this.alunniList.addRecord()
  }
//#endregion
  
//#region ----- Reset vari ---------------------
  resetFiltri() { //questa era inserita come SECONDA CHIAMATA nell'html cioeè: (click)="filterSidenav.toggle(); resetFiltri();" POI TOLTA
    this.alunniFilterComponent.resetAllInputs();
  }
//#endregion

//#region ----- Altri metodi -------------------
  openDrawer() {
    this.drawerFiltriAvanzati.open();
  }

  refreshChildCols(){
    this.alunniList.loadLayout();
  }
//#endregion
}
