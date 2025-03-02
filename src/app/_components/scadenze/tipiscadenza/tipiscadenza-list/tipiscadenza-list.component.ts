//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { MatSort }                              from '@angular/material/sort';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { TipoScadenzaEditComponent }            from '../tiposcadenza-edit/tiposcadenza-edit.component';

//services
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { TipiScadenzaService }                  from '../../tipiscadenza.service';

//models
import { CAL_TipoScadenza }                     from 'src/app/_models/CAL_TipoScadenza';

//#endregion
@Component({
  selector: 'app-tipiscadenza-list',
  templateUrl: './tipiscadenza-list.component.html',
  styleUrls: ['../../scadenze.css']
})
export class TipiScadenzaListComponent implements OnInit {

//#region ----- Variabili ----------------------

  maxSeq!:                                       number;

  matDataSource = new MatTableDataSource<CAL_TipoScadenza>();

  obsTipiscadenza$!:                                 Observable<CAL_TipoScadenza[]>;

  displayedColumns: string[] = [
      "actionsColumn", 
      "descrizione", 
      "ckNota",
      "color"
  ];

  rptTitle = 'Lista Tipi Scadenza';
  rptFileName = 'ListaTipiScadenza';
  rptFieldsToKeep  = [
    "descrizione"
  ];

  rptColumnsNames  = [
    "descrizione"
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

  constructor(private svcTipiscadenza:          TipiScadenzaService,
              private _loadingService:          LoadingService,
              public _dialog:                   MatDialog) { 
          
  }

//#endregion
 
//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    
    this.obsTipiscadenza$ = this.svcTipiscadenza.list();  
    const loadTipiscadenza$ =this._loadingService.showLoaderUntilCompleted(this.obsTipiscadenza$);

    loadTipiscadenza$.subscribe(
      val =>   {
        this.matDataSource.data = val;
        this.sortCustom(); 
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente
        this.maxSeq = val.reduce((max, item) => {
          return item.seq! > max ? item.seq! : max;
        }, 0);
        // console.log ("tipiscadenza-list - loadData - maxseq", this.maxSeq);
      }
    );
  }

//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '400px',
      data: { tipoScadenzaID:  0, maxSeq: this.maxSeq}
    };
    const dialogRef = this._dialog.open(TipoScadenzaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  openDetail(tipoScadenzaID:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '400px',
      data: { tipoScadenzaID: tipoScadenzaID, maxSeq: this.maxSeq }
    };
    const dialogRef = this._dialog.open(TipoScadenzaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  drop(event: any){
    this.svcTipiscadenza.updateSeq(event.previousIndex+1, event.currentIndex+1 )
    .subscribe(res=> this.loadData());
  }
//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'descrizione':                 return item.descrizione;
        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    //if (this.context == "alunni-page") this.alunniFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      
      let searchTerms = JSON.parse(filter);
      let boolSx = String(data.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
      return boolSx;
    }
    return filterFunction;
  }
//#endregion


}
