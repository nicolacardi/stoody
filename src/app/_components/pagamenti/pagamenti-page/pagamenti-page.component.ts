//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { NavigationService } from '../../utilities/navigation/navigation.service';

//components
import { PagamentiFilterComponent } from '../pagamenti-filter/pagamenti-filter.component';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';
import { ActivatedRoute } from '@angular/router';

//#endregion
@Component({
  selector: 'app-pagamenti-page',
  templateUrl: './pagamenti-page.component.html',
  styleUrls: ['../pagamenti.css']
})
export class PagamentiPageComponent implements OnInit {

  nomeRouted!        : string;
  cognomeRouted!     : string;
  annoIDRouted!      : number;
//#region ----- ViewChild Input Output -------
  @ViewChild(PagamentiListComponent) pagamentiList!: PagamentiListComponent; 
  @ViewChild(PagamentiFilterComponent) pagamentiFilterComponent!: PagamentiFilterComponent; 
  @ViewChild('sidenav', { static: true }) drawerFiltriAvanzati!: MatDrawer;
//#endregion

  constructor(
    private _navigationService      : NavigationService,
    private route                   : ActivatedRoute,
  ) { }

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {
    this._navigationService.passPage("pagamentiPage");



    this.route.queryParams.subscribe(params => {
      this.nomeRouted = params['nomeRouted'];
      this.cognomeRouted = params['cognomeRouted'];
      this.annoIDRouted = +params['annoIDRouted'];

      console.log ("pagamenti-page arrivati parametri", this.nomeRouted, this.cognomeRouted, this.annoIDRouted);
    });
  }

  get isFormDirty(): boolean {
    return this.pagamentiFilterComponent ? !this.pagamentiFilterComponent.formClean : false;
  }

  ngAfterViewInit(): void {

    if (this.nomeRouted && this.cognomeRouted && this.annoIDRouted) {
      this.pagamentiFilterComponent.nomeFilter.setValue(this.nomeRouted);
      this.pagamentiFilterComponent.cognomeFilter.setValue(this.cognomeRouted);
      this.pagamentiList.form.controls['selectAnnoScolastico'].setValue(this.annoIDRouted);
      
    }
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
