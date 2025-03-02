//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';

//components
import { VotiCompitoPageComponent }             from '../voti-compito-page/voti-compito-page.component';
import { CompitoEditComponent }                 from '../compito-edit/compito-edit.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { LezioniService }                       from '../lezioni.service';

//models
import { CAL_Lezione }                          from 'src/app/_models/CAL_Lezione';

//#endregion
@Component({
  selector:     'app-compiti-list',
  templateUrl:  './compiti-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class CompitiListComponent implements OnInit {

//#region ----- Variabili ----------------------
  matDataSource = new MatTableDataSource<CAL_Lezione>();
  
  displayedColumns: string[] = [ 
    "actionsColumn2",
    "actionsColumn", 
    "dtCalendario", 
    "h_Ini",
    "materia",
    "argomento"
  ];

  showPageTitle:                                boolean = false;
  showTableRibbon:                              boolean = true;

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    dtCalendario: '',
    materia: '',
    argomento: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(MatSort) sort!:                    MatSort;
  @Input() classeSezioneAnnoID!:                number;
  @Input() docenteID!:                          number;

//#endregion

//#region ----- Constructor --------------------
  constructor(private svcLezioni:                         LezioniService,
              private _loadingService:                    LoadingService,
              public _dialog:                             MatDialog ) {  

  }
//#endregion
  
//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    this.loadData();
  }

  ngOnInit () {

  }

  loadData () {
    let obsLezioni$: Observable<CAL_Lezione[]>;

    if (this.classeSezioneAnnoID != undefined) {
      obsLezioni$= this.svcLezioni.listCompiti(this.classeSezioneAnnoID, this.docenteID);
      const loadLezioni$ =this._loadingService.showLoaderUntilCompleted(obsLezioni$);

      loadLezioni$.subscribe(
        res =>  {
          this.matDataSource.data = res;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
        }
      );
    } 
  }
//#endregion

//#region ----- Filtri & Sort ------------------

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'materia':                         return item.materia.descrizione;
        case 'argomento':                       return item.argomentoCompito;
        default:                                return item[property]
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
      
    let ddmmyyyy!: string;
      if (data.dtCalendario){
        let dArrN = data.dtCalendario.split("-");
        ddmmyyyy = dArrN[2].substring(0,2)+ "/" +dArrN[1]+"/"+dArrN[0];
      } 
      else 
        ddmmyyyy = '';

      let boolSx = String(ddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.materia.descrizione.toLowerCase()).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.argomentoCompito.toLowerCase()).indexOf(searchTerms.filtrosx) !== -1;
                  
      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      // let boolDx = String(dtNotaddmmyyyy).indexOf(searchTerms.dtNota) !== -1
      //               && String(data.nota.toLowerCase()).indexOf(searchTerms.nota) !== -1
      //               && ((data.periodo == searchTerms.periodo) || searchTerms.periodo == '' || searchTerms.periodo == null)
      //               && String(data.persona.nome.toLowerCase() + ' ' + data.persona.cognome.toLowerCase()).indexOf(searchTerms.docente) !== -1
      //               && String(dtFirmaddmmyyyy).indexOf(searchTerms.dtFirma) !== -1
      //               && String(data.iscrizione.alunno.persona.nome.toLowerCase() + ' ' + data.iscrizione.alunno.persona.cognome.toLowerCase()).indexOf(searchTerms.alunno) !== -1 ;

      return boolSx;
      //return boolSx && boolDx;
    }
    return filterFunction;
  }
  openDetailCompito(element:CAL_Lezione){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: element
    };
    const dialogRef = this._dialog.open(CompitoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }

  openDetailVoti(element:CAL_Lezione){

    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '700px',
      data: element
    };
    const dialogRef = this._dialog.open(VotiCompitoPageComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }

  addRecord() {
    let lezione: any = {
      id: 0,
      docenteID: this.docenteID,
      classeSezioneAnnoID: this.classeSezioneAnnoID,
      dtCalendario: '2023-01-01'

    }
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: lezione
    };
    const dialogRef = this._dialog.open(CompitoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }

//#endregion

}



