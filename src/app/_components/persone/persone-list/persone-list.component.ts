//#region ----- IMPORTS ------------------------

import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { SelectionModel }                       from '@angular/cdk/collections';
import { map }                                  from 'rxjs/operators';

//components
import { PersonaEditComponent }                 from '../persona-edit/persona-edit.component';
import { PersoneFilterComponent }               from '../persone-filter/persone-filter.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { PersoneService }                       from '../persone.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { TableColsService }                     from '../../utilities/toolbar/tablecols.service';
import { TableColsVisibleService }              from '../../utilities/toolbar/tablecolsvisible.service';

//models
import { PER_Persona }                          from 'src/app/_models/PER_Persone';
import { User }                                 from 'src/app/_user/Users';

//#endregion
@Component({
  selector: 'app-persone-list',
  templateUrl: './persone-list.component.html',
  styleUrls: ['../persone.css']
})
export class PersoneListComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;

  matDataSource = new MatTableDataSource<PER_Persona>();

  tableName = "PersoneList";
  displayedColumns: string[] =  [];
  displayedColumnsPersoneList: string[] = [
    "actionsColumn", 
    "nome", 
    "cognome", 
    // "tipoPersona",
    // "tipoPersonaID",
    "dtNascita", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "telefono",
    "email", 
    "ckAttivo"
  ];

  filterValue = '';       //Filtro semplice

  filterValues = {
    nome: '',
    cognome: '',
    role: '',
    annoNascita: '',
    cf: '',
    indirizzo: '',
    comune: '',
    prov: '',
    email: '',
    telefono: '',
    filtrosx: ''
  };
  
  rptTitle = 'Persone';
  rptFileName = 'ListaPersone';

  rptFieldsToKeep  = [
    "nome", 
    "cognome", 
    "tipoPersona.descrizione",
    "dtNascita", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "email", 
    "telefono"];

  rptColumnsNames  = [
    "nome", 
    "cognome", 
    "tipo",
    "nato il", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "email", 
    "telefono"];

  selection = new SelectionModel<PER_Persona>(true, []);   //rappresenta la selezione delle checkbox

  menuTopLeftPosition =  {x: '0', y: '0'} 

  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;
  public ckSoloAttivi :                         boolean = true;
  emailAddresses!:                              string;
  lstRoles!:                                    string[];

//#endregion

//#region ----- ViewChild Input Output -------

  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() personeFilterComponent!:             PersoneFilterComponent;
  @Input('dove') dove! :                        string;

//#endregion

//#region ----- Constructor --------------------

  constructor(private svcPersone:                         PersoneService,
              private _loadingService:                    LoadingService,
              public _dialog:                             MatDialog,
              private svcTableCols:                       TableColsService,
              private svcTableColsVisible:                TableColsVisibleService)   { 

    this.currUser = Utility.getCurrentUser();
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    //this.displayedColumns =  this.displayedColumnsPersoneList;
    this.loadLayout();
    this.loadData(); 
  }

  loadLayout(){
    this.svcTableColsVisible.listByUserIDAndTable(this.currUser.userID, this.tableName).subscribe( colonne => {
        if (colonne.length != 0) this.displayedColumns = colonne.map(a => a.tableCol!.colName)
        else this.svcTableCols.listByTable(this.tableName).subscribe( colonne => {
            console.log ("colonne", colonne);
            this.displayedColumns = colonne.filter(colonna=> colonna.defaultShown == true).map(a => a.colName)
        })      
    });
  }

  loadData () {
    let obsPersone$: Observable<PER_Persona[]>;
    
    if(this.ckSoloAttivi){
      obsPersone$= this.svcPersone.list()
      .pipe(map(
        res=> res.filter((x) => x.ckAttivo == true))
      );
    }
    else  obsPersone$= this.svcPersone.list();
 
    const loadPersone$ =this._loadingService.showLoaderUntilCompleted(obsPersone$);
    loadPersone$
    .pipe(
        //map(val=> val.filter( val => (val.tipoPersonaID != 1 && val.tipoPersonaID != 3 ))) //vogliamo vedere tutti meno genitori e alunni...
        //map(val=> val.filter( val => (!val._LstRoles!.includes('Alunno') && !val._LstRoles!.includes('Genitore')))) //vogliamo vedere tutti meno genitori e alunni...

    ).subscribe( val => {
      //console.log ("persone-list", val);
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate();
        this.getEmailAddresses();
      }
    );
  }

  getEmailAddresses() {
    //aggiorna this.emailAddresses che serve per poter copiare dalla toolbar gli indirizzi dei genitori
      const emailArray = this.matDataSource.filteredData
        .map(persona => persona.email).filter(email => !!email)
        .filter(emails => emails.length > 0); 
  
    this.emailAddresses = emailArray.join(', ');
  }

//#endregion

//#region ----- Filtri & Sort ------------------

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
    this.getEmailAddresses()
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      
      let foundTipoPersona = data._LstRoles.includes(searchTerms.role);
      if (searchTerms.role == null || searchTerms.role == '') foundTipoPersona = true;
      //console.log (data._LstRoles, searchTerms.filtrosx, data._LstRoles.includes(searchTerms.filtrosx));
      //console.log ("persone-list - filterPredicate - searchTerms, cosa cerco", searchTerms);
      const lstRolesLowerCase = data._LstRoles.map((role: string) => role.toLowerCase());


      let boolSx = String(data.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || lstRolesLowerCase.includes(searchTerms.filtrosx)
                || String(data.dtNascita).indexOf(searchTerms.filtrosx) !== -1
                || String(data.cf).indexOf(searchTerms.filtrosx) !== -1
                || String(data.indirizzo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.comune).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.prov).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.telefono).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && foundTipoPersona
                && String(data.dtNascita).indexOf(searchTerms.annoNascita) !== -1
                && String(data.cf).indexOf(searchTerms.cf) !== -1
                && String(data.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
                && String(data.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
                && String(data.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
                && String(data.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
                && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '640px',
      data: 0
    };

    const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '640px',
      data: id
    };

    const dialogRef = this._dialog.open(PersonaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------

selectedRow(element: PER_Persona) {
  this.selection.toggle(element);
}

masterToggle() {
  this.toggleChecks = !this.toggleChecks;

  if (this.toggleChecks) {
    const visibleData = this.matDataSource.filteredData || this.matDataSource.data;
    this.selection.select(...visibleData);
    //this.selection.select(...this.matDataSource.data); così seleziono tutti i record ma se ce ne sono di non visibili perchè filtrati seleziono anche quelli
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
checkboxLabel(row?: PER_Persona): string {
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

//#region ----- Right Click --------------------

  onRightClick(event: MouseEvent, element: PER_Persona) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion
  
}
