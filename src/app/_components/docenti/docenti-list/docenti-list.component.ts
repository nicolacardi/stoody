//#region ----- IMPORTS ------------------------

import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatMenuTrigger }                       from '@angular/material/menu';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable, firstValueFrom, iif }      from 'rxjs';
import { SelectionModel }                       from '@angular/cdk/collections';
import { tap }                                  from 'rxjs/operators';

//components
import { DocenteEditComponent }                 from '../docente-edit/docente-edit.component';
import { DocentiFilterComponent }               from '../docenti-filter/docenti-filter.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { DocentiService }                       from '../docenti.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { TableColsService }                     from '../../utilities/toolbar/tablecols.service';
import { TableColsVisibleService }              from '../../utilities/toolbar/tablecolsvisible.service';

//models
import { PER_Docente }                          from 'src/app/_models/PER_Docente';
import { User }                                 from 'src/app/_user/Users';

//#endregion

@Component({
  selector: 'app-docenti-list',
  templateUrl: './docenti-list.component.html',
  styleUrl: '../docenti.css'
})

export class DocentiListComponent  implements OnInit {


//#region ----- Variabili ----------------------
  currUser!:                                    User;

  matDataSource = new MatTableDataSource<PER_Docente>();

  tableName = "DocentiList";
  displayedColumns: string[] =  [];
  //La lista delle colonne viene estratta dalla loadLayout: se viene trovato un layout per l'utente si usa quello altrimenti si usa quello di default

  filterValue = '';       //Filtro semplice

  filterValues = {
    personaID: '',
    tipoSocioID: '',
    nome: '',
    cognome: '',
    dataRichiestaDal: '',
    dataRichiestaAl: '',
    dataAccettazioneDal: '',
    dataAccettazioneAl: '',
    ckAttivo: '', //non è tanto un campo del db: è attivo quando non c'è una disiscrizione
    filtrosx: ''
  };
  
  rptTitle = 'Docenti';
  rptFileName = 'ListaDocenti';

  rptFieldsToKeep  = [
    "persona.nome",
    "persona.cognome",
    "tipoSocio.descrizione",
    "dtRichiesta",
    "dtAccettazione",
    "quota",
    "dtDisiscrizione",
    "dtRestQuota",
    "ckRinunciaQuota"
];

  rptColumnsNames  = [
    "nome",
    "cognome",
    "tipo",
    "Data Richiesta",
    "Data Accettazione",
    "quota",
    "Data Disiscrizione",
    "Data Rest.Quota",
    "Rinuncia Quota"
];

  selection = new SelectionModel<PER_Docente>(true, []);   //rappresenta la selezione delle checkbox

  menuTopLeftPosition =  {x: '0', y: '0'} 

  toggleChecks:                                 boolean = false;
  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;
  public ckSoloAttivi :                         boolean = true;
  emailAddresses!:                              string;


//#endregion

//#region ----- ViewChild Input Output -------

  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;
  @ViewChild("filterInput") filterInput!:       ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger!: MatMenuTrigger; 

  @Input() docentiFilterComponent!:             DocentiFilterComponent;
  @Input('dove') dove! :                        string;

//#endregion

//#region ----- Constructor --------------------

  constructor(private svcDocenti:                         DocentiService,
              private _loadingService:                    LoadingService,
              public _dialog:                             MatDialog,
              private svcTableCols:                       TableColsService,
              private svcTableColsVisible:                TableColsVisibleService)   { 

    this.currUser = Utility.getCurrentUser();
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  async ngOnInit() {
    //this.displayedColumns =  this.displayedColumnsSociList;
    await firstValueFrom(this.loadLayout()); //va eseguita in maniera SINCRONA altrimenti le colonne arrivano troppo tardi e intanto la loadData ha proceduto
    this.loadData(); 
  }

  loadLayout():   Observable<any> {
    return this.svcTableColsVisible.listByUserIDAndTable(this.currUser.userID, this.tableName)
    .pipe(
      tap(colonne=> {
        if (colonne.length != 0) this.displayedColumns = colonne.map(a => a.tableCol!.colName)
        else this.svcTableCols.listByTable(this.tableName).subscribe( colonne => {
          this.displayedColumns = colonne.filter(colonna=> colonna.defaultShown == true).map(a => a.colName)
        })    
      })
    );
  }

  loadData () {

    let obsDocenti$: Observable<PER_Docente[]>;
    
    obsDocenti$= this.svcDocenti.list(false);
 
    const loadDocenti$ =this._loadingService.showLoaderUntilCompleted(obsDocenti$);
    loadDocenti$.subscribe( val => {
        this.matDataSource.data = val;
        this.matDataSource.paginator = this.paginator;
        this.matDataSource.sort = this.sort; 
        this.matDataSource.filterPredicate = this.filterPredicate();
        //this.getEmailAddresses();
      }
    );
  }

  getEmailAddresses() {
    //aggiorna this.emailAddresses che serve per poter copiare dalla toolbar gli indirizzi
      const emailArray = this.matDataSource.filteredData
        .map(docente => docente.persona!.email).filter(email => !!email)
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

      //let foundTipoSocio = (String(data.tipoSocioID).indexOf(searchTerms.tipoSocioID) !== -1); //per ricerca non numerica...
      let foundTipoSocio = data.tipoSocioID==searchTerms.tipoSocioID;
      if (searchTerms.tipoSocioID == null || searchTerms.tipoSocioID == '') foundTipoSocio = true;

      let ckAttivo = (searchTerms.ckAttivo && data.dtDisiscrizione == null) || !searchTerms.ckAttivo ;
      let cfrDateRichieste = cfrDate(searchTerms.dataRichiestaDal, searchTerms.dataRichiestaAl, data.dtRichiesta);
      if ((searchTerms.dataRichiestaDal == null || searchTerms.dataRichiestaDal == '')&& (searchTerms.dataRichiestaAl == null || searchTerms.dataRichiestaAl == ''))cfrDateRichieste = true;
      let cfrDateAccettazione = cfrDate(searchTerms.dataAccettazioneDal, searchTerms.dataAccettazioneAl, data.dtAccettazione);
      if ((searchTerms.dataAccettazioneDal == null || searchTerms.dataAccettazioneDal == '')&& (searchTerms.dataAccettazioneAl == null || searchTerms.dataAccettazioneAl == ''))cfrDateAccettazione = true;

      let dArr = data.dtRichiesta.split("-");
      const dtRichiestaddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];

      let boolSx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(dtRichiestaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                || String(data.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.tipoSocio.descrizione).toLowerCase().indexOf(searchTerms.filtrosx) !== -1


      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(data.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                    && String(data.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                    && foundTipoSocio
                    && cfrDateRichieste
                    && cfrDateAccettazione
                    && ckAttivo;

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
      height: '700px',
      data: 0
    };

    const dialogRef = this._dialog.open(DocenteEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  openDetail(id:any){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '550px',
      data: id
    };

    

    const dialogRef = this._dialog.open(DocenteEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

//#region ----- Right Click --------------------

  onRightClick(event: MouseEvent, element: PER_Docente) { 
    event.preventDefault(); 
    this.menuTopLeftPosition.x = event.clientX + 'px'; 
    this.menuTopLeftPosition.y = event.clientY + 'px'; 
    this.matMenuTrigger.menuData = {item: element}   
    this.matMenuTrigger.openMenu(); 
  }
//#endregion
  
}

//la seguente funzione riceve in input una data (dt) una data Dal (dtDal) e una data Al (dtAl) e restituisce un booleano che dice
//se la data è compresa tra le due. Si usa per i contesti in cui abbiamo due campi (appunto data dal /data al)...
function   cfrDate(dtDal: string, dtAl: string, dt: string): boolean {
  let cfrDataDal = true;
  let cfrDataAl = true;
  let cfrDate = true;
  if (dtDal != '') {cfrDataDal = (dt > dtDal)}
  if (dtAl != '') {cfrDataAl = (dt < dtAl)}
  cfrDate = cfrDataDal && cfrDataAl;
  return cfrDate;
}

