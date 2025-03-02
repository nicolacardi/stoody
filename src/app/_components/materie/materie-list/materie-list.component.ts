//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

//components
import { MateriaEditComponent } from '../materia-edit/materia-edit.component';

//services
import { MaterieService } from 'src/app/_components/materie/materie.service';
import { LoadingService } from '../../utilities/loading/loading.service';

//models
import { MAT_Materia } from 'src/app/_models/MAT_Materia';

//#endregion

@Component({
  selector: 'app-materie-list',
  templateUrl: './materie-list.component.html',
  styleUrls: ['../materie.css']
})
export class MaterieListComponent implements OnInit {

//#region ----- Variabili ----------------------

  maxSeq!:                                      number;
  matDataSource = new MatTableDataSource<MAT_Materia>();

  obsMaterie$!:                                 Observable<MAT_Materia[]>;

  displayedColumns: string[] = [

      "actionsColumn", 
      "seq",
      "descrizione", 
      "macroMateria",
      "color"

  ];

  rptTitle = 'Lista Materie';
  rptFileName = 'ListaMaterie';
  rptFieldsToKeep  = [
    "descrizione",
    "macroMateria.descrizione"
  ];

  rptColumnsNames  = [
    "descrizione",
    "Macro Materia"
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

  constructor(private svcMaterie:                     MaterieService,
              private _loadingService:                LoadingService,
              public _dialog:                         MatDialog) { 

  }
//#endregion
 
//#region ----- LifeCycle Hooks e simili--------
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.obsMaterie$ = this.svcMaterie.list();  
    const loadMaterie$ =this._loadingService.showLoaderUntilCompleted(this.obsMaterie$);

    loadMaterie$.subscribe(
      val =>   {
        this.matDataSource.data = val;
        this.sortCustom(); 
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente
      
        this.maxSeq = val.reduce((max, item) => {
          return item.seq! > max ? item.seq! : max;
        }, 0);
      }
    );
  }
//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '370px',
      data: {
        materiaID:                              0,
        maxSeq:                                 this.maxSeq
      }
    };
    const dialogRef = this._dialog.open(MateriaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  openDetail(materiaID:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '370px',
      data: {
        materiaID:                              materiaID,
        maxSeq:                                 this.maxSeq
      }
    };
    const dialogRef = this._dialog.open(MateriaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }
//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'descrizione':                 return item.descrizione;
        case 'macroMateria':                return item.macroMateria.descrizione;
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
                || String(data.macroMateria.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
      return boolSx;
    }
    return filterFunction;
  }

  drop(event: any){
    this.svcMaterie.updateSeq(event.previousIndex+1, event.currentIndex+1 )
    .subscribe(res=> this.loadData());
  }
//#endregion


}
