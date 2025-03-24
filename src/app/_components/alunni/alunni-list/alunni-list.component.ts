//#region ----- IMPORTS ------------------------

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';
import { CdkDragDrop, moveItemInArray}          from '@angular/cdk/drag-drop';
import { Router }                               from '@angular/router';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { SelectionModel }                       from '@angular/cdk/collections';
import { map }                                  from 'rxjs/operators';

//components
import { AlunnoEditComponent }                  from '../alunno-edit/alunno-edit.component';
import { AlunniFilterComponent }                from '../alunni-filter/alunni-filter.component';
import { RettaEditComponent }                   from '../../pagamenti/retta-edit/retta-edit.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { AlunniService }                        from '../alunni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { NavigationService }                    from '../../utilities/navigation/navigation.service';
import { TableColsService }                     from '../../utilities/toolbar/tablecols.service';
import { TableColsVisibleService }              from '../../utilities/toolbar/tablecolsvisible.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { User }                                 from 'src/app/_user/Users';

//#endregion
@Component({
  selector:     'app-alunni-list',
  templateUrl:  './alunni-list.component.html',
  styleUrls:    ['../alunni.css'],
  standalone: false
})

export class AlunniListComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;

  matDataSource = new MatTableDataSource<ALU_Alunno>();

  tableName = "AlunniList";
  displayedColumns: string[] =  [];
  // displayedColumnsAlunniList: string[] = [
  //     "actionsColumn", 
  //     "nome", 
  //     "cognome", 
  //     "dtNascita", 
  //     "indirizzo", 
  //     "comune", 
  //     "cap", 
  //     "prov", 
  //     "telefono", 
  //     "email", 
  //     "ckAttivo"
  // ];

  displayedColumnsGenitoreEditFamiglia: string[] = [
    "actionsColumn", 
    "nome", 
    "cognome", 
    "dtNascita", 
    "telefono", 
    "email", 
    "removeFromFam"
  ];

  displayedColumnsGenitoreEditList: string[] = [
    "actionsColumn", 
    "nome", 
    "cognome", 
    "dtNascita", 
    "email", 
    "telefono", 
    "addToFam"
  ];

  rptTitle = 'Lista Alunni';
  rptFileName = 'ListaAlunni';
  rptFieldsToKeep  = [
    "persona.nome", 
    "persona.cognome", 
    "persona.dtNascita", 
    "persona.indirizzo", 
    "persona.comune", 
    "persona.cap", 
    "persona.prov", 
    "persona.telefono",
    "persona.email", 
     ];

  rptColumnsNames  = [
    "nome", 
    "cognome", 
    "nato il", 
    "indirizzo", 
    "comune", 
    "cap", 
    "prov", 
    "telefono" ,
    "email"
    ];

  selection = new SelectionModel<ALU_Alunno>(true, []);   //rappresenta la selezione delle checkbox

  public passedGenitore!:                       string;
  public page!:                                 string;
  emailAddresses!:                              string;

  menuTopLeftPosition =  {x: '0', y: '0'} 
  //idAlunniChecked:              number[] = [];
  
  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;
  showFilter:                                   boolean = true;
  public ckSoloAttivi :                         boolean = true;

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
    nomeCognomeGenitore: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() alunniFilterComponent!:              AlunniFilterComponent;
  @Input('context') context! :                  string;
  @Input('genitoreID') genitoreID! :            number;

  @Output('openDrawer') toggleDrawer = new EventEmitter<number>();
  @Output('addToFamily') addToFamily = new EventEmitter<ALU_Alunno>();
  @Output('removeFromFamily') removeFromFamily = new EventEmitter<ALU_Alunno>();

//#endregion

//#region ----- Constructor --------------------

  constructor(private svcAlunni:                AlunniService,
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
    //mentre CoordinatoreDashBoard ripassa per ngOnChanges quando classeSezioneAnnoID gli arriva (è una @Input)
    //alunniList non ci ripassa.
    //il problema è che this.page potrebbe essere ancora undefined 
    //(perchè poi? visto che viene settato sia da alunniPage che da classiDahsboard su ngOnInit come prima cosa?)

    //ngOnChanges serve perchè quando listAlunni è child di CoordinatoreDashBoard gli viene passato il valore di classeSezioneAnnoID
    // e devo "sentire" in questo modo che deve refreshare


      //lanciamo loadData SOLO una volta che sia arrivata la this.page.
      //this.page non arriva, nel caso in cui page = CoordinatoreDashBoard
      //fintanto che la @Input classeSezioneAnnoID non è stata settata
      //se non mettessimo questa if la loadData partirebbe una volta con this.page = undefined
      //e POI una seconda volta quando classeSezioneAnnoID è stato settato e quindi anche this.page: non andrebbe bene

      if (this.context != ''){
        this.loadData();
        this.toggleChecks = false;
        this.resetSelections();
      }
    //}
  }
  
  ngOnInit () {

    switch(this.context) {
      case 'alunni-page': 
        this.loadLayout();
        //this.displayedColumns =  this.displayedColumnsAlunniList;
        this._navigationService.getGenitore().subscribe(
          res=>{
            if (res!= '') {
              this.passedGenitore = res;
              this.toggleDrawer.emit();
              this.alunniFilterComponent.nomeCognomeGenitoreFilter.setValue(res);
              this.loadData(); 
            }
          }
        );
      break;
      case 'genitore-edit-famiglia':
        this.displayedColumns = this.displayedColumnsGenitoreEditFamiglia;
        this.showPageTitle = false;
        this.showTableRibbon = false;
        this.showFilter = false;
      break;
      case 'genitore-edit-list':
        this.displayedColumns = this.displayedColumnsGenitoreEditList;
        this.showPageTitle = false;
        this.showTableRibbon = false;

      break;
      // default: 
      //   this.displayedColumns =  this.displayedColumnsAlunniList;
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
    let obsAlunni$: Observable<ALU_Alunno[]>;
    
    if (this.context =="alunni-page") {
      if(this.ckSoloAttivi){
        obsAlunni$= this.svcAlunni.listWithParents()
          .pipe(map(
            res=> res.filter((x) => x.persona.ckAttivo == true))
          );
      }
      else obsAlunni$= this.svcAlunni.listWithParents();

      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);

      loadAlunni$.subscribe(
        res =>   {
          this.matDataSource.data = res;
          this.matDataSource.paginator = this.paginator;
          this.sortCustom();
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
          this.getEmailAddresses();
        }
      );
    }

    if (this.context == "genitore-edit-list") {
      obsAlunni$= this.svcAlunni.listWithParents();
      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);
      loadAlunni$.subscribe(
        val =>  {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.sortCustom();
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
        }
      );
    }

    if (this.context == "genitore-edit-famiglia") {
      obsAlunni$= this.svcAlunni.listByGenitore(this.genitoreID);
      const loadAlunni$ =this._loadingService.showLoaderUntilCompleted(obsAlunni$);
      loadAlunni$.subscribe(
        val => {
          this.matDataSource.data = val;
          this.matDataSource.paginator = this.paginator;
          this.sortCustom();
          this.matDataSource.sort = this.sort; 
        }
      );
    }
  }

  getEmailAddresses() {
    //aggiorna this.emailAddresses che serve per poter copiare dalla toolbar gli indirizzi dei genitori
      const emailArray = this.matDataSource.filteredData
        .map(alunno => alunno._Genitori!.map(genitore => genitore.genitore!.persona.email).filter(email => !!email))
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
    //if (this.context == "alunni-page") this.alunniFilterComponent.resetAllInputs();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
    this.getEmailAddresses(); // Aggiorna gli indirizzi email dopo aver applicato il filtro
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      let foundGenitore : boolean = false;
      
      //se il campo nomeCognomeGenitore è compilato deve restituire True se trova  mentre deve restituire false se non ci sono i genitori
      //se il campo non è compilato deve sempre restituire True

      // if (Object.values(searchTerms).every(x => x === null || x === '')) 
      if (searchTerms.nomeCognomeGenitore.length > 0){
        if (data._Genitori.length == 0) //restituisce false se , avendo digitato qualcosa, i Genitori non ci sono proprio per l'alunno della riga
          foundGenitore = false;
        else {
          data._Genitori?.forEach(
            (val: { genitore: {persona: { nome: any; cognome: any}} })=>  {   
              const foundCognomeNome = foundGenitore || String(val.genitore.persona.cognome+" "+val.genitore.persona.nome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1;
              const foundNomeCognome = foundGenitore || String(val.genitore.persona.nome+" "+val.genitore.persona.cognome).toLowerCase().indexOf(searchTerms.nomeCognomeGenitore) !== -1; 
              foundGenitore =  foundCognomeNome || foundNomeCognome;  //attenzione!!! _Genitori non sono i genitori ma ALU_AlunnoGenitore! ecco perchè val.genitore
          })
        }
      } 
      else 
        foundGenitore = true;

      let dArr = data.persona.dtNascita.split("-");
      const dtNascitaddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];

      let boolSx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(dtNascitaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.indirizzo).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.comune).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.prov).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.telefono).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.email).toLowerCase().indexOf(searchTerms.filtrosx) !== -1;
      
      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                && String(data.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                && String(dtNascitaddmmyyyy).indexOf(searchTerms.dtNascita) !== -1
                && String(data.persona.indirizzo).toLowerCase().indexOf(searchTerms.indirizzo) !== -1
                && String(data.persona.comune).toLowerCase().indexOf(searchTerms.comune) !== -1
                && String(data.persona.prov).toLowerCase().indexOf(searchTerms.prov) !== -1
                && String(data.persona.telefono).toLowerCase().indexOf(searchTerms.telefono) !== -1
                && String(data.persona.email).toLowerCase().indexOf(searchTerms.email) !== -1
                && foundGenitore;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop ------------------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '750px',
      data: 0
    };
    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  openDetail(id:any){

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '700px',
      data: id
    };
    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData()
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click --------------------
  onRightClick(event: MouseEvent, element: ALU_Alunno) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }

  openGenitori(item: ALU_Alunno) {
    this._navigationService.passAlunno(item.persona.nome+" "+item.persona.cognome);
    this.router.navigateByUrl("/genitori");
  }

  openPagamenti(alunnoID: number){
    //TODO   no! non anno =1 !
    let annoID = 1; //TODO questa sarà un default da mettere nei parametri
    const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '850px',
        height: '620px',
        data: {
          alunnoID: alunnoID,
          annoID: annoID
        }
    };

    const dialogRef = this._dialog.open(RettaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

//#endregion

//#region ----- Emit per alunno-edit -----------
  addToFamilyEmit(item: ALU_Alunno) {
    this.addToFamily.emit(item);
  }

  removeFromFamilyEmit(item: ALU_Alunno) {
    this.removeFromFamily.emit(item);
  }

//#endregion

//#region ----- Gestione Campo Checkbox --------
  selectedRow(element: ALU_Alunno) {
    this.selection.toggle(element);
  }

  masterToggle() {
    this.toggleChecks = !this.toggleChecks;

    if (this.toggleChecks) {
      const visibleData = this.matDataSource.filteredData || this.matDataSource.data;
      this.selection.select(...visibleData);
    } else {
      this.resetSelections();}
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
  checkboxLabel(row?: ALU_Alunno): string {
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

//#region ----- Altri metodi -------------------
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

//#region *********************** LE PROMISES: TENERE ***************************

//******************primo modo di lavorare in maniera asincrona: setTimeOut e setInterval
// test () {
//   let timeoutId = setTimeout(this.myfunction, 2000, 'Nicola');

//   setTimeout (function run() {
//     console.log('Hello')
//     setTimeout(run, 100)
//   }, 100)
//   clearTimeout(timeoutId);
// }

//******************secondo modo: le callbacks

// greet (name: string) {
//   console.log (`Hello $(name)`)
// }

// higherOrderFunction(callback: any) {
//   const name = "Nicola"
//   callback(name)
// }

// myfunction () {
//   this.higherOrderFunction (this.greet);
// }

//*******************il callback hell


// fetchCurrentUser('api/user', function(result: any) {
//   fetchFollowersByUserId(`api/followers/${result.userId}`, function (result:any) {
//     fetchFollowerInterest(`api/followers/${result.followerId}`, function (result:any) {
//       fetchInterestTags(`api/followers/${result.InterestId}`, function (result:any) {
//         fetchTagDescription(`api/followers/${result.tagId}`, function (result:any) {
//         })
//       })
//     })
//   })
// });

//#region   ### vecchie  promise

// promises () {
//   const promise = new Promise<void>((resolve, reject) => {
//     setTimeout (() => { resolve()  }, 5000)
//   })

//   const onFulfillment = () => {
//     console.log ("ho comprato le patatine prepara la tavola");
//   }

//   const onRejection = () => {
//     console.log ("non ho trovato le patatine butta la pasta");
//   }


//   promise.then(onFulfillment)
//   promise.catch(onRejection)
// }


//**********************ecco come si evita, dunque, il callback hel grazie alle promises
// const promise = fetchCurrentUser('api/user');


// promise.then(result=> fetchFollowerByUserId('api/followers/${result.userId}'))
//   .then(result => fetchFollowerInterest('api/followers/${result.followerId}'))
//   .then(result => fetchInterestTags('api/followers/${result.InterestId}'))
//   .then(result => fetchTagDescription('api/followers/${result.tagId}'))
//   .then(result => console.log('display the data', result))

//   }
// })


//*********************promise.all, promise.allSettled, promise.race */


// promiseall() {
//   const promise1 = Promise.resolve(3);
//   const promise2 = 42;
//   const promise3 = new Promise ((resolve, reject) => {
//     setTimeout(resolve, 100, 'foo');

//   })
//   Promise.all([promise1, promise2, promise3]).then ((values) => {
//     console.log (values);
//   })

// }

//************************async await 

//le promise sono state ulteriormente perfezionate con async await
// async greetasync() {

//   let promise = new Promise((resolve, reject) => {
//     setTimeout (() => resolve("Hello"), 1000)
//   })
//   let result = await promise;

//   console.log(result)
// }


//con async await invece di

// promise.then(result=> fetchFollowerByUserId('api/followers/${result.userId}'))
//   .then(result => fetchFollowerInterest('api/followers/${result.followerId}'))
//   .then(result => fetchInterestTags('api/followers/${result.InterestId}'))
//   .then(result => fetchTagDescription('api/followers/${result.tagId}'))
//   .then(result => console.log('display the data', result))


//potremo scrivere come se fossero chiamate sincrone:

// const user = await fetchCurrentUser('api/user')
// const followers = await fetchFollowerByUserId(`api/followers/${result.userId}`)
// const interests = await fetchFollowerInterest(`api/followers/${result.followerId}`)
// const tags = await fetchInterestTags(`api/followers/${result.InterestId}`)
// const description = await fetchTagDescription(`api/followers/${result.tagId}`)
//  console.log ('display the data', result)

//*******************sequentialStart concurrentStart parallel */
//non ci ho capito molto

// resolveHelloN() {
//   return new Promise (resolve => {
//     setTimeout (() => resolve("Hello Nicola"), 2000)
//   })
// }

// resolveHelloA() {
//   return new Promise (resolve => {
//     setTimeout (() => resolve("Hello Andrea"), 3000)
//   })
// }

// async sequentialStart() {

//   const helloN = await this.resolveHelloA()
//   console.log (helloN)

//   const helloA = await this.resolveHelloN()
//   console.log (helloA)

// }

// async concurrentStart() {

//   const helloN = this.resolveHelloA()
//   const helloA = this.resolveHelloN()
//   console.log (await helloN)
//   console.log (await helloA)


// }

// async parallel() {
//   Promise.all([
//     (async() => console.log (await this.resolveHelloA()))(),
//     (async() => console.log (await this.resolveHelloN()))(),
//   ])
//   const helloN = this.resolveHelloA()
//   const helloA = this.resolveHelloN()
//   console.log (await helloN)
//   console.log (await helloA)
// }
//#endregion



  //IMPORTANTE:
  //const myget = this.svcRette.get(410).toPromise();
  //myget.then( val => console.log (val));
  //console.log ("ciao");
  // // ciao
  // // record

    //IMPORTANTE:
  //const myget = this.svcRette.get(410).toPromise();
  //await myget.then( val => console.log (val));
  //console.log ("ciao");
  // // record
  // // ciao

  // //ecco come fare un foreach con delle chiamate asincrone MA con la sicurezza che ho finito arriva DOPO che le chiamate asincrone sono risolte
  // async testForEachAsync () {
  //   let arr =[410,411,412]
  //   const promiseall = await Promise.all(arr.map( async id=> {
  //       const myget = this.svcRette.get(id).toPromise();
  //       await myget.then (val => console.log(val));
  //       // await myget.then( val => console.log (val));
      
  //   }));
  
  //   console.log ("ho finito");
  // }

  
//#endregion
}