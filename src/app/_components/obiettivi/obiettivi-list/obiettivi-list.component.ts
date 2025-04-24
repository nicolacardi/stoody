//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { map }                                  from 'rxjs/operators';

//components
import { ObiettivoEditComponent }               from '../obiettivo-edit/obiettivo-edit.component';
import { ObiettiviFilterComponent }             from '../obiettivi-filter/obiettivi-filter.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { ObiettiviService }                     from '../obiettivi.service';
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';

//classes
import { MAT_Obiettivo }                        from 'src/app/_models/MAT_Obiettivo';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';
import { SelectionModel } from '@angular/cdk/collections';

//#endregion
@Component({
  selector: 'app-obiettivi-list',
  templateUrl: './obiettivi-list.component.html',
  styleUrls: ['../obiettivi.css']
})
export class ObiettiviListComponent implements OnInit {

//#region ----- Variabili ----------------------

  matDataSource = new MatTableDataSource<MAT_Obiettivo>();

  obsObiettivi$!:                               Observable<MAT_Obiettivo[]>;

  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form! :                                       UntypedFormGroup;

  selection = new SelectionModel<MAT_Obiettivo>(true, []);
  selectedRowIndex=-1;
  toggleChecks:                                 boolean = false;
  
  displayedColumns: string[] = [
    "select", 
    "actionsColumn",
    "classe",
    "materia",
    "descrizione"
  ];

  rptTitle = 'Lista Obiettivi';
  rptFileName = 'ListaObiettivi';
  rptFieldsToKeep  = [

    "classe.descrizione2",
    "anno.annoscolastico",
    "materia.descrizione",
    "descrizione"
  ];

  rptColumnsNames  = [
    "classe",
    "anno",
    "materia",
    "descrizione"
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    descrizione: '',
    classeID: '',
    materiaID: '',
    filtrosx: ''
  }
//#endregion

//#region ----- ViewChild Input Output ---------

  @Input() obiettiviFilterComponent!:           ObiettiviFilterComponent;
  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
//#endregion

//#region ----- Constructor --------------------

  constructor(private svcObiettivi:                   ObiettiviService,
              private svcAnni:                        AnniScolasticiService,
              private fb:                             UntypedFormBuilder, 
              private _loadingService:                LoadingService,
              public _dialog:                         MatDialog) {

    let obj = sessionStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    })      
 }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.obsAnni$= this.svcAnni.list();
    this.loadData();
    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(
      () => { 
      this.loadData();
      })
  }

  loadData() {

    this.obsObiettivi$ = this.svcObiettivi.list();  
    const loadObiettivi$ =this._loadingService.showLoaderUntilCompleted(this.obsObiettivi$);

    loadObiettivi$
    .pipe(
      map(val=>val.filter(val=>(val.annoID == this.form.controls['selectAnnoScolastico'].value)))
    )
    .subscribe(val =>   {
      // console.log("obiettivi-list - loadData - val", val);
      this.matDataSource.data = val;
      this.matDataSource.paginator = this.paginator;
      this.sortCustom(); 
      this.matDataSource.sort = this.sort; 
      this.matDataSource.filterPredicate = this.filterPredicate();
    }
  );

  }
//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '430px',
      data: 0
    };
    const dialogRef = this._dialog.open(ObiettivoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() =>  this.loadData());
  }

  openDetail(obiettivoID:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '430px',
      data: obiettivoID
    };
    const dialogRef = this._dialog.open(ObiettivoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() =>  this.loadData());
  }
//#endregion

//#region ----- Filtri & Sort ------------------


  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'classe':                      return item.classe.descrizione2;
        case 'anno':                        return item.anno.anno1;
        case 'materia':                     return item.materia.descrizione;
        case 'descrizione':                 return item.descrizione;

        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      let boolSx = String(data.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                    || String(data.materia.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                    || String(data.classe.descrizione2).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      let boolDx = String(data.classeID).toLowerCase().indexOf(searchTerms.classeID) !== -1
                    && String(data.materiaID).toLowerCase().indexOf(searchTerms.materiaID) !== -1
                    && String(data.descrizione).toLowerCase().indexOf(searchTerms.descrizione) !== -1;

                    
      return boolSx  && boolDx;

    }
    return filterFunction;
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------
  selectedRow(element: MAT_Obiettivo) {
    this.selection.toggle(element);
  }

  masterToggle() {

    this.toggleChecks = !this.toggleChecks;
  
    if (this.toggleChecks) {
      // Filtra solo i record visibili
      const visibleData = this.matDataSource.filteredData || this.matDataSource.data;
      this.selection.select(...visibleData);
    } else {
      this.resetSelections();
    }

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
  checkboxLabel(row?: MAT_Obiettivo): string {
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
