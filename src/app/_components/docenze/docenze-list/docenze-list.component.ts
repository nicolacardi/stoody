//#region ----- IMPORTS ------------------------

import { SelectionModel }                       from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';

//components
import { DocenzaEditComponent }                 from '../docenza-edit/docenza-edit.component';
import { PersonaEditComponent }                 from '../../persone/persona-edit/persona-edit.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { DocenzeService }                       from '../docenze.service';
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';

//models
import { CLS_ClasseDocenteMateria }             from 'src/app/_models/CLS_ClasseDocenteMateria';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';


//#endregion
@Component({
  selector: 'app-docenze-list',
  templateUrl: './docenze-list.component.html',
  styleUrls: ['../docenze.css']
})

export class DocenzeListComponent implements OnInit {

//#region ----- Variabili ----------------------
matDataSource = new                             MatTableDataSource<CLS_ClasseDocenteMateria>();
  //storedFilterPredicate!:                       any;
  filterValue = '';
  classeSezioneAnno!:                           CLS_ClasseSezioneAnno;
  displayedColumns: string[] =  [];
  displayedColumnsCoordinatore:                             string[] = [
    "select",
    "actionsColumn",
    "materia",
    "docenteNome",
    "docenteCognome",
    "ckOrario",
    "ckPagella"
  ];

  displayedColumnsDocenteEdit:                             string[] = [
    "materia",
    "anno",
    "classe",
    "sezione"
  ];


  selection = new SelectionModel<CLS_ClasseDocenteMateria>(true, []);   //rappresenta la selezione delle checkbox

  matSortActive!:                               string;
  matSortDirection!:                            string;

  public page!:                                 string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  
  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = false;
  showTableRibbon:                              boolean = true;
  public ckSoloAttivi :                         boolean = true;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatPaginator) paginator!        : MatPaginator;
  @ViewChild(MatSort) sort!                  : MatSort;
  @ViewChild(MatMenuTrigger, {static         : true}) matMenuTrigger!: MatMenuTrigger;

  @Input() classeSezioneAnnoID!              : number;
  @Input() docenteID!                        : number;
  @Input('dove') dove! :                        string;
  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
//#endregion

//#region ----- Constructor ---------------------
  constructor(private svcDocenze:                 DocenzeService,
              private svcClasseSezioneAnno:       ClassiSezioniAnniService,
              private _loadingService:            LoadingService,
              public _dialog:                     MatDialog ) {
            
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {


    switch(this.dove) {
      case 'coordinatore-dashboard':
        this.displayedColumns = this.displayedColumnsCoordinatore;
        this.loadData();         
        break;
      case 'docente-edit':
        this.displayedColumns = this.displayedColumnsDocenteEdit;
        this.loadData();         
        break;
    }
    if (this.classeSezioneAnnoID != undefined) {
      this.loadData();
      //this.toggleChecks = false;
      //parcheggio in classeSezioneAnno i dati della classe che servono a coordinatore-dashboard (per il nome dell'export)
      
      this.svcClasseSezioneAnno.get(this.classeSezioneAnnoID).subscribe(
        res => this.classeSezioneAnno = res
      )
    } 
  }

  ngOnInit(){

  }

  loadData () {

    let obsInsegnamenti$: Observable<CLS_ClasseDocenteMateria[]>;
  
    if (this.classeSezioneAnnoID) {
      obsInsegnamenti$= this.svcDocenze.listByClasseSezioneAnno(this.classeSezioneAnnoID);
    } else {
      obsInsegnamenti$= this.svcDocenze.listByDocente(this.docenteID);
    }
    let loadInsegnamenti$ =this._loadingService.showLoaderUntilCompleted(obsInsegnamenti$);

    loadInsegnamenti$.subscribe(res =>  {
        console.log("docenze-list - loadData - res:", res);

        this.matDataSource.data = res;
        //this.matDataSource.paginator = this.paginator;          
        this.sortCustom();
        this.matDataSource.sort = this.sort; 
        //this.matDataSource.filterPredicate = this.filterPredicate();
      }
    );
    
  }
//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'materia':                         return item.materia.descrizione;
        case 'docenteNome':                     return item.docente.persona.nome;
        case 'docenteCognome':                  return item.docente.persona.cognome;
        case 'classe':                          return item.classeSezioneAnno.classeSezione.classe.descrizione2;
        case 'sezione':                          return item.classeSezioneAnno.classeSezione.sezione;

        case 'anno':                            return item.classeSezioneAnno.annoID;

        default: return item[property]
      }
    };
  }
//#endregion

//#region ----- Right Click --------------------

  onRightClick(event: MouseEvent, element: CLS_ClasseDocenteMateria) { 

    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  openDocente (docenteID: any) {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: docenteID
    };

    const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(() => {
          this.loadData();
       });
  }

//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){

    //TODO!!!
    /*
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '580px',
      data: 0
    };
    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed()
      .subscribe(
        () => {
          this.loadData();
    });
    */
  }

  openDetail(id:number){

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '460px',
      height: '480px',
      data: id
    };
    const dialogRef = this._dialog.open(DocenzaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => { 
        this.loadData(); 
      }
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------
  selectedRow(element: CLS_ClasseDocenteMateria) {
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

  toggleAttivi(){
    this.ckSoloAttivi = !this.ckSoloAttivi;
    this.loadData();
  }

  getChecked() {
    //funzione usata da classi-dahsboard
    return this.selection.selected;
  }

    //non so se serva questo metodo: genera un valore per l'aria-label...
  //forse serve per poi pescare i valori selezionati?
  checkboxLabel(row?: CLS_ClasseDocenteMateria): string {
    if (!row) 
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    else
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id! + 1}`;
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
