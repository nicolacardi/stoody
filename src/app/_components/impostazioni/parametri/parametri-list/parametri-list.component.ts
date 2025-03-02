

//#region ----- IMPORTS ------------------------

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { SelectionModel }                       from '@angular/cdk/collections';
import { MatTableDataSource}                    from '@angular/material/table';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { ParametroEditComponent }               from '../parametro-edit/parametro-edit.component';
import { ParametriFilterComponent }             from '../parametri-filter/parametri-filter.component';
import { Utility }                              from '../../../utilities/utility.component';

//services
import { ParametriService }                      from '../parametri.service';
import { LoadingService }                       from '../../../utilities/loading/loading.service';
import { TableColsService }                     from '../../../utilities/toolbar/tablecols.service';
import { TableColsVisibleService }              from '../../../utilities/toolbar/tablecolsvisible.service';

//models
import { _UT_Parametro }                         from 'src/app/_models/_UT_Parametro';
import { User }                                 from 'src/app/_user/Users';


//#endregion
@Component({
  selector: 'app-parametri-list',
  templateUrl: './parametri-list.component.html',
  styleUrls: ['../parametri.css']
})

export class ParametriListComponent implements OnInit {

//#region ----- Variabili ----------------------
  maxSeq!:                                      number;
  currUser!:                                    User;
    
  matDataSource = new MatTableDataSource<_UT_Parametro>();

  tableName = "ParametriList";
  displayedColumns: string[] =  [];

  rptTitle = 'List Parametri';
  rptFileName = 'ListaParametri';

  rptFieldsToKeep  = [
    "parName",
    "parDescr",
    "parValue"
  ];

  rptColumnsNames  = [
    "Nome",
    "Descrizione Estesa",
    "Valore"
  ];

  selection = new SelectionModel<_UT_Parametro>(true, []);   //rappresenta la selezione delle checkbox


  menuTopLeftPosition =  {x: '0', y: '0'} 

  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showFilter:                                   boolean = true;

  showTableRibbon:                              boolean = true;

  filterValue = '';       //Filtro semplice
   //filterValues contiene l'elenco dei filtri avanzati da applicare 
   filterValues = {
    parName: '',
    parValue: '',
    parDescr: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger;

  @Input() ParametriFilterComponent!: ParametriFilterComponent;
  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
//#endregion

//#region ----- Constructor --------------------
  constructor(private svcParametri:             ParametriService,
              public _dialog:                   MatDialog, 
              private _loadingService:          LoadingService,
              private svcTableCols:             TableColsService,
              private svcTableColsVisible:      TableColsVisibleService ) {
     
     this.currUser = Utility.getCurrentUser();
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {

      this.loadData();
      this.toggleChecks = false;
      this.resetSelections();
  }

  ngOnInit () {

      this.showFilter = false;
      this.loadLayout();
      this.loadData(); 
  }

  loadLayout(){
    this.svcTableColsVisible.listByUserIDAndTable(this.currUser.userID, this.tableName).subscribe( colonne => {
        if (colonne.length != 0) 
          this.displayedColumns = colonne.map(a => a.tableCol!.colName)
          else this.svcTableCols.listByTable(this.tableName).subscribe( colonne => {
            this.displayedColumns = colonne.filter(colonna=> colonna.defaultShown == true).map(a => a.colName)
        })      
    });
  }

  loadData () {

    let obsParametri$: Observable<_UT_Parametro[]>;
    obsParametri$= this.svcParametri.listSetupPage();    
    const loadParametri$ =this._loadingService.showLoaderUntilCompleted(obsParametri$);

    loadParametri$.subscribe(
      val =>   {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.sortCustom();
        this.matDataSource.sort = this.sort;
        this.matDataSource.filterPredicate = this.filterPredicate();
        this.maxSeq = val.reduce((max, item) => {
          return item.seq! > max ? item.seq! : max;
        }, 0);
      }
    );
  }

//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'parName':                         return item.parName;
        case 'parValue':                        return item.parValue;
        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  resetSearch(){
    this.filterInput.nativeElement.value = "";
    this.filterValue = "";
    this.filterValues.filtrosx = "";
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      let boolSx =  String(data.parName).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  ||  String(data.parValue).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                  ||  String(data.parDescr).toLowerCase().indexOf(searchTerms.filtrosx) !== -1

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.parName).toLowerCase().indexOf(searchTerms.parName) !== -1
                  && String(data.parValue).toLowerCase().indexOf(searchTerms.parValue) !== -1
                  && String(data.parDescr).toLowerCase().indexOf(searchTerms.parDescr) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '600px',
      height: '350px',
      data:  { parametroID: 0, maxSeq: this.maxSeq }
    };

    const dialogRef = this._dialog.open(ParametroEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      res => this.loadData()
    );
  }
  
  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '600px',
      height: '350px',
      data:  { parametroID: id, maxSeq: this.maxSeq }
    };

    const dialogRef = this._dialog.open(ParametroEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        () => this.loadData()
    );
  }

  drop(event: any){
    // console.log ("parametri-list - drop - event.previousIndex, event.currentIndex",event.previousIndex, event.currentIndex);
    this.svcParametri.updateSeq(event.previousIndex+1, event.currentIndex+1 )
    .subscribe(res=> this.loadData());
  }

//#endregion

//#region ----- Gestione Campo Checkbox --------

selectedRow(element: _UT_Parametro) {
  this.selection.toggle(element);
}

masterToggle() {
  this.toggleChecks = !this.toggleChecks;

  if (this.toggleChecks) {
    const visibleData = this.matDataSource.filteredData || this.matDataSource.data;
    this.selection.select(...visibleData);
  } else 
    this.resetSelections();
}

resetSelections() {
  this.selection.clear();
  this.matDataSource.data.forEach(row => this.selection.deselect(row));
}

getChecked() {
  //funzione usata da classi-dahsboard
  return this.selection.selected;
}

//non so se serva questo metodo: genera un valore per l'aria-label...
//forse serve per poi pescare i valori selezionati?
checkboxLabel(row?: _UT_Parametro): string {
  if (!row) 
    return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  else
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
}

//questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
//per ora non lo utilizzo
isAllSelected() {
  const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
  const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
  return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
}
//#endregion


}


