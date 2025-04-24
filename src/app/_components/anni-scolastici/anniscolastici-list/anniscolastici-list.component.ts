//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { MatSort }                              from '@angular/material/sort';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { AnnoscolasticoEditComponent }          from '../annoscolastico-edit/annoscolastico-edit.component';


//services
import { AnniScolasticiService }                from '../anni-scolastici.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { ParametriService } from '../../impostazioni/parametri/parametri.service';
import { _UT_Parametro } from 'src/app/_models/_UT_Parametro';

//#endregion
@Component({
  selector: 'app-anniscolastici-list',
  templateUrl: './anniscolastici-list.component.html',
  styleUrls: ['../anniscolastici.css']
})
export class AnniScolasticiListComponent implements OnInit {

//#region ----- Variabili ----------------------

//maxSeq!:                                      number;
matDataSource = new MatTableDataSource<ASC_AnnoScolastico>();
annoCorrenteID!:                                number;
obsAnni$!:                                      Observable<ASC_AnnoScolastico[]>;

displayedColumns: string[] = [

    "actionsColumn", 

    "annoscolastico",
    "anno1",
    "anno2",
    "ckChiuso",
    "dtInizio",
    "dtFineQ1",
    "dtFine"
];

filterValue = '';

filterValues = {
  descrizione: '',
  filtrosx: ''
}
//#endregion

//#region ----- ViewChild Input Output ---------
@ViewChild(MatSort) sort!:                    MatSort;
//#endregion

//#region ----- Constructor --------------------

constructor(private svcAnni:                        AnniScolasticiService,
            private _loadingService:                LoadingService,
            public _dialog:                         MatDialog) { 


}
//#endregion

  //#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    let objAnno = sessionStorage.getItem('AnnoCorrente');
    this.annoCorrenteID = + (JSON.parse(objAnno!) as _UT_Parametro).parValue

    this.obsAnni$ = this.svcAnni.list();  
    const loadAnni$ =this._loadingService.showLoaderUntilCompleted(this.obsAnni$);

    loadAnni$.subscribe(
      val =>   {
        console.log("anniscolastici-list - loadData - val", val);
        this.matDataSource.data = val;
        //this.sortCustom(); 
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente

        // this.maxSeq = val.reduce((max, item) => {
        //   return item.seq! > max ? item.seq! : max;
        // }, 0);
      }
    );
  }
  //#endregion

  //#region ----- Add Edit Drop ------------------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '420px',
      height: '600px',
      data: {
        id:                              0
        //maSeq:                                 this.maxSeq
      }
  };

  const dialogRef = this._dialog.open(AnnoscolasticoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  openDetail(annoID:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '420px',
      height: '600px',
      data: {
      annoID:                              annoID,
      //maxSeq:                                 this.maxSeq
    }
  };
  const dialogRef = this._dialog.open(AnnoscolasticoEditComponent, dialogConfig);
  dialogRef.afterClosed().subscribe(() => this.loadData());
}

//#endregion

//#region ----- Filtri & Sort ------------------

  // sortCustom() {
  //   this.matDataSource.sortingDataAccessor = (item:any, property) => {
  //   switch(property) {
  //     case 'descrizione':                 return item.descrizione;
  //     case 'macroMateria':                return item.macroMateria.descrizione;
  //     default: return item[property]
  //     }
  //   };
  // }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      let boolSx = String(data.anno1).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
          || String(data.anno2).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
          || String(data.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
      return boolSx;
    }
    return filterFunction;
  }

  // drop(event: any){
  //   this.svcAnni.updateSeq(event.previousIndex+1, event.currentIndex+1 )
  //   .subscribe(res=> this.loadData());
  // }
//#endregion


}
