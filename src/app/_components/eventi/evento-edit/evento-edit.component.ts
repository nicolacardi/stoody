//#region ----- IMPORTS ------------------------

import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable, firstValueFrom }                           from 'rxjs';
import { concatMap, finalize, take, tap }                            from 'rxjs/operators';

import { registerLocaleData }                   from '@angular/common';
import localeIt                                 from '@angular/common/locales/it';
registerLocaleData(localeIt, 'it');

import { CdkTextareaAutosize }                  from '@angular/cdk/text-field';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { EventiService }                      from '../eventi.service';
import { EventiPersoneService }               from '../eventi-persone.service';
import { PersoneService }                       from '../../persone/persone.service';
import { TipiPersonaService }                   from '../../persone/tipi-persona.service';
import { TipiEventoService }                  from '../tipievento.service';

//models
import { CAL_Evento, CAL_EventoPersone }                          from 'src/app/_models/CAL_Evento';
import { DialogDataEvento }                   from 'src/app/_models/DialogData';
import { PER_Persona, PER_TipoPersona }         from 'src/app/_models/PER_Persone';
import { User }                                 from 'src/app/_user/Users';
import { CAL_TipoEvento }                     from 'src/app/_models/CAL_TipoEvento';
import { ParametriService } from 'src/app/_components/impostazioni/parametri/parametri.service';

//#endregion
@Component({
  selector: 'app-evento-edit',
  templateUrl: './evento-edit.component.html',
  styleUrls: ['../eventi.css'],
  standalone: false

})
export class EventoEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;
  form! :                                       UntypedFormGroup;
  personaIDArr!:                                number[];
  colorSample:                                  string = '#FFFFFF'
  personeListArr!:                              PER_Persona[];
  personeListArrFiltered!:                      PER_Persona[];


  personeListSelArr!:                           CAL_EventoPersone[];

  filterValue!:                                  string;
  tipoPersonaIDArr!:                            number[];

  evento$!:                                   Observable<CAL_Evento>;
  obsPersone$!:                                 Observable<PER_Persona[]>;
  obsTipiPersone$!:                             Observable<PER_TipoPersona[]>;
  obsTipiEvento$!:                            Observable<CAL_TipoEvento[]>;

  strDtStart!:                                  string;
  strDtEnd!:                                    string;

  strH_Ini!:                                    string;
  strH_End!:                                    string;

  dtStart!:                                     Date;
  dtEnd!:                                       Date;
  strClasseSezioneAnno!:                        string;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  ckAppello:                                    boolean = false;
  ckCompito:                                    boolean = false;

  public docenteView:                           boolean = false;
  breakpoint!:                                  number;
  selectedTab:                                  number = 0;

  hMinStartEvento!:                           string;
  hMaxStartEvento!:                           string;
  hMinEndEvento!:                             string;
  hMaxEndEvento!:                             string;

  @ViewChild('autosize') autosize!:             CdkTextareaAutosize;





//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:                MatDialogRef<EventoEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data:       DialogDataEvento,

              private fb:                       UntypedFormBuilder, 
              private svcEventi:              EventiService,
              private svcPersone:               PersoneService,
              private svcTipiPersona:           TipiPersonaService,

              private svcEventiPersone:       EventiPersoneService,
              private svcTipiEvento:          TipiEventoService,
              private svcParametri:             ParametriService,

              private svcTipiPersone:           TipiPersonaService,

              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private _loadingService:          LoadingService,
              private _ngZone:                  NgZone ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      id:                                       [null],
      dtCalendario:                             [''],
      gruppi:                                   [''],
      ckPromemoria:                             [false],
      ckRisposta:                               [false],
      tipoEventoID:                           [''],
      personaID:                                [''],
      personeList:                              [[]],
      personeListSel:                           [[]],
      filtro:                                   [''],
      //campi di FullCalendar
      title:                                    [''],
      h_Ini:                                    [''],     
      h_End:                                    [''],    
      
      start:                                    [''],
      end:                                      [''],
      color:                                    ['']
    });

    this.currUser = Utility.getCurrentUser();
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit () {

    this.loadData();

    this.tipoPersonaIDArr = [];

    this.setArrayBase(); //imposta la lista delle persone di destra (da listbyEvento(this.data.eventoID)) e quella di destra togliendone le persone che sono già a destra

    this.obsTipiPersone$ = this.svcTipiPersone.list();
    this.obsTipiEvento$ = this.svcTipiEvento.list();


    this.svcParametri.getByParName('hMinStartEvento').subscribe(par=>{this.hMinStartEvento = par.parValue;});
    this.svcParametri.getByParName('hMaxStartEvento').subscribe(par=>{this.hMaxStartEvento = par.parValue;});
    this.svcParametri.getByParName('hMinEndEvento').subscribe(par=>{this.hMinEndEvento = par.parValue;});
    this.svcParametri.getByParName('hMaxEndEvento').subscribe(par=>{this.hMaxEndEvento = par.parValue;});



  }

  setArrayBase () {
    //estraggo le persone da selezionare, le metto in personeListArr che poi popoleranno la lista di sinsitra
    //poi inserisco le persone nella personeListArr e per ciascuna vado a vedere se già c'è l'id in personeListArr, per toglierlo
    this.svcEventiPersone.listByEvento(this.data.eventoID)
    .pipe(
      tap( sel=>{     
        //sel è l'elenco delle persone selezionate (viene da listByEvento(this.data.eventoID))   
        this.personeListSelArr = sel;
        this.personeListSelArr.sort((a,b) => (a.persona!.cognome > b.persona!.cognome)?1:((b.persona!.cognome > a.persona!.cognome) ? -1 : 0) );
        }
      ),
      concatMap(() =>
        this.svcPersone.list()
        .pipe(
          tap( val => {
          //ora estraggo l'elenco di TUTTE le persone
          this.personeListArr = val;

          this.fixPersoneListArr();

          this.filtraPersoneListArr();

        }))
      )
    )
    .subscribe();
  }

  fixPersoneListArr() {
    //il forEach va in avanti e non va bene: scombussola gli index visto che si fa lo splice...bisogna usare un for i--
    //splice SOTTRAE da personeListArr ciascun elemento che è stato trovato in personeListSelArr
    for (let i= this.personeListArr.length -1; i >= 0; i--) {
      if (this.personeListSelArr.filter(e => e.persona!.id === this.personeListArr[i].id).length > 0) {
        this.personeListArr.splice(i, 1);
      }
      this.addMyself(i);
    }
    //ordino per cognome
    this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );
  }

  addMyself(i: number){
    //devo SEMPRE aggiungere me stesso se l'i-esimo sono io allora lo/mi aggiungo e mi tolgo da personeListArr
    if (this.personeListArr[i].id === this.currUser.personaID) {
      let objEventoPersona: CAL_EventoPersone = {
        personaID: this.personeListArr[i].id,
        eventoID : this.data.eventoID,
        ckLetto: false,
        ckAccettato: false,
        ckRespinto: false,
        persona:  this.personeListArr[i]
      }
      this.personeListSelArr.push(objEventoPersona);
      this.personeListArr.splice(i, 1);
    }
  }

  loadData(): void {

    this.breakpoint = (window.innerWidth <= 800) ? 2 : 2;
    
    if (!this.data.eventoID || this.data.eventoID + '' == "0") {
      // //caso nuova Evento

      this.emptyForm = true;

      this.dtStart = new Date (this.data.start);
      this.strDtStart = Utility.formatDate(this.dtStart,  FormatoData.yyyy_mm_dd);
      this.strH_Ini = Utility.formatHour(this.dtStart);

       //in caso di nuova evento per default impostiamo la durata a un'ora
      this.dtEnd = new Date (this.dtStart.setHours(this.dtStart.getHours() + 1)); 
      this.strDtEnd = Utility.formatDate(this.dtEnd, FormatoData.yyyy_mm_dd);
      this.strH_End = Utility.formatHour(this.dtEnd);

      this.form.controls['dtCalendario'].setValue(this.dtStart);
      this.form.controls['h_Ini'].setValue(this.strH_Ini);
      this.form.controls['h_End'].setValue(this.strH_End);
    } 
    else {
      //caso Evento esistente
      const obsEvento$: Observable<CAL_Evento> = this.svcEventi.get(this.data.eventoID);
      const loadEvento$ = this._loadingService.showLoaderUntilCompleted(obsEvento$);
      this.evento$ = loadEvento$
      .pipe( tap(
        evento => {
          //console.log ("evento-edit - loadData - evento", evento)
          this.form.patchValue(evento)

          if (evento.tipoEvento!.ckNota) {
            this.form.controls['tipoEventoID'].disable();
            this.form.controls['h_Ini'].disable();
            this.form.controls['h_End'].disable();
          }
          this.colorSample = evento.tipoEvento!.color;
          
          //oltre ai valori del form (patchValue) vanno impostate alcune variabili: una data e alcune stringhe
          this.dtStart = new Date (this.data.start);
          this.strDtStart = Utility.formatDate(this.dtStart, FormatoData.yyyy_mm_dd);
          this.strH_Ini = Utility.formatHour(this.dtStart);

          this.dtEnd = new Date (this.data.end);
          this.strH_End = Utility.formatHour(this.dtEnd);
        } )
      );
    }
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {

    this.strH_Ini = this.form.controls['h_Ini'].value;
    this.strH_End = this.form.controls['h_End'].value;

    //https://thecodemon.com/angular-get-value-from-disabled-form-control-while-submitting/
    //i campi disabled non vengono più passati al form!
    //va prima lanciato questo loop che "ripopola" il form anche con i valori dei campi disabled
    
    // for (const prop in this.form.controls) {
    //   this.form.value[prop] = this.form.controls[prop].value;
    // }

    const objEvento = <CAL_Evento>{
      dtCalendario: this.form.controls['dtCalendario'].value,
      title: this.form.controls['title'].value,
      start: this.form.controls['start'].value,
      end: this.form.controls['end'].value,
      color: this.form.controls['tipoEventoID'].value,
      ckPromemoria: this.form.controls['ckPromemoria'].value,
      ckRisposta: this.form.controls['ckRisposta'].value,
      h_Ini: this.form.controls['h_Ini'].value,
      h_End: this.form.controls['h_End'].value,
      PersonaID: this.currUser.personaID,
      TipoEventoID: this.form.controls['tipoEventoID'].value
    }

    //qualcosa non funziona nel valorizzare form.controls['end'] e form.controls['start'] ma solo su nuova evento
    if (this.form.controls['id'].value == null) {   
      
      objEvento.id = 0;

      this.svcEventi.post(objEvento).subscribe({
        next: res => {
          this.insertPersone(res.id);
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });
    } 
    else  {
      //se viene MODIFICATA una evento si cancellano e si ripristinano le eventi persone
      //in questo modo se p.e. fosse stata inserita una nuova persona anche questa riceverebbe la evento.
      //tuttavia in questo modo uno che l'ha già ricevuta, se gli cambiano qualcosa (il testo, la data ecc) non se ne accorge!

      let cancellaeRipristinaPersone = this.svcEventiPersone.deleteByEvento(this.form.controls['id'].value)
      .pipe(
        finalize(()=>{
          this.insertPersone(this.form.controls['id'].value);
        })
      );

      //this.svcLezioni.put(this.form.value).subscribe(
        objEvento.id = this.form.controls['id'].value;
        this.svcEventi.put(objEvento)
        .pipe(
          concatMap(()=>cancellaeRipristinaPersone)
        )
        .subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });
    }
  }

  delete() {

    //vanno cancellate tutte le eventi persone!
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){
          this.svcEventiPersone.deleteByEvento(this.form.controls['id'].value)
          .pipe(
            concatMap(()=>this.svcEventi.delete (this.data.eventoID)
            )
          )
          .subscribe({
            next: res =>{
              this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });

        }
      }
    );
  }
//#endregion

//#region ----- Altri metodi -------------------

  dp1Change() {

    // //verifico anzitutto se l'ora che sto scrivendo è entro i limiti 8-15.30 altrimenti sistemo
    if (this.form.controls['h_Ini'].value < this.hMinStartEvento) {this.form.controls['h_Ini'].setValue (this.hMinStartEvento) }   //ora min di inizio 08:00:  parametrica
    if (this.form.controls['h_Ini'].value > this.hMaxStartEvento) {this.form.controls['h_Ini'].setValue (this.hMaxStartEvento) }   //ora max di inizio 15:30:  parametrica
    this.checkDurata();

  }

  dp2Change() {

    // //verifico anzitutto se l'ora che sto scrivendo è entro i limiti 8-15.30 altrimenti sistemo
    if (this.form.controls['h_End'].value < this.hMinEndEvento) {this.form.controls['h_End'].setValue (this.hMinEndEvento) } //ora min di fine 08:30:   parametrica
    if (this.form.controls['h_End'].value > this.hMaxEndEvento) {this.form.controls['h_End'].setValue (this.hMaxEndEvento) } //ora max di fine 16:00:   parametrica
    this.checkDurata();

  }

  checkDurata() {

  //se la durata è > 30min imposto l'ora di fine a 30 min dopo 

    if (this.form.controls['h_End'].value) {
      //prendo la data
      let dtTMPEnd = new Date (this.data.start);
      //ci metto l'H_End
      dtTMPEnd.setHours(this.form.controls['h_End'].value.substring(0,2));
      dtTMPEnd.setMinutes(this.form.controls['h_End'].value.substring(3,5));

      let dtTMPStart = new Date (this.data.start);
      //ci metto l'H_Ini
      dtTMPStart.setHours(this.form.controls['h_Ini'].value.substring(0,2));
      dtTMPStart.setMinutes(this.form.controls['h_Ini'].value.substring(3,5));

      //calcolo la durata, se meno di 30 minuti modifico H_end
      let durata = (dtTMPEnd.getTime() - dtTMPStart.getTime())/1000/60;
      if (durata < 30) {
        dtTMPEnd.setTime(dtTMPStart.getTime()+(30*1000*60));
        let dtTimeNew = Utility.zeroPad(dtTMPEnd.getHours(), 2)+":"+Utility.zeroPad(dtTMPEnd.getMinutes(), 2);
        this.form.controls['h_End'].setValue (dtTimeNew)
      }
    }
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  optChanged() {

    //devo aggiungere a personeListSelArr tutti quelli di personeListArr che hanno il tipoPersona come quello selezionato
    let count: number = 0;
    //devo annullare le precedenti selezioni, facendo reset di tutto

    //azzero le selezioni
    this.personeListSelArr =[];
    //ricarico TUTTE le persone
    this.svcPersone.list()
    .pipe(
      tap( val => {
      this.personeListArr = val;
      this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );


      //aggiungo alle selezioni quelli dei gruppi e tolgo dalle persone contemporaneamente
      this.form.controls['gruppi'].value.forEach(
        async (val:number) => {
          for (let i = this.personeListArr.length - 1; i>0; i--) {
            

            // this.currUser.persona?._LstRoles!.forEach(
            //   role=> {this.svcTipiPersona.getByDescrizione(role).subscribe(
            //     res=> {
            //       this.almenoUnRuoloEditor = true;
            //       //se uno solo dei ruoli ha diritto di editor gli viene concesso
            //       if (res.ckEditor) {
            //       this.calendarOptions.editable =             true;             //consente modifiche agli eventi presenti
            //       this.calendarOptions.selectable =           true;             //consente di creare eventi
            //       this.calendarOptions.eventStartEditable =   true;             //consente di draggare eventi
            //       this.calendarOptions.eventDurationEditable =true;             //consente di modificare la lunghezza eventi
            //     }}
            //   )}
            // );

            //cerco val  e ne estraggo al descrizione poi guardo se c'è tra quelle di lstRoles della persona
            let descrTipo!: string;
            
            await firstValueFrom(this.svcTipiPersona.get(val).pipe(tap(tipoPersona => descrTipo = tipoPersona.descrizione)));

            //se il tipo è uguale a quello che sto caricando (val) OPPURE se trovo me stesso lo aggiungo
            //if (this.personeListArr[i].tipoPersona!.id == val  || this.personeListArr[i].id === this.currUser.personaID) { 
            if (this.personeListArr[i]._LstRoles!.includes(descrTipo)  || this.personeListArr[i].id === this.currUser.personaID) { 

              count++; 
              let objEventoPersona: CAL_EventoPersone = {
                personaID: this.personeListArr[i].id,
                eventoID : this.data.eventoID,
                ckLetto: false,
                ckAccettato: false,
                ckRespinto: false,
                persona:  this.personeListArr[i]
              }
              this.personeListSelArr.push(objEventoPersona);
              this.personeListArr.splice(i, 1);

              this.filtraPersoneListArr();
            }
          }
        }
      )

      //se non ci sono selezioni devo aggiungere almeno me stesso
      if (this.form.controls['gruppi'].value.length==0) {
        for (let i = this.personeListArr.length - 1; i>0; i--) {
          //se trovo me stesso lo aggiungo
          if (this.personeListArr[i].id === this.currUser.personaID) { 
            count++; 
            let objEventoPersona: CAL_EventoPersone = {
              personaID: this.personeListArr[i].id,
              eventoID : this.data.eventoID,
              ckLetto: false,
              ckAccettato: false,
              ckRespinto: false,
              persona:  this.personeListArr[i]
            }
            this.personeListSelArr.push(objEventoPersona);
            this.personeListArr.splice(i, 1);
            this.filtraPersoneListArr();
          }
        }
      }})
    )
    .subscribe();

    //ordino per cognome
    this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );
  }

  insertPersone(eventoID: number) {
    for (let i = 0; i<this.personeListSelArr.length; i++) {
      let objEventoPersona: CAL_EventoPersone = {
        personaID: this.personeListSelArr[i].persona!.id,
        eventoID : eventoID,
        ckLetto: false,
        ckAccettato: false,
        ckRespinto: false,
      }
      this.svcEventiPersone.post(objEventoPersona).subscribe();
    }
  }

  addToSel(element: PER_Persona) {
    //console.log (element);
    let objEventoPersona: CAL_EventoPersone = {
      personaID: element.id,
      eventoID : this.data.eventoID,
      ckLetto: false,
      ckAccettato: false,
      ckRespinto: false,
      persona: element
    }
    this.personeListSelArr.push(objEventoPersona);
    const index = this.personeListArr.indexOf(element);
    this.personeListArr.splice(index, 1);
    this.personeListSelArr.sort((a,b) => (a.persona!.cognome > b.persona!.cognome)?1:((b.persona!.cognome > a.persona!.cognome) ? -1 : 0) );
    this.filtraPersoneListArr();
  }

  removeFromSel(element: CAL_EventoPersone) {
    if (element.personaID == this.currUser.personaID) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Non è possibile rimuovere se stessi"}
      });
    } else {
      //console.log (element);
      this.personeListArr.push(element.persona!);
      const index = this.personeListSelArr.indexOf(element);
      this.personeListSelArr.splice(index, 1);
      this.personeListArr.sort((a,b) => (a.cognome > b.cognome)?1:((b.cognome > a.cognome) ? -1 : 0) );
      this.filtraPersoneListArr();
    }

  }

  changeColor() {
    this.svcTipiEvento.get(this.form.controls['tipoEventoID'].value)
    .subscribe(
      val=> this.colorSample = val.color
    );
  }


  filtraPersoneListArr() {
    this.filterValue = this.form.controls['filtro'].value.toLowerCase(); //potevo anche estrarlo dal form.control.value

    this.personeListArrFiltered = this.personeListArr.filter(val => 
        (val.nome.toLowerCase() + ' ' + val.cognome.toLowerCase()).includes(this.filterValue)
    );
    
  }
//#endregion

  


}
