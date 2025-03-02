//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

//services
import { AnniScolasticiService } from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { RetteService } from '../rette.service';

//models
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_RettePagamenti_Sum } from 'src/app/_models/PAG_Retta';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

//#endregion
@Component({
  selector: 'app-rettepagamenti-summary',
  templateUrl: './rettepagamenti-summary.component.html',
  styleUrls: ['../pagamenti.css'],
  standalone: false
})

export class RettepagamentiSummaryComponent implements OnInit {

//#region ----- Variabili ----------------------

  matDataSource = new MatTableDataSource<PAG_RettePagamenti_Sum>();

  obsAnni$!:                          Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

  form! :                             UntypedFormGroup;
  menuTopLeftPosition =  {x: '0', y: '0'} 
  displayedColumns: string[] =  [];
  displayedColumnsRettePagamentiSummary: string[] = [
      "annoRetta",
      "meseRetta",
      "quotaDefault",
      "quotaConcordata",
      "importo",
  ];
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 
//#endregion

//#region ----- Constructor --------------------

  constructor(private fb:               UntypedFormBuilder,
              private svcRette:         RetteService,
              private svcAnni:          AnniScolasticiService,
              private _loadingService:  LoadingService) { 
  
    let obj = localStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    })
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------
  ngOnInit(): void {
    this.obsAnni$= this.svcAnni.list();
    this.loadData();

    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(val =>  this.loadData() );
  }

  loadData() {

    this.displayedColumns = this.displayedColumnsRettePagamentiSummary;
    
    let obsSummary$: Observable<PAG_RettePagamenti_Sum[]>;
    obsSummary$= this.svcRette.listRettePagamenti_Sum(this.form.controls['selectAnnoScolastico'].value);
    const loadSummary$ =this._loadingService.showLoaderUntilCompleted(obsSummary$);

    loadSummary$.subscribe(val => this.matDataSource.data = val);
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------
  onRightClick(event: MouseEvent, element: PAG_RettePagamenti_Sum) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion

//#region ----- Altri Metodi -------------------
getTotalPagate() {
  return this.matDataSource.data.map(t => t.importo).reduce((acc, value) => acc + value, 0)
}
getTotalConcordate() {
  return this.matDataSource.data.map(t => t.quotaConcordata).reduce((acc, value) => acc + value, 0)
}
getTotalDefault() {
  return this.matDataSource.data.map(t => t.quotaDefault).reduce((acc, value) => acc + value, 0)
}
//#endregion

}
