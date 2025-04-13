//#region ----- IMPORTS ------------------------

import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatSort }                              from '@angular/material/sort';
import { Observable }                           from 'rxjs';
import { MatTableDataSource}                    from '@angular/material/table';

//components


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { VotiInterrService }                    from '../voti-interr.service';

//models
import { TST_VotoInterr }                   from 'src/app/_models/TST_VotiInterr';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { VotoInterrEditComponent } from '../voto-interr-edit/voto-interr-edit.component';

//#endregion

@Component({
  selector:     'app-voti-interr-list',
  templateUrl:  './voti-interr-list.component.html',
  styleUrls:    ['../lezioni.css']
})

export class VotiInterrListComponent implements OnInit {

//#region ----- Variabili ----------------------

  showPageTitle:                                boolean = false;
  showTableRibbon:                              boolean = true;

  matDataSource = new MatTableDataSource<TST_VotoInterr>();
  
  displayedColumns!: string[];

  displayedColumnsLezione: string[] = [
    "actionsColumn",
    "nome", 
    "cognome", 
    "voto",
    "giudizio",
    "argomento"
  ];

  displayedColumnsDocentiDashboard: string[] = [
    "actionsColumn",
    "nome", 
    "cognome", 
    "dtCalendario",
    "h_Ini",
    "voto",
    "giudizio",
    "argomento"
  ];

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    nome: '',
    cognome: '',
    dtCalendario: '',
    h_Ini: '',
    voto: '',
    giudizio: '',
    argomento: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output ---------

  @Input() lezioneID!:                          number;
  @Input() docenteID!:                          number;
  @Input() classeSezioneAnnoID!:                number;

  @ViewChild(MatSort) sort!:                    MatSort;

//#endregion

//#region ----- Constructor --------------------

  constructor(
    private svcVotiInterr:                      VotiInterrService,
    private _loadingService:                    LoadingService,
    public _dialog:                             MatDialog 
  ) { 
  }

//#endregion
  
//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
      this.loadData();
      console.log ("voti-interr-list, ngOnChanges - this.docenteID", this.docenteID)
  }
  ngOnInit () {
    //this.loadData();
  }

  loadData () {

    //VotiInterrListComponent compare 
    //- come child di docenti-dashboard (app-voti-interr-list)
    //      --->In questo caso è disponibile this.lezioneID che infatti  arriva nella forma [lezione.ID] come Input
    //- come child di Lezione, sempre dentro a docenti (ma nell'orario docenti)
    //      --->In questo caso this.lezioneID è undefined
    //[VotiInterrListComponent e' inibito dentro L'orario generale e non compare nella coordinatore-dashboard]


    let obsVoti$: Observable<TST_VotoInterr[]>;

    //Il seguente check VORREBBE sostituire una variabile 'dove'!!!
    //Se sono nella vista lezione estraggo con listByLezione
    if (this.lezioneID != undefined) {
      this.showPageTitle = false;
      this.showTableRibbon = false;
      this.displayedColumns =  this.displayedColumnsLezione;

      obsVoti$= this.svcVotiInterr.listByLezione(this.lezioneID);
      const loadVoti$ =this._loadingService.showLoaderUntilCompleted(obsVoti$);

      loadVoti$.subscribe(
        res =>  {
          //console.log ("listByLezione res", res);
          this.matDataSource.data = res;
          this.sortCustom(); 
          this.matDataSource.sort = this.sort; 
          this.matDataSource.filterPredicate = this.filterPredicate();
        }
      );
    }
    //Se sono nella vista docenti-dashboard estraggo con listByClasseSezioneAnno 
    else {
      this.displayedColumns =  this.displayedColumnsDocentiDashboard;
        if (this.classeSezioneAnnoID && this.docenteID) {
          obsVoti$= this.svcVotiInterr.listByClasseSezioneAnnoAndDocente(this.classeSezioneAnnoID, this.docenteID);
          const loadVoti$ =this._loadingService.showLoaderUntilCompleted(obsVoti$);

          loadVoti$.subscribe(
            res =>  {
              //console.log ("listByClasseSezioneAnnoAndDocente res", res);
              this.matDataSource.data = res;
              this.sortCustom(); 
              this.matDataSource.sort = this.sort; 
              this.matDataSource.filterPredicate = this.filterPredicate();
            }
        );
      }

    }
  }
//#endregion

//#region ----- Filtri & Sort ------------------

  applyFilter(event: Event) {

    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.filtrosx = this.filterValue.toLowerCase();
    this.matDataSource.filter = JSON.stringify(this.filterValues)
  }

  filterPredicate(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: any): boolean {
      let searchTerms = JSON.parse(filter);
      
      let dArr = data.lezione.dtCalendario.split("-");
      const dtCalendarioddmmyyyy = dArr[2].substring(0,2)+ "/" +dArr[1]+"/"+dArr[0];

      let boolSx = String(data.alunno.persona.nome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(dtCalendarioddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                || String(data.lezione.h_Ini).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.voto).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.giudizio).toLowerCase().indexOf(searchTerms.filtrosx) !== -1
                || String(data.argomento).toLowerCase().indexOf(searchTerms.filtrosx) !== -1



      
      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      //let boolDx = String(data.alunno.persona.nome).toLowerCase().indexOf(searchTerms.nome) !== -1
                //&& String(data.alunno.persona.cognome).toLowerCase().indexOf(searchTerms.cognome) !== -1
                //&& String(dtCalendarioddmmyyyy).indexOf(searchTerms.dtCalendario) !== -1
                ;

      return boolSx ;//&& boolDx;
    }
    return filterFunction;
  }

  sortCustom() {
    this.matDataSource.sortingDataAccessor = (item:any, property) => {
      switch(property) {
        case 'nome':                            return item.alunno.persona.nome;
        case 'cognome':                         return item.alunno.persona.cognome;
        case 'dtCalendario':                    return item.lezione.dtCalendario;
        case 'h_Ini':                           return item.lezione.h_Ini;
        default:                                return item[property]
      }
    };
  }

//#endregion

  // changeVoto(element: TST_VotoInterr, voto: string ) {
    
  //   let votoN = parseInt(voto);
  //   if (votoN >10 ) votoN = 10
  //   if (votoN <0 )  votoN = 0
  //   element.voto = votoN;

  //   this.svcVotiInterr.put(element).subscribe();

  // }

  // changeGiudizio(element: TST_VotoInterr, giudizio: string) {
    
  //   element.giudizio = giudizio;

  //   this.svcVotiInterr.put(element).subscribe();

  // }

  // changeArgomento(element: TST_VotoInterr, argomento: string) {
    
  //   element.argomento = argomento;

  //   this.svcVotiInterr.put(element).subscribe();

  // }

//#region ----- Altri metodi -------------------

  addRecord() {
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: {
        lezioneID:                              this.lezioneID,
        votoInterr:                             null,
        classeSezioneAnnoID:                    this.classeSezioneAnnoID,
        docenteID:                              this.docenteID
      }
    };

    console.log("dialogConfig.data", dialogConfig.data);
    const dialogRef = this._dialog.open(VotoInterrEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }

  openDetail(element:TST_VotoInterr){


    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '400px',
      data: {
        lezioneID:                              this.lezioneID,
        votoInterr:                             element,
        classeSezioneAnnoID:                    this.classeSezioneAnnoID,
        docenteID:                              this.docenteID
      }
    };
    const dialogRef = this._dialog.open(VotoInterrEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      () => this.loadData()
    );
  }
//#endregion


}



