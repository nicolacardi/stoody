//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { map }                                  from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//services
import { ClasseAnnoMateriaService }             from '../classe-anno-materia.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';

//models
import { CLS_ClasseAnnoMateria }                from 'src/app/_models/CLS_ClasseAnnoMateria';
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';

//components
import { ClasseAnnoMateriaEditComponent }       from '../classe-anno-materia-edit/classe-anno-materia-edit.component';
import { SelectionModel } from '@angular/cdk/collections';

//#endregion
@Component({
  selector: 'app-classi-anni-materie-list',
  templateUrl: './classi-anni-materie-list.component.html',
  styleUrls: ['../classi-anni-materie.css']
})
export class ClassiAnniMaterieListComponent implements OnInit {


//#region ----- Variabili ----------------------

  matDataSource = new MatTableDataSource<CLS_ClasseAnnoMateria>();

  obsClassiAnniMaterie$!:                         Observable<CLS_ClasseAnnoMateria[]>;

  obsAnni$!:                                      Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico
  form! :                                         UntypedFormGroup;

  selection = new SelectionModel<CLS_ClasseAnnoMateria>(true, []);
  selectedRowIndex=-1;
  toggleChecks:                                 boolean = false;

  displayedColumns: string[] = [
    "select", 
    "actionsColumn", 
    "classe",
    "materia",
    "tipoVoto"
  ];

  rptTitle = 'Lista Tipi Voto';
  rptFileName = 'ListaTipiVoto';
  rptFieldsToKeep  = [
    "classe.descrizione",
    "anno.annoscolastico",
    "materia.descrizione",
    "tipoVoto.descrizione"
  ];

  rptColumnsNames  = [
    "classe",
    "anno",
    "materia",
    "tipoVoto"
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    anno: '',
    classe: '',
    materia: '',
    tipoVoto: '',
    filtrosx: ''
  }

//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild(MatPaginator) paginator!:          MatPaginator;
//#endregion

//#region ----- Constructor --------------------
  constructor(private svcClasseAnnoMateria:     ClasseAnnoMateriaService,
              private svcAnni:                  AnniScolasticiService,
              private fb:                       UntypedFormBuilder, 
              private _loadingService:          LoadingService,
              public _dialog:                   MatDialog ) {
              
    let obj = localStorage.getItem('AnnoCorrente');
    this.form = this.fb.group({
      selectAnnoScolastico:  +(JSON.parse(obj!) as _UT_Parametro).parValue
    })      
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {

    this.obsAnni$= this.svcAnni.list();
    this.loadData();
    this.form.controls['selectAnnoScolastico'].valueChanges.subscribe(
       () => this.loadData()
      );
  }

  loadData() {

    this.obsClassiAnniMaterie$ = this.svcClasseAnnoMateria.list();  
    const loadClassiAnniMaterie$ =this._loadingService.showLoaderUntilCompleted(this.obsClassiAnniMaterie$);

    loadClassiAnniMaterie$
    .pipe(
      map(val=>val.filter(val=>(val.annoID == this.form.controls['selectAnnoScolastico'].value)))
    ).subscribe(
      res=>{
        this.matDataSource.data = res;
        this.matDataSource.paginator = this.paginator;
        this.sortCustom(); 
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate(); //usiamo questo per uniformità con gli altri component nei quali c'è anche il filtro di destra, così volendo lo aggiungiamo velocemente
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
    const dialogRef = this._dialog.open(ClasseAnnoMateriaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }

  openDetail(obiettivoID:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '400px',
      height: '430px',
      data: obiettivoID
    };
    const dialogRef = this._dialog.open(ClasseAnnoMateriaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }
//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
    
      switch(property) {
        case 'anno':                        return item.anno.anno1;
        case 'classe':                      return item.classe.descrizione2;
        case 'materia':                     return item.materia.descrizione;
        case 'tipoVoto':                    return item.tipoVoto.descrizione;

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

      let boolSx = 
                    String(data.classe.descrizione2).toLowerCase().indexOf(searchTerms.filtrosx) !== -1               
                    || String(data.materia.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                    || String(data.tipoVoto.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1

      let boolDx = 
                    String(data.classe.descrizione2).toLowerCase().indexOf(searchTerms.classe) !== -1
                    && String(data.materia.descrizione).toLowerCase().indexOf(searchTerms.materia) !== -1
                    && String(data.tipoVoto.descrizione).toLowerCase().indexOf(searchTerms.tipoVoto) !== -1

      return boolSx && boolDx;

    }
    return filterFunction;
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------
  selectedRow(element: CLS_ClasseAnnoMateria) {
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
  checkboxLabel(row?: CLS_ClasseAnnoMateria): string {
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
