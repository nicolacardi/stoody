//#region ----- IMPORTS ------------------------

import { CdkDragDrop, moveItemInArray }         from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewChild }  from '@angular/core';
import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatPaginator }                         from '@angular/material/paginator';
import { MatSort }                              from '@angular/material/sort';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { concatMap }                            from 'rxjs/operators';

//components
import { NotaEditComponent }                    from '../nota-edit/nota-edit.component';
import { NoteFilterComponent }                  from '../note-filter/note-filter.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { NoteService }                          from '../note.service';
import { DocentiService }                       from '../../docenti/docenti.service';

//models
import { DOC_Nota }                             from 'src/app/_models/DOC_Nota';

import { PER_Docente }                          from 'src/app/_models/PER_Docente';
import { NoteIscrizioniService } from '../noteiscrizioni.service';

//#endregion

@Component({
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  styleUrls: ['../note.css']
})
export class NoteListComponent implements OnInit {
  
//#region ----- Variabili ----------------------

  matDataSource =                               new MatTableDataSource<DOC_Nota>();

  displayedColumns:                             string[] =  [];

  displayedColumnsNotePage:                     string[] =  [
    "actionsColumn", 
    "docente",
    "personaAlunno",
    "dtNota",
    "periodo",
    "nota"
  ];

  displayedColumnsAlunnoEdit:                   string[] =  [
    "actionsColumn", 
    "docente",
    "dtNota",
    "periodo",
    "nota"
  ];

  rptTitle = 'Lista Note';
  rptFileName = 'ListaNote';
  rptFieldsToKeep  = [
    "dtNota"
     ];

  rptColumnsNames  = [
    "data Nota"
    ];

  showPageTitle:                                boolean = true;
  showTableRibbon:                              boolean = true;

  filterValue = '';       //Filtro semplice
  //filterValues contiene l'elenco dei filtri avanzati da applicare 
  filterValues = {
    dtNota: '',
    nota: '',
    docente: '',
    alunno: '',
    periodo: '',
    ckFirmato: '',
    dtFirma: '',
    filtrosx: ''
  };
//#endregion

//#region ----- ViewChild Input Output --------
  @Input('classeSezioneAnnoID') classeSezioneAnnoID!: number;
  @Input('dove') dove!:                         string;

  @Input('alunnoID') alunnoID!:                 number;
  @Input('docenteID') docenteID!:               number;

  @Input() noteFilterComponent!:                NoteFilterComponent;

  @ViewChild(MatPaginator) paginator!:          MatPaginator;
  @ViewChild(MatSort) sort!:                    MatSort;

//#endregion  

//#region ----- Constructor --------------------

  constructor(
    private svcNote:                            NoteService,
    private svcNoteIscrizioni:                  NoteIscrizioniService,

    private svcDocenti:                         DocentiService,
    private _loadingService:                    LoadingService,
    public _dialog:                             MatDialog ) {

  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    
    this.loadData();

  }

  ngOnInit(): void {
  }

  loadData() {

    switch(this.dove) {

      case 'coordinatore-dashboard':
        this.displayedColumns = this.displayedColumnsNotePage;
        this.showPageTitle = false;
        this.showTableRibbon = true;

        if (this.classeSezioneAnnoID) {
          let obsNote$: Observable<DOC_Nota[]>;
          obsNote$= this.svcNote.listByClasseSezioneAnno(this.classeSezioneAnnoID);
          let loadNote$ =this._loadingService.showLoaderUntilCompleted(obsNote$);
    
          loadNote$.subscribe( 
            val =>   {
              this.matDataSource.data = val;
              this.matDataSource.paginator = this.paginator;
              this.matDataSource.sort = this.sort; 
              this.matDataSource.filterPredicate = this.filterPredicate();
            }
          );
        }
        break;

      case 'docenti-dashboard':
        this.displayedColumns = this.displayedColumnsNotePage;
        this.showPageTitle = false;
        this.showTableRibbon = true;
        
        if (this.classeSezioneAnnoID && this.docenteID != 0) {
          //Devo pescare il personaID del docenteID e passarlo alla listBYClasseSezionaAnnoIDAndDocente
          this.svcDocenti.get(this.docenteID)
          .pipe(
            concatMap((res: PER_Docente) => this._loadingService.showLoaderUntilCompleted(this.svcNote.listByClasseSezioneAnnoAndDocente(this.classeSezioneAnnoID, res.personaID))
          )).subscribe(

            (val: DOC_Nota[]) =>   {

              //console.log("notelist - PARTE DA RIPRISTINARE quando _NotaIscrizioni torna dal WS")

              // TODO ********
              // NON CANCELLARE MA ANZI RIPRSTINARE QUANDO IL SERVICE TORNERA' A MOSTRARE _NotaIscrizioni (attualmente non lo fa e questo blocca il seguito)
              // val.forEach(
              //   nota=> {
              //     let strNomiAlunni = "";
              //     nota._NotaIscrizioni.forEach( 
              //       (notaIscrizione: DOC_NotaIscrizione) => strNomiAlunni= strNomiAlunni + ' - '+ notaIscrizione.iscrizione.alunno.persona.nome + ' ' + notaIscrizione.iscrizione.alunno.persona.cognome
              //     )
              //     console.log("strNomiAlunni", strNomiAlunni);
              //     nota.nomiAlunni = strNomiAlunni.slice(3);
              //   }
              // );
              
              this.matDataSource.data = val;
              this.matDataSource.paginator = this.paginator;
              this.matDataSource.sort = this.sort; 
              this.matDataSource.filterPredicate = this.filterPredicate();
            }
          );
        }
        break;

      case 'alunno-edit':
        this.displayedColumns = this.displayedColumnsAlunnoEdit;
        this.showPageTitle = false;
        this.showTableRibbon = false;

        if (this.alunnoID) {
          let obsNote$: Observable<DOC_Nota[]>;
          obsNote$= this.svcNote.listByAlunno(this.alunnoID);
          let loadNote$ =this._loadingService.showLoaderUntilCompleted(obsNote$);
    
          loadNote$.subscribe( 
            val =>   {
              this.matDataSource.data = val;
              this.matDataSource.paginator = this.paginator;
              this.matDataSource.sort = this.sort; 
              this.matDataSource.filterPredicate = this.filterPredicate();
            }
          );
        }
        
        break;

      default: this.displayedColumns = this.displayedColumnsNotePage;
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

      let foundCognomeNome = false;
      foundCognomeNome = String(data.personaAlunno.nome+ " "+ data.personaAlunno.cognome).toLowerCase().indexOf(searchTerms.alunno)!== -1;
      
      {}
      let dtNotaddmmyyyy!: string;
      if (data.dtNota){
        let dArrN = data.dtNota.split("-");
         dtNotaddmmyyyy = dArrN[2].substring(0,2)+ "/" +dArrN[1]+"/"+dArrN[0];
      } 
      else 
         dtNotaddmmyyyy = '';

      let dtFirmaddmmyyyy!: string;
      if (data.dtFirma){
        let dArrF = data.dtFirma.split("-");
         dtFirmaddmmyyyy = dArrF[2].substring(0,2)+ "/" +dArrF[1]+"/"+dArrF[0];
      }
      else 
         dtFirmaddmmyyyy = '';

      let boolSx = String(dtNotaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.nota).indexOf(searchTerms.filtrosx) !== -1
                  || (data.periodo == searchTerms.periodo)
                  || String(data.persona.nome.toLowerCase() + ' ' + data.persona.cognome.toLowerCase()).indexOf(searchTerms.filtrosx) !== -1
                  || String(data.personaAlunno.nome.toLowerCase() + ' ' + data.personaAlunno.cognome.toLowerCase()).indexOf(searchTerms.filtrosx) !== -1
                  || String(dtFirmaddmmyyyy).indexOf(searchTerms.filtrosx) !== -1;

      // i singoli argomenti dell'&& che segue sono ciascuno del tipo: "trovato valore oppure vuoto"
      let boolDx = String(dtNotaddmmyyyy).indexOf(searchTerms.dtNota) !== -1
                    && String(data.nota.toLowerCase()).indexOf(searchTerms.nota) !== -1
                    && ((data.periodo == searchTerms.periodo) || searchTerms.periodo == '' || searchTerms.periodo == null)
                    && String(data.persona.nome.toLowerCase() + ' ' + data.persona.cognome.toLowerCase()).indexOf(searchTerms.docente) !== -1
                    && String(dtFirmaddmmyyyy).indexOf(searchTerms.dtFirma) !== -1
                    && foundCognomeNome ;

      return boolSx && boolDx;
    }
    return filterFunction;
  }

//#endregion

//#region ----- Add Edit Drop ------------------

  addRecord(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '550px',
      data: {
        iscrizioni:                             [],
        notaID:                                 0,
        personaID:                              0,
        classeSezioneAnnoID:                    this.classeSezioneAnnoID
      }
    };
    const dialogRef = this._dialog.open(NotaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
      res => this.loadData()
    );
  }

  openDetail(element: DOC_Nota){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '500px',
      height: '550px',
      data: {
        iscrizioni:                             element._NotaIscrizioni,
        notaID:                                 element.id,
        personaID:                              element.personaID,
        classeSezioneAnnoID:                    this.classeSezioneAnnoID
      }
    };
    const dialogRef = this._dialog.open(NotaEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( 
      res=> this.loadData()
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
  }
//#endregion

}
