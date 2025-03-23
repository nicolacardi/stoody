//#region ----- IMPORTS ------------------------

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { map, tap }                                  from 'rxjs/operators';
import { SelectionModel }                       from '@angular/cdk/collections';
import { MatTableDataSource}                    from '@angular/material/table';
import { CdkDragDrop, moveItemInArray}          from '@angular/cdk/drag-drop';
import { Router }                               from '@angular/router';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { GenitoreEditComponent }                from '../genitore-edit/genitore-edit.component';
import { GenitoriFilterComponent }              from '../genitori-filter/genitori-filter.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { GenitoriService }                      from '../genitori.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { NavigationService }                    from '../../utilities/navigation/navigation.service';

//models
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { User }                                 from 'src/app/_user/Users';
import { TableColsService }                     from '../../utilities/toolbar/tablecols.service';
import { TableColsVisibleService }              from '../../utilities/toolbar/tablecolsvisible.service';

//#endregion
@Component({
  selector: 'app-genitori-list',
  templateUrl: './genitori-list.component.html',
  styleUrls: ['../genitori.css']
})

export class GenitoriListComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;
    
  matDataSource = new MatTableDataSource<ALU_Genitore>();

  tableName = "GenitoriList";
  displayedColumns: string[] =  [];
  displayedColumnsAlunnoEditFamiglia: string[] = [
      "actionsColumn", 
      "nome", 
      "cognome",
      "tipoGenitoreID",
      "telefono", 
      "email",
      "dtNascita",
      "removeFromFam" 
    ];
  displayedColumnsAlunnoEditList: string[] = [
      "actionsColumn", 
      "nome", 
      "cognome",
      "tipoGenitoreID",
      "telefono", 
      "email",
      "dtNascita",
      "addToFam" 
  ];
  // displayedColumnsGenitoriPage = [
  //   "actionsColumn", 
  //   "nome", 
  //   "cognome", 
  //   "dtNascita",
  //   "tipoGenitoreID", 
  //   "indirizzo", 
  //   "comune", 
  //   "cap", 
  //   "prov", 
  //   "telefono", 
  //   "email", 
  //   "ckAttivo"
  //  ];

  rptTitle = 'List Genitori';
  rptFileName = 'ListaGenitori';

  rptFieldsToKeep  = [
    "persona.nome", 
    "persona.cognome", 
    "tipoGenitore.descrizione", 
    "persona.indirizzo", 
    "persona.telefono", 
    "persona.email", 
    "persona.dtNascita"];

  rptColumnsNames  = [
    "nome", 
    "cognome", 
    "tipoGenitoreID", 
    "indirizzo", 
    "telefono", 
    "email", 
    "nato il"];

  selection = new SelectionModel<ALU_Genitore>(true, []);   //rappresenta la selezione delle checkbox

  public passedAlunno!:                         string;
  // public page!:                                 string;
  emailAddresses!:                              string;

  menuTopLeftPosition =  {x: '0', y: '0'} 

  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showFilter:                                   boolean = true;

  showTableRibbon:                              boolean = true;
  // public ckSoloAttivi :                         boolean = true;

  filterValue = '';       //Filtro semplice
   //filterValues contiene l'elenco dei filtri avanzati da applicare 
   filterValues = {
    nome: '',
    cognome: '',
    dtNascita: '',
    indirizzo: '',
    comune: '',
    prov: '',
    email: '',
    telefono: '',
    nomeCognomeAlunno: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger;

  @Input() genitoriFilterComponent!: GenitoriFilterComponent;
  @Input('context') context! :                  string;
  @Input('alunnoID') alunnoID! :                number;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
  @Output('addToFamily') addToFamily = new EventEmitter<ALU_Genitore>();
  @Output('removeFromFamily') removeFromFamily = new EventEmitter<ALU_Genitore>();

//#endregion

//#region ----- Constructor --------------------
  constructor(private svcGenitori:              GenitoriService,
              private router:                   Router,
              public _dialog:                   MatDialog, 
              private _loadingService:          LoadingService,
              private _navigationService:       NavigationService,
              private svcTableCols:             TableColsService,
              private svcTableColsVisible:      TableColsVisibleService ) {
     
     this.currUser = Utility.getCurrentUser();
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    if (this.context != ''){
      this.loadData();
      this.toggleChecks = false;
      this.resetSelections();
    }
  }

  ngOnInit () {

    if (this.context == "alunno-edit" || this.context == "alunno-edit-famiglia") {
      this.showPageTitle = false;
      this.showTableRibbon = false;
    }
    if (this.context == "alunno-edit-famiglia") 
      this.showFilter = false;
    
    switch(this.context) {
      case 'alunno-edit': this.displayedColumns = this.displayedColumnsAlunnoEditList; break;
      case 'alunno-edit-famiglia': this.displayedColumns = this.displayedColumnsAlunnoEditFamiglia; break;
      //default: this.displayedColumns = this.displayedColumnsGenitoriPage;
      default: this.loadLayout();
    }

    this._navigationService.getAlunno().subscribe( val=>{
      if (val!= '') {
        this.passedAlunno = val;
        // console.log("genitori-list - ngOnInit - this.passedAlunno", this.passedAlunno);
        this.toggleDrawer.emit();
        this.genitoriFilterComponent.nomeCognomeAlunnoFilter.setValue(val);
        this.loadData(); 
      }
    });    
  }

  loadLayout(){
    this.svcTableColsVisible.listByUserIDAndTable(this.currUser.userID, this.tableName)
    .subscribe( colonne => {
        if (colonne.length != 0) this.displayedColumns = colonne.map(a => a.tableCol!.colName)
        else this.svcTableCols.listByTable(this.tableName).subscribe( colonne => {
          this.displayedColumns = colonne.filter(colonna=> colonna.defaultShown == true).map(a => a.colName)
        })          
    });
  }

  loadData () {

    let obsGenitori$: Observable<ALU_Genitore[]>;

    if(this.context == "alunno-edit-famiglia"){
      obsGenitori$ = this.svcGenitori.listByAlunno(this.alunnoID);
      //.pipe(map(res=> res.filter(gen => gen._Figli.some(y => (y.id == this.alunnoID)))));  //BELLISSIMA Sembra giusta ma non funziona
    }
    else {
      // if(this.ckSoloAttivi){
      //   obsGenitori$= this.svcGenitori.listWithChildren()
      //     .pipe( 
      //       map(res=> res.filter((x) => x.persona.ckAttivo == true)),
      //       tap(res=>console.log("genitori-list", res))
      //     );
      // }
      // else
        obsGenitori$= this.svcGenitori.listWithChildren();
    }

    const loadGenitori$ =this._loadingService.showLoaderUntilCompleted(obsGenitori$);

    loadGenitori$.subscribe(
      val =>   {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.sortCustom();
        this.matDataSource.sort = this.sort;
        this.matDataSource.filterPredicate = this.filterPredicate();
        this.getEmailAddresses();

      }
    );
  }

  getEmailAddresses() {
    //aggiorna this.emailAddresses che serve per poter copiare dalla toolbar gli indirizzi dei genitori
      const emailArray = this.matDataSource.filteredData
      .map(genitore => genitore.persona.email).filter(email => !!email)
      .filter(emails => emails.length > 0); 

    this.emailAddresses = emailArray.join(', ');
  }

//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'nome':                            return item.persona.nome;
        case 'cognome':                         return item.persona.cognome;
        case 'dtNascita':                       return item.persona.dtNascita;
        case 'indirizzo':                       return item.persona.indirizzo;
        case 'comune':                          return item.persona.comune;
        case 'cap':                             return item.persona.cap;
        case 'prov':                            return item.persona.prov;
        case 'telefono':                        return item.persona.telefono;
        case 'email':                           return item.persona.email;
        default: return item[property]
      }
    };
  }

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
    this.getEmailAddresses();

  }

  resetSearch(){
    this.filterInput.nativeElement.value = "";
    this.filterValue = "";
    this.filterValues.filtrosx = "";
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      let foundAlunno : boolean = false;
      
      //se il campo nomeCognomeGenitore è compilato deve restituire True se trova  mentre deve restituire false se non ci sono i genitori
      //se il campo non è compilato deve sempre restituire True
      //if (Object.values(searchTerms).every(x => x === null || x === '')) 
      if (searchTerms.nomeCognomeAlunno.length > 0){

        if (data._Figli.length == 0) //restituisce false se , avendo digitato qualcosa, i figli non ci sono proprio per il genitore della riga
          foundAlunno = false;
        else {
          data._Figli?.forEach((val : { alunno: {persona: { nome: any; cognome: any}}; })=>  {
              const foundCognomeNome = foundAlunno || String(val.alunno.persona.cognome+" "+val.alunno.persona.nome).toLowerCase().indexOf(searchTerms.nomeCognomeAlunno) !== -1;
              const foundNomeCognome = foundAlunno || String(val.alunno.persona.nome+" "+val.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeAlunno) !== -1; 
              foundAlunno = foundCognomeNome || foundNomeCognome;
          })
        }
      } else {
        foundAlunno = true;
      }

      let dArr = data.persona.dtNascita.split("-");
      const dtNascitaddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];

      let boolSx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(dtNascitaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.indirizzo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.comune).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.prov).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.telefono).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && String(dtNascitaddmmyyyy).indexOf(searchTerms.dtNascita) !== -1
                && String(data.persona.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
                && String(data.persona.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
                && String(data.persona.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
                && String(data.persona.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
                && String(data.persona.email).toLowerCase().indexOf(searchTerms.email) !== -1
                && foundAlunno;

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
      height: '650px',
      data: 0
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      res => this.loadData()
    );
  }
  
  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '650px',
      data: id
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        () => this.loadData()
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click --------------------

  onRightClick(event: MouseEvent, element: ALU_Genitore) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  } 

  openAlunni(item: ALU_Genitore) {
    this._navigationService.passGenitore(item.persona.nome+" "+item.persona.cognome);
    this.router.navigateByUrl("/alunni");
  }
//#endregion

//#region ----- Gestione Campo Checkbox --------
selectedRow(element: ALU_Genitore) {
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

// toggleAttivi(){
//   this.ckSoloAttivi = !this.ckSoloAttivi;
//   this.loadData();
// }

getChecked() {
  //funzione usata da classi-dahsboard
  return this.selection.selected;
}

//non so se serva questo metodo: genera un valore per l'aria-label...
//forse serve per poi pescare i valori selezionati?
checkboxLabel(row?: ALU_Genitore): string {
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

//#region ----- Emit per alunno-edit -----------

  addToFamilyEmit(item: ALU_Genitore) {
    this.addToFamily.emit(item);
  }

  removeFromFamilyEmit(item: ALU_Genitore) {
    this.removeFromFamily.emit(item);
  }
//#endregion
}



//Per fare il resize
    /*
    this._navigationService.passPage("genitoriList");

    this.displayedColumns = (window.innerWidth <= 800) ? ["actionsColumn", "nome", "cognome", "telefono", "email","dtNascita"] : ["actionsColumn", "nome", "cognome", "tipo","indirizzo", "telefono", "email","dtNascita"];

    this._navigationService.getAlunno()
      .subscribe(
        val=>{
        this.alunnoID = val;
        this.refresh();
    });
    */