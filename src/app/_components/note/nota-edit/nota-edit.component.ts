//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { concatMap, tap }                       from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { NoteService }                          from '../note.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { UserService }                          from 'src/app/_user/user.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { GenitoriService }                      from '../../genitori/genitori.service';
import { EventiService }                      from '../../eventi/eventi.service';
import { EventiPersoneService }               from '../../eventi/eventi-persone.service';
import { NoteIscrizioniService }                from '../noteiscrizioni.service';

//models
import { DOC_Nota }                             from 'src/app/_models/DOC_Nota';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { CAL_Evento, CAL_EventoPersone }    from 'src/app/_models/CAL_Evento';
import { DOC_NotaIscrizione }                   from 'src/app/_models/DOC_NotaIscrizione';
import { DialogDataNota }                       from 'src/app/_models/DialogData';

//#endregion
@Component({
  selector: 'app-nota-edit',
  templateUrl: './nota-edit.component.html',
  styleUrls: ['../note.css']
})

export class NotaEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  obsNota$!:                                    Observable<DOC_Nota>;
  obsIscrizioni$!:                              Observable<CLS_Iscrizione[]>;
  disabilitato:                                 boolean = false;

  form! :                                       UntypedFormGroup;
  personaNomeCognome!:                          string;
  personaID!:                                   number;
  iscrizioneID!:                                number;
  alunnoNomeCognome!:                           string;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  breakpoint!:                                  number;
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:                          MatDialogRef<NotaEditComponent>,
              private svcUser:                            UserService,
              private svcNote:                            NoteService,
              private svcIscrizioni:                      IscrizioniService,
              private svcNoteIscrizioni:                  NoteIscrizioniService,
              private svcEventi:                        EventiService,
              private svcEventiPersone:                 EventiPersoneService,
              private svcGenitori:                        GenitoriService,

              @Inject(MAT_DIALOG_DATA) public data:       DialogDataNota,
              private fb:                                 UntypedFormBuilder, 
              private _loadingService:                    LoadingService,
              public _dialog:                             MatDialog,
              private _snackBar:                          MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group(
    {
      id:                                       [null],
      iscrizioneID:                             [],
      iscrizioni:                               [],
      personaID:                                [],
      alunnoID:                                 [],
      dtNota:                                   [],
      h_Ini:                                    [],
      h_End:                                    [],
      periodo:                                  [],
      ckFirmato:                                [],
      dtFirma:                                  [],
      ckInvioMsg:                               [false],
      nota:                                     []
    });

    this.obsIscrizioni$ = this.svcIscrizioni.listByClasseSezioneAnno(this.data.classeSezioneAnnoID);
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    if (!this.data.notaID || this.data.notaID + '' == "0") {
      //console.log ("nota-edit loadData nota, nuova nota");

      this.form.controls['iscrizioni'].setValue(this.data.iscrizioni);
      this.form.controls['dtNota'].setValue(new Date());

      this.svcUser.obscurrentUser.subscribe( val => {
        //console.log ("current user", val);
        this.form.controls['personaID'].setValue(val.personaID);
        this.form.controls['ckFirmato'].setValue(false);
        this.form.controls['periodo'].setValue(1); //per ora ho messo un valore fisso....TODO
        this.personaID = val.personaID;
        this.personaNomeCognome = val.fullname;
      });
      
      this.emptyForm = true;
    } 
    else {

      let iscrizioniArr : number[] = [];
      //in teoria potrei anche fare a meno dell'observable e dell'async nel form: potrei passare TUTTI i valori tramite DialogData...tanto li ho già...ma non sarebbe rxJs
      const obsNota$: Observable<DOC_Nota> = this.svcNote.get(this.data.notaID);
      const loadNota$ = this._loadingService.showLoaderUntilCompleted(obsNota$);
      this.obsNota$ = loadNota$
      .pipe( tap(
        nota => {
          //console.log ("nota-edit loadData nota", nota);
          this.form.patchValue(nota);
          for (let i=0; i < nota._NotaIscrizioni.length ; i++){ 
            iscrizioniArr.push(nota._NotaIscrizioni[i].iscrizioneID)
          }
          if (nota.ckInvioMsg) this.disabilitato = true;

          this.form.controls['iscrizioni'].setValue(iscrizioniArr);
          this.personaID = this.data.personaID;
          this.personaNomeCognome = nota.persona?.nome! + " " +nota.persona?.cognome!;
        } )
      );
    }
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {

    // ***************calcolo hEnd *****************
    // a prescindere, lo faccio nel caso debba servire impostarla
    //prendo la data corrente
    let dtTMP = new Date (this.form.controls['dtNota'].value);

    //ci metto l'H_Ini
    dtTMP.setHours(this.form.controls['h_Ini'].value.substring(0,2));
    dtTMP.setMinutes(this.form.controls['h_Ini'].value.substring(3,5));

    let setHours = 0;
    let setMinutes = 0;
    let setSeconds = 0;

    //aggiungo un'ora (nelle lezioni si faceva con un limite)
    // if ((dtTMP.getHours() + 1) > 15) { 
    //   setHours = 15;
    //   setMinutes = 0;
    // } 
    // else { 
      setHours = (dtTMP.getHours() + 1)
      setMinutes = (dtTMP.getMinutes())
    // }

    let dtTMP2 = new Date (dtTMP.setHours(setHours));
    dtTMP2.setMinutes(setMinutes);
    dtTMP2.setSeconds(setSeconds);

    let dtISO = dtTMP2.toLocaleString();
    let dtTimeNew = dtISO.substring(11,19); //tutto quanto sopra per arrivare a questa dtTimeNew da impostare come hEnd

    this.form.controls['h_End'].setValue (dtTimeNew)
    //**********fine calcolo h_End ***************

    if (this.form.controls['id'].value == null) {
      // caso 00 : Nuova Nota
      //console.log ("nuova nota");     
      this.svcNote.post(this.form.value).subscribe({
        next: nota=> {
            this.form.controls['iscrizioni'].value.forEach( (iscrizione: number) => {
            const objNotaIscrizione = <DOC_NotaIscrizione>{
              notaID: nota.id,
              iscrizioneID: iscrizione
            } 
            this.svcNoteIscrizioni.post(objNotaIscrizione).subscribe();
            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          })

          if(this.form.controls['ckInvioMsg'].value) {
            //console.log ("invioMsg");
            //DEVO INSERIRE TANTE SCADENZE QUANTE LE ISCRIZIONI
            //serve notaID appena inserito
            this.form.controls['iscrizioni'].value.forEach( (iscrizione: number) => {
              this.svcIscrizioni.get(iscrizione).subscribe(
                (iscrizione:CLS_Iscrizione) => {
                  //console.log ("iscrizione estratta:", iscrizione)
                  //inserisco la evento
                  const objEvento = <CAL_Evento>{
                    dtCalendario: this.form.controls['dtNota'].value,
                    title: "NOTA DISCIPLINARE PER " + iscrizione.alunno!.persona.nome + ' ' + iscrizione.alunno!.persona.cognome +"-" + this.form.controls['nota'].value,
                    start: this.form.controls['dtNota'].value,
                    end: this.form.controls['dtNota'].value,
                    color: "#FF0000",
                    ckPromemoria: true,
                    ckRisposta: false,
                    h_Ini: this.form.controls['h_Ini'].value,
                    h_End: this.form.controls['h_End'].value,
                    PersonaID: this.personaID,
                    TipoEventoID: 6,  //Fa schifetto  TODO
                    NotaID: nota.id
                  }
                  //console.log ("objEvento", objEvento);
                  this.svcEventi.post(objEvento).subscribe(
                    scad => {
                      //inserisco i genitori nella tabella EventoPersone
                      this.insertGenitori(iscrizione.alunnoID, scad.id)
                    }
                  )
                }
              ) 
            })
          }
        },
        error: err=>this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      })
    } 
    else {
      //console.log ("nota esistente");     

        this.svcNote.put(this.form.value).subscribe({
          //devo cancellare le noteIscrizioni e poi reinserirle
          next: nota=> {
            this.svcNoteIscrizioni.deleteByNota(nota.id)
            .subscribe(()=>{
              this.form.controls['iscrizioni'].value.forEach( (iscrizione: number) => {
                const objNotaIscrizione = <DOC_NotaIscrizione>{
                  notaID: nota.id,
                  iscrizioneID: iscrizione
                } 
                this.svcNoteIscrizioni.post(objNotaIscrizione).subscribe();
                this._dialogRef.close();
                this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
              })
            })

            if(this.form.controls['ckInvioMsg'].value) {
              //è certamente il PRIMO inserimento di un invioMsg, non è possibile che ci siano altre eventi vecchie, perchè poi viene inibito tutto
              //quindi non serve togliere prima tutte le eventi e poi ripristinarle

              //DEVO INSERIRE TANTE SCADENZE QUANTE LE ISCRIZIONI
              //serve notaID appena inserito
              this.form.controls['iscrizioni'].value.forEach( (iscrizione: number) => {
                this.svcIscrizioni.get(iscrizione).subscribe(
                  (iscrizione:CLS_Iscrizione) => {
                    //console.log ("iscrizione estratta:", iscrizione)
                    //inserisco la evento
                    const objEvento = <CAL_Evento>{
                      dtCalendario: this.form.controls['dtNota'].value,
                      title: "NOTA DISCIPLINARE PER " + iscrizione.alunno!.persona.nome + ' ' + iscrizione.alunno!.persona.cognome +"-" + this.form.controls['nota'].value,
                      start: this.form.controls['dtNota'].value,
                      end: this.form.controls['dtNota'].value,
                      color: "#FF0000",
                      ckPromemoria: true,
                      ckRisposta: false,
                      h_Ini: this.form.controls['h_Ini'].value,
                      h_End: this.form.controls['h_End'].value,
                      PersonaID: this.personaID,
                      TipoEventoID: 6,  //Fa schifetto  TODO
                      NotaID: nota.id
                    }
                    //console.log ("objEvento", objEvento);
                    this.svcEventi.post(objEvento).subscribe(
                      scad => {
                        //inserisco i genitori nella tabella EventoPersone
                        this.insertGenitori(iscrizione.alunnoID, scad.id)
                      }
                    )
                  }
                ) 
              })
            }
          },
          error: err=>this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        })
    }
  }
//#endregion

//#region ----- Altri metodi -------------------

  insertGenitori(alunnoID: number, eventoID: number) {

    //Se si volesse inserire il maestro tra coloro che lo ricevono...
    let objEventoPersona: CAL_EventoPersone = {
      personaID: this.form.controls['personaID'].value,
      eventoID : eventoID,
      ckLetto: false,
      ckAccettato: false,
      ckRespinto: false,
    }
    this.svcEventiPersone.post(objEventoPersona).subscribe();

    //estraggo i personaID dei genitori
    //console.log ("nota-edit - insertpersone - alunnoID", alunnoID, "eventoID", eventoID);

    this.svcGenitori.listByAlunno(alunnoID).subscribe({
      next: res=> {
        if (res.length != 0) {
          res.forEach( genitore => {
            let objEventoPersona: CAL_EventoPersone = {
              personaID: genitore.persona.id,
              eventoID : eventoID,
              ckLetto: false,
              ckAccettato: false,
              ckRespinto: false,
            }
            //console.log ("nota-edit - insertpersone - genitore", genitore);
            this.svcEventiPersone.post(objEventoPersona).subscribe();
          })
        } 
        else 
          console.log ("nessun genitore da inserire, ", res);
        
        return;
      },
      error: err=> {console.log ("errore in inserimento genitori", err)}
    });  
  }

    delete() {

    //Vengono anche cancellate le eventi (e le eventiPersone) che eventualmente fossero presenti nel record
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){

          //bisogna prima cancellare eventuali eventi con notaID dentro e prima di queste, eventuali eventiPersone che contengano quelle eventiID
          //nell'ordine quindi
            //1. cancellare da EventiPersone
            //2. cancellare da Eventi
            //3. cancellare da NoteIscrizioni
            //4. cancellare da Note

          this.svcEventi.listByNota(this.data.notaID).subscribe(
            eventi => {
              //un foreach non funzionerebbe: non aspetta le subscribe: la for of sembra invece attenderle
              for (let evento of eventi) {
                this.svcEventiPersone.deleteByEvento(evento.id)
                .pipe(
                  concatMap(res => this.svcEventi.delete(evento.id)),
                ).subscribe()
              }

              this.svcNoteIscrizioni.deleteByNota(this.data.notaID)
              .pipe(
                concatMap(()=> this.svcNote.delete(this.data.notaID))
              ).subscribe({            
                next: res=> {
                  this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
                  this._dialogRef.close();
                },
                error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}) 
              })
            }
          )
        }
      }
    );
  }
  
  warnDisabilitazione() {
    if (this.form.controls['ckInvioMsg'].value == true) {

      const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Al salvataggio della nota questa verrà inviata ai genitori e non saranno possibili future modifiche. Continuare?"}
      });
  
      dialogYesNo.afterClosed().subscribe(result => {
        if(!result) {
          this.form.controls['ckInvioMsg'].setValue(false);
        }
      });
    }
  }
//#endregion


}
