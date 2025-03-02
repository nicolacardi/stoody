//#region ----- IMPORTS ------------------------

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';
import { CdkDragDrop, moveItemInArray}          from '@angular/cdk/drag-drop';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { SelectionModel }                       from '@angular/cdk/collections';

//components
import { UserEditComponent }                    from '../user-edit/user-edit.component';
import { UsersFilterComponent }                 from '../users-filter/users-filter.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { UserService }                          from '../../../_user/user.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { NavigationService }                    from '../../utilities/navigation/navigation.service';
import { TableColsVisibleService }              from '../../utilities/toolbar/tablecolsvisible.service';
import { TableColsService }                     from '../../utilities/toolbar/tablecols.service';


//classes
import { User }                                 from 'src/app/_user/Users';


//#endregion


@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['../users.css']
})

export class UsersListComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;
  matDataSource = new MatTableDataSource<User>();

  tableName = "UsersList";

  displayedColumns: string[] =  [];
  displayedColumnsUsersList: string[] = [
      //"userID", 
      "actionsColumn",
      "userName", 
      "nome",
      "cognome",
      "email", 
      // "persona.tipoPersona.descrizione",
  
      "personaID",
      // "tipoPersonaID"
      // "badge"
  ];

  filterValue = '';       //Filtro semplice

  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    nome: '',
    cognome:    '',
    email:    '',
    tipoPersona:    '',
    filtrosx: ''
  };

  rptTitle = 'Lista Utenti';
  rptFileName = 'ListaUtenti';

  rptFieldsToKeep  = [
    "userName", 
    "email", 
    // "ruolo",
    // "badge"
  ];

  rptColumnsNames  = [
    "userName", 
    "email", 
    // "ruolo",
    // "badge"
  ];

  selection = new SelectionModel<User>(true, []);   //rappresenta la selezione delle checkbox

  matSortActive!:                               string;
  matSortDirection!:                            string;

  public page!:                                 string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  idUsersChecked:                               number[] = [];
  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;
  public ckSoloAttivi :                         boolean = true;
  emailAddresses!:                              string;

//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild(MatPaginator) paginator!:                        MatPaginator;
  @ViewChild(MatSort) sort!:                                  MatSort;
  @ViewChild("filterInput") filterInput!:                     ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() usersFilterComponent!:                            UsersFilterComponent;
  @Input('dove') dove! :                                      string;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
//#endregion

  constructor(private svcUsers:                 UserService,
              public _dialog:                   MatDialog, 
              private _loadingService:          LoadingService,
              private _navigationService:       NavigationService,
              private svcTableCols:             TableColsService,
              private svcTableColsVisible:      TableColsVisibleService  ) {
    
    this.currUser = Utility.getCurrentUser();
  }
  
//#region ----- LifeCycle Hooks e simili-------
  ngOnChanges() {
   
      if (this.dove != ''){
        this.loadData();
        this.toggleChecks = false;
        this.resetSelections();
      }
  }
  
  ngOnInit () {
    switch(this.dove) {
      case 'users-page': 
        this.loadLayout();
        //this.displayedColumns =  this.displayedColumnsUsersList;
        this._navigationService.getGenitore().subscribe(  val=>{
          if (val!= '') {
            this.toggleDrawer.emit();
            //this.usersFilterComponent.fullnameFilter.setValue(val);
            this.usersFilterComponent.emailFilter.setValue(val);
            this.loadData(); 
          }
        });
        break;
     
      default: 
        this.displayedColumns =  this.displayedColumnsUsersList;
    }
  }

  loadLayout(){
    this.svcTableColsVisible.listByUserIDAndTable(this.currUser.userID, this.tableName).subscribe( 
      colonne => {
        if (colonne.length != 0) this.displayedColumns = colonne.map(a => a.tableCol!.colName)
        else this.svcTableCols.listByTable(this.tableName).subscribe( colonne => {
          this.displayedColumns = colonne.filter(colonna=> colonna.defaultShown == true).map(a => a.colName)
        })    
      });
  }

  loadData () {
    let obsUsers$: Observable<User[]>;

    //if (this.dove =="users-page") {
      obsUsers$= this.svcUsers.list();
      /*
      if(this.ckSoloAttivi){
        obsUsers$= this.svcUsers.list()
          .pipe(map(res=> res.filter((x) => x.ckAttivo == true)));
      }
      else {
        obsUsers$= this.svcUsers.list();
      }
      */

      const loadUsers$ =this._loadingService.showLoaderUntilCompleted(obsUsers$);
      loadUsers$.subscribe(  val =>  {
          //console.log("users-list loadData - val ", val);
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.sortCustom();
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
          this.getEmailAddresses();
        }
      );
    //}
  }

  getEmailAddresses() {
    //aggiorna this.emailAddresses che serve per poter copiare dalla toolbar gli indirizzi dei genitori
      const emailArray = this.matDataSource.filteredData
      .map(user => user.persona!.email).filter(email => !!email)
      .filter(emails => emails.length > 0); 
  
    this.emailAddresses = emailArray.join(', ');
  }

//#endregion

//#region ----- Filtri & Sort -------

sortCustom() {
  this.matDataSource.sortingDataAccessor = (item:any, property) => {
    switch(property) {
      case 'nome':                            return item.persona.nome;
      case 'cognome':                         return item.persona.cognome;
      case 'email':                           return item.persona.email;
      default: return item[property]
    }
  };
}

  applyFilter(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues);
    this.getEmailAddresses();
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);

      //let boolSx = String(data.fullName).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
      //          || String(data.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
      //          || String(data.badge).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      let foundTipoPersona = (String(data.persona.tipoPersonaID).indexOf(searchTerms.tipoPersona) !== -1);
      if (searchTerms.tipoPersona == null) foundTipoPersona = true;

      let boolSx = String(data.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;

      let boolDx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && String(data.email).toLowerCase().indexOf(searchTerms.email) !== -1;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop -------
  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width:      '520px',
      height:     '400px',
      data:       0
    };

    const dialogRef = this._dialog.open(UserEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => this.loadData());
  }

  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width:      '520px',
      height:     '400px',
      data:       id
    };

    const dialogRef = this._dialog.open(UserEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => this.loadData());
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click -------

  onRightClick(event: MouseEvent, element: User) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
  
//#endregion


//#region ----- Gestione Campo Checkbox -------

  selectedRow(element: User) {
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
    //funzione usata da coordinatore-dashboard
    return this.selection.selected;
  }

    //non so se serva questo metodo: genera un valore per l'aria-label...
  //forse serve per poi pescare i valori selezionati?
  
  checkboxLabel(row?: User): string {

    // if (!row) 
    //   return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    // else
    //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;

      return "";
  }
 

  //questo metodo ritorna un booleano che dice se sono selezionati tutti i record o no
  //per ora non lo utilizzo
  /*
  isAllSelected() {
    const numSelected = this.selection.selected.length;   //conta il numero di elementi selezionati
    const numRows = this.matDataSource.data.length;       //conta il numero di elementi del matDataSource
    return numSelected === numRows;                       //ritorna un booleano che dice se sono selezionati tutti i record o no
  }
  */
//#endregion

//#region ----- Altri metodi -------
  onResize(event: any) {
    this.displayedColumns = (event.target.innerWidth <= 800) ? 
      ["select", 
      "actionsColumn", 
      "nome", 
      "cognome", 
      "dtNascita", 
      "email"] 
      : 
      ["select", 
      "actionsColumn", 
      "nome", 
      "cognome", 
      "dtNascita", 
      "indirizzo", 
      "comune", 
      "cap", 
      "prov", 
      "email", 
      "telefono", 
      "ckAttivo"];
  }
//#endregion
}


