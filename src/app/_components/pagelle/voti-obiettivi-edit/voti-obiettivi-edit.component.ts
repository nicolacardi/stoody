//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable }                           from 'rxjs';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { concatMap, tap }                       from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { PagellaVotoObiettiviService }          from '../pagella-voto-obiettivi.service';
import { PagelleService }                       from '../pagelle.service';
import { PagellaVotiService }                   from '../pagella-voti.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { DialogDataVotiObiettivi }              from 'src/app/_models/DialogData';
import { DOC_PagellaVotoObiettivo }             from 'src/app/_models/DOC_PagellaVotoObiettivo';
import { MAT_LivelloObiettivo }                 from 'src/app/_models/MAT_LivelloObiettivo';
import { DOC_Pagella }                          from 'src/app/_models/DOC_Pagella';
import { DOC_PagellaVoto }                      from 'src/app/_models/DOC_PagellaVoto';

//#endregion
@Component({
  selector: 'app-voti-obiettivi-edit',
  templateUrl: './voti-obiettivi-edit.component.html',
  styleUrls: ['../pagelle.css']
})

export class VotiObiettiviEditComponent implements OnInit {
//#region ----- Variabili ----------------------

  matDataSource = new                   MatTableDataSource<DOC_PagellaVotoObiettivo>();
  obsTipiLivelloObiettivo$!:            Observable<MAT_LivelloObiettivo[]>;

  displayedColumns: string[] = [
    "descrizione", 
    "livello"
  ];

//#endregion 

//#region ----- Constructor --------------------

  constructor(@Inject(MAT_DIALOG_DATA) public data:       DialogDataVotiObiettivi,
              public _dialogRef: MatDialogRef             <VotiObiettiviEditComponent>,
              private svcPagella:                         PagelleService,
              private svcPagellaVoti:                     PagellaVotiService,
              private svcPagellaVotoObiettivi:            PagellaVotoObiettiviService,
              private _loadingService:                    LoadingService,
              private _snackBar:                          MatSnackBar ) { 

  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.obsTipiLivelloObiettivo$= this.svcPagellaVotoObiettivi.listTipiLivelliObiettivo();
    let obsPagellaVotoObiettivi$: Observable<DOC_PagellaVotoObiettivo[]>;
    obsPagellaVotoObiettivi$= this.svcPagellaVotoObiettivi.ListByPagellavotoMateriaCsa(this.data.pagellaVotoID, this.data.materiaID, this.data.classeSezioneAnnoID);

    let loadObiettivi$ =this._loadingService.showLoaderUntilCompleted(obsPagellaVotoObiettivi$)
    loadObiettivi$.subscribe(val =>  this.matDataSource.data = val );
  }

//#endregion

//#region ----- Altri metodi -------------------

  changeSelectObiettivo(element: DOC_PagellaVotoObiettivo, valLivello: number) {
    //console.log ("voti-obiettivi-edit - changeSelectObiettivo - element", element, "valLivello", valLivello);
    if (element.id !=0) {

      let formDataPagella: DOC_PagellaVotoObiettivo = {
        id:           element.id,
        pagellaVotoID:element.pagellaVotoID,
        obiettivoID:  element.obiettivoID,
        livelloObiettivoID:   valLivello,
      };
      
      this.svcPagellaVotoObiettivi.put(formDataPagella)
        .subscribe({
          next: res => { },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore nel salvataggio post', panelClass: ['red-snackbar']})
      });
    } 
    else {
      //manca l'id obiettivo, bisogna fare una post dell'obiettivo
      //prima però bisogna verificare se c'è l'IDPagella, se non c'è va creato
      //e bisogna verificare se c'è l'IDPagella Voto, se non c'è va creato
      const d = new Date();
      d.setSeconds(0,0);
      let dateNow = d.toISOString().split('.')[0];

      //preparo i tre oggetti per la Pagella, PagellaVoto e PagellaVotoObiettivo, con quello che so finora
      let formDataPagella: DOC_Pagella = {
        iscrizioneID:           this.data.iscrizioneID,
        periodo:                this.data.periodo,
        dtIns:                  dateNow,
        //dtDocumento:              this.data.dtDocumento
        
        //....
      };
              
      let formDataPagellaVoto: DOC_PagellaVoto = {
        materiaID:           this.data.materiaID,
        ckAmmesso:           false,
        ckFrequenza:         false,
        dtVoto:              dateNow,
        tipoGiudizioID:      1,
        n_assenze:           0,
        dtIns:               dateNow
        //....
      };
      
      let formDataPagellaVotoObiettivo: DOC_PagellaVotoObiettivo = {
        obiettivoID:         element.obiettivoID,
        livelloObiettivoID:  valLivello,
        dtIns:               dateNow
        //....
      };

      if (this.data.pagellaID ==-1) {
      //### caso nuova pagella --> insert Pagella

        this.svcPagella.post(formDataPagella).pipe (
          tap( x =>  {
            formDataPagellaVoto.pagellaID = x.id;
            this.data.pagellaID = x.id!;
          } ),
          concatMap( () => 
            this.svcPagellaVoti.post(formDataPagellaVoto)
          ),
          tap( x =>  {
            formDataPagellaVotoObiettivo.pagellaVotoID = x.id;
            this.data.pagellaVotoID = x.id;
          } ),
          concatMap( () =>
            this.svcPagellaVotoObiettivi.post(formDataPagellaVotoObiettivo)
          )
        )
        .subscribe()
      } 
      else {
        //### caso pagella esistente
        formDataPagellaVoto.pagellaID = this.data.pagellaID;

        if (this.data.pagellaVotoID == 0 ){
          //### caso pagella esistente, ma PagellaVoto nuovo --> insert PagellaVoto
          this.svcPagellaVoti.post(formDataPagellaVoto).pipe (
            tap( x =>  {
              formDataPagellaVotoObiettivo.pagellaVotoID = x.id 
              this.data.pagellaVotoID = x.id;
            } ),
            concatMap( 
              () => this.svcPagellaVotoObiettivi.post(formDataPagellaVotoObiettivo)
            )
          ).subscribe()
        } 
        else {
          //### caso pagella esistente, PagellaVoto esistente --> insert PagellaVotoObiettivo
          formDataPagellaVotoObiettivo.pagellaVotoID = this.data.pagellaVotoID;
          this.svcPagellaVotoObiettivi.post(formDataPagellaVotoObiettivo).subscribe()
        }
      }
    }

  }


//#endregion
}
