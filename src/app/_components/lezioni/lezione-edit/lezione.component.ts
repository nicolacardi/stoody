//#region ----- IMPORTS ------------------------

import { Component, Inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }               from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable }                           from 'rxjs';
import { map, take, tap }                            from 'rxjs/operators';

import { registerLocaleData }                   from '@angular/common';
import localeIt                                 from '@angular/common/locales/it';
registerLocaleData(localeIt, 'it');

import { CdkTextareaAutosize }                  from '@angular/cdk/text-field';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { VotiCompitoListComponent }             from '../voti-compito-list/voti-compito-list.component';
import { PresenzeListComponent }                from '../presenze-list/presenze-list.component';

//services
import { MaterieService }                       from 'src/app/_components/materie/materie.service';
import { DocenzeService }                       from '../../docenze/docenze.service';
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';
import { DocentiService }                       from '../../docenti/docenti.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { LezioniService }                       from '../lezioni.service';
import { PresenzeService }                      from '../presenze.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { VotiCompitiService }                   from '../voti-compiti.service';

//models
import { CAL_Lezione }                          from 'src/app/_models/CAL_Lezione';
import { MAT_Materia }                          from 'src/app/_models/MAT_Materia';
import { PER_Docente }                          from 'src/app/_models/PER_Docente';
import { CLS_ClasseDocenteMateria }             from 'src/app/_models/CLS_ClasseDocenteMateria';
import { CAL_Presenza }                         from 'src/app/_models/CAL_Presenza';
import { TST_VotoCompito }                      from 'src/app/_models/TST_VotiCompiti';
import { DialogDataLezione }                    from 'src/app/_models/DialogData';

//#endregion

@Component({
  selector: 'app-lezione',
  templateUrl: './lezione.component.html',
  styleUrls: ['../lezioni.css'],
  standalone: false

})
export class LezioneComponent implements OnInit {

//#region ----- Variabili ----------------------

  form! :                                       UntypedFormGroup;
  docenteID!:                                   number;
  lezione$!:                                    Observable<CAL_Lezione>;
  obsMaterie$!:                                 Observable<MAT_Materia[]>;
  obsClassiDocentiMaterie$!:                    Observable<CLS_ClasseDocenteMateria[]>;
  obsDocenti$!:                                 Observable<PER_Docente[]>;
  obsSupplenti$!:                               Observable<PER_Docente[]>;

  strDtStart!:                                  string;
  strDtEnd!:                                    string;

  strH_Ini!:                                    string;
  strH_End!:                                    string;

  dtStart!:                                     Date;
  dtEnd!:                                       Date;
  strClasseSezioneAnno!:                        string;
  classeSezioneAnnoID!:                         number;

  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  ckAppello:                                    boolean = false;
  ckCompito:                                    boolean = false;

  public docenteView:                           boolean = false;
  breakpoint!:                                  number;
  selectedTab:                                  number = 0;

  @ViewChild('autosize') autosize!:             CdkTextareaAutosize;
  @ViewChild(VotiCompitoListComponent) VotiCompitoListComponent!: VotiCompitoListComponent; 
  @ViewChild("presenzeList") PresenzeListComponent!: PresenzeListComponent; 


//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:                          MatDialogRef<LezioneComponent>,
              @Inject(MAT_DIALOG_DATA) public data:       DialogDataLezione,
              private fb:                                 UntypedFormBuilder, 
              private svcLezioni:                         LezioniService,
              private svcMaterie:                         MaterieService,
              private svcDocenti:                         DocentiService,
              private svcDocenze:                         DocenzeService,
              private svcClasseSezioneAnno:               ClassiSezioniAnniService,
              private svcIscrizioni:                      IscrizioniService,
              private svcPresenze:                        PresenzeService,
              private svcVotiCompiti:                     VotiCompitiService,
              public _dialog:                             MatDialog,
              private _snackBar:                          MatSnackBar,
              private _loadingService:                    LoadingService,
              private _ngZone:                            NgZone ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      id:                                       [null],
      classeDocenteMateriaID:                   [''],
      classeSezioneAnnoID:                      [''],
      dtCalendario:                             [''],
    
      //campi di FullCalendar
      title:                                    [''],
      h_Ini:                                    [''],     
      h_End:                                    [''],    
      colore:                                   [''],
  
      docenteID:                                [{value: '', disabled: true}],
      materiaID:                                [''],
      ckEpoca:                                  [''],
      ckFirma:                                  [''],
      dtFirma:                                  [''],
      ckAssente:                                [''],
      ckAppello:                                [''],

      ckCompito:                                [false],
      argomentoCompito:                         [''],

      argomento:                                [''],
      compiti:                                  [''],
      supplenteID:                              [''],
      start:                                    [''],
      end:                                      ['']
    });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit () {
    //non dovrebbe più servire aggiornare il nome del docente
    //però ATTENZIONE ALLE INTERROGAZIONI!
    // this.form.controls['classeDocenteMateriaID'].valueChanges.subscribe( 
    //   res =>{
        

    //     if (this.form.controls['classeSezioneAnnoID'].value != '' && this.form.controls['classeSezioneAnnoID'].value != null && this.form.controls['classeSezioneAnnoID'].value != undefined) {
    //       //verifica se già non è impegnato in quest'ora o FRAZIONI DI ORA in qualche altro posto.
    //       //console.log("lezione-component ngOnIniti - getByClasseSezioneAnnoAndMateria this.form.controls['classeSezioneAnnoID'].value", this.form.controls['classeSezioneAnnoID'].value)

    //       this.svcDocenze.getByClasseSezioneAnnoAndMateria(this.form.controls['classeSezioneAnnoID'].value, res)
        
    //         // .pipe(
    //         //   map(docenze => docenze.sort((a, b) => a.materia.descrizione.localeCompare(b.materia.descrizione)))
    //         // )
    //       .subscribe(
    //         val => {
    //           console.log ("val", val);
    //           if (val) {
    //             this.form.controls['docenteID'].setValue(val.docenteID);
    //             this.docenteID = this.data.docenteID; //Serve per essere passato alle interrogazioni
    //           }
    //           else { 
    //             this.form.controls['docenteID'].setValue("");
    //             this.docenteID = this.data.docenteID; //Serve per essere passato alle interrogazioni
    //           }
    //         });
    //     }
    //   }
    // );

    this.form.controls['docenteID'].valueChanges.subscribe( 
      //ora devo estrarre i supplenti: i docenti che per l'ora selezionata NON sono già impegnati
      val => this.obsSupplenti$ = this.svcDocenti.listSupplentiDisponibili(this.data.lezioneID? this.data.lezioneID: 0, val, this.data.dtCalendario, this.data.h_Ini, this.data.h_End)
    );


    if (this.data.classeSezioneAnnoID != null && this.data.classeSezioneAnnoID != undefined) {
      this.svcClasseSezioneAnno.get(this.data.classeSezioneAnnoID).subscribe(
        val => this.strClasseSezioneAnno = val.classeSezione.classe!.descrizione2 + " " + val.classeSezione.sezione
      );
    }

    this.loadData();
  }

  loadData(): void {

    this.breakpoint = (window.innerWidth <= 800) ? 2 : 2;
    console.log("lezione.component - loadData - this.data.classeSezioneAnnoID", this.data.classeSezioneAnnoID);
    this.obsClassiDocentiMaterie$ = this.svcDocenze.listByClasseSezioneAnno(this.data.classeSezioneAnnoID)
    .pipe(
      map(docenze => docenze.sort((a, b) => a.materia!.descrizione.localeCompare(b.materia!.descrizione)))
    );

    this.obsMaterie$ = this.svcMaterie.listByClasseSezioneAnno(this.data.classeSezioneAnnoID); 

    this.obsDocenti$ = this.svcDocenti.list();

    if (this.data.dove == "orario") {
      this.form.controls['ckFirma'].disable();
      this.form.controls['compiti'].disable();
      this.form.controls['argomento'].disable();
      this.form.controls['ckCompito'].disable();
      this.form.controls['argomentoCompito'].disable();
    } 
    else {
      this.form.controls['h_Ini'].disable();
      this.form.controls['h_End'].disable();
      this.form.controls['materiaID'].disable();
      this.form.controls['supplenteID'].disable();
      this.form.controls['ckEpoca'].disable();
    }

    if (this.data.lezioneID && this.data.lezioneID + '' != "0") {
      const obsLezione$: Observable<CAL_Lezione> = this.svcLezioni.get(this.data.lezioneID);
      const loadLezione$ = this._loadingService.showLoaderUntilCompleted(obsLezione$);
      this.lezione$ = loadLezione$
      .pipe( tap(
        lezione => {
          this.form.patchValue(lezione)
          //oltre ai valori del form vanno impostate alcune variabili: una data e alcune stringhe
          this.dtStart = new Date (this.data.start);
          this.strDtStart = Utility.formatDate(this.dtStart, FormatoData.yyyy_mm_dd);
          this.strH_Ini = Utility.formatHour(this.dtStart);

          this.dtEnd = new Date (this.data.end);
          this.strH_End = Utility.formatHour(this.dtEnd);
          this.ckAppello = lezione.ckAppello;
          this.ckCompito = lezione.ckCompito;
          if (lezione.ckCompito && this.data.dove !="orario") this.form.controls['argomentoCompito'].enable();
          else this.form.controls['argomentoCompito'].disable();
        } )
      );
    } 
    else {
      //caso nuova Lezione

      this.emptyForm = true;  //questo determinava un expressionChangedAfterItHasBeenCheckedError. Sistemato aggiungendo un || emptyForm in [disabled] nell'html.

      this.dtStart = new Date (this.data.start);
      this.strDtStart = Utility.formatDate(this.dtStart,  FormatoData.yyyy_mm_dd);
      this.strH_Ini = Utility.formatHour(this.dtStart);

      this.dtEnd = new Date (this.dtStart.setHours(this.dtStart.getHours() + 1));  //in caso di nuova lezione per default impostiamo la durata a un'ora
      this.strDtEnd = Utility.formatDate(this.dtEnd, FormatoData.yyyy_mm_dd);
      this.strH_End = Utility.formatHour(this.dtEnd);

      this.form.controls['classeSezioneAnnoID'].setValue(this.data.classeSezioneAnnoID);
      this.form.controls['dtCalendario'].setValue(this.dtStart);
      this.form.controls['h_Ini'].setValue(this.strH_Ini);
      this.form.controls['h_End'].setValue(this.strH_End);
    }
  }
//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {

    this.strH_Ini = this.form.controls['h_Ini'].value;
    this.strH_End = this.form.controls['h_End'].value;

    this.svcLezioni.listByDocenteAndOraOverlap (this.data.lezioneID? this.data.lezioneID: 0 , this.form.controls['docenteID'].value, this.strDtStart, this.strH_Ini, this.strH_End)
    .subscribe( (val: CAL_Lezione[]) => {
      if (val.length > 0) {
        let strMsg = "il Maestro " + val[0].classeDocenteMateria.docente!.persona!.nome + " " + val[0].classeDocenteMateria.docente!.persona!.cognome + " \n è già impegnato in questo slot in ";
        val.forEach (x =>
          {strMsg = strMsg + "\n - " + x.classeDocenteMateria.classeSezioneAnno!.classeSezione.classe!.descrizione2 + ' ' + x.classeDocenteMateria.classeSezioneAnno!.classeSezione.sezione;}
        )

        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: strMsg}
        });
      } 
      else {

        //https://thecodemon.com/angular-get-value-from-disabled-form-control-while-submitting/
        //i campi disabled non vengono più passati al form!
        //va prima lanciato questo loop che "ripopola" il form anche con i valori dei campi disabled
        
        // for (const prop in this.form.controls) {
        //   this.form.value[prop] = this.form.controls[prop].value;
        // }

        if (this.form.controls['ckAppello'].value == '')   this.form.controls['ckAppello'].setValue(false);     
        if (this.form.controls['ckCompito'].value == '')   this.form.controls['ckCompito'].setValue(false);     
        
        const objLezione = <CAL_Lezione>{
          classeDocenteMateriaID: this.form.controls['classeSezioneMateriaID'].value,
          //classeSezioneAnnoID: this.form.controls['classeSezioneAnnoID'].value,
          dtCalendario: this.form.controls['dtCalendario'].value,
          title: this.form.controls['title'].value,
          start: this.form.controls['start'].value,
          end: this.form.controls['end'].value,
          colore: this.form.controls['colore'].value,

          h_Ini: this.form.controls['h_Ini'].value,
          h_End: this.form.controls['h_End'].value,

          //docenteID: this.form.controls['docenteID'].value,
          //materiaID: this.form.controls['materiaID'].value,
          supplenteID: this.form.controls['supplenteID'].value,

          ckEpoca: this.form.controls['ckEpoca'].value,
          ckFirma: this.form.controls['ckFirma'].value,
          dtFirma: this.form.controls['dtFirma'].value,
          ckAssente: this.form.controls['ckAssente'].value,
          ckAppello: this.form.controls['ckAppello'].value,
          
          argomento: this.form.controls['argomento'].value,
          compiti: this.form.controls['compiti'].value,
          ckCompito: this.form.controls['ckCompito'].value,
          argomentoCompito: this.form.controls['argomentoCompito'].value
        };

        if (this.form.controls['id'].value == null) {   

          objLezione.id = 0;
          this.svcLezioni.post(objLezione).subscribe({
            next: res => {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          });
        } 
        else  {
          //this.svcLezioni.put(this.form.value).subscribe(
            objLezione.id = this.form.controls['id'].value;
            this.svcLezioni.put(objLezione).subscribe({
            next: res=> {
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
         });
        }
      }
    });
  }

  delete() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){
          this.svcLezioni.delete (this.data.lezioneID).subscribe({
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

    //verifico anzitutto se l'ora che sto scrivendo è entro i limiti 8-15.30 altrimenti sistemo
    if (this.form.controls['h_Ini'].value < "08:00") {this.form.controls['h_Ini'].setValue ("08:00") }   //ora min di inizio 08:00:  sarà parametrica
    if (this.form.controls['h_Ini'].value > "15:30") {this.form.controls['h_Ini'].setValue ("15:30") }   //ora max di inizio 15:30: sarà parametrica
    this.checkDurata();

  }

  dp2Change() {

    //verifico anzitutto se l'ora che sto scrivendo è entro i limiti 8-15.30 altrimenti sistemo
    if (this.form.controls['h_End'].value < "08:30") {this.form.controls['h_End'].setValue ("08:30") } //ora min di fine 08:30:  sarà parametrica
    if (this.form.controls['h_End'].value > "16:00") {this.form.controls['h_End'].setValue ("16:00") } //ora max di fine 16:00:  sarà parametrica
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

  ckAssenteChange() {
    if (this.form.controls['ckAssente'].value != true) 
      this.form.controls['supplenteID'].setValue("");
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  generaAppello() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la generazione dell'appello ?"}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcIscrizioni.listByClasseSezioneAnno(this.data.classeSezioneAnnoID).subscribe(
          iscrizioni => {
          //Inserisce le presenze
          for (let iscrizione of iscrizioni) {
            let objPresenza : CAL_Presenza =
            { 
              id : 0,
              AlunnoID : iscrizione.alunnoID,
              LezioneID : this.data.lezioneID,
              ckPresente : true,
              ckDAD: false
            };
            this.svcPresenze.post(objPresenza).subscribe();
          }

          //ora deve salvare il ckAppello nella lezione: 
          //ATTENZIONE: così salva anche eventuali modifiche ad altri campi che magari uno non voleva salvare
          //forse bisognerebbe salvare SOLO il ckAppello
          this.form.controls['ckAppello'].setValue(true);
          this.ckAppello = true;
          
          for (const prop in this.form.controls) {
            this.form.value[prop] = this.form.controls[prop].value;
          }
        
          this.svcLezioni.put(this.form.value).subscribe({
            next: res=> {
              this.PresenzeListComponent.loadData(); //NON VA. #ERROR cannot read properties of undefined reading loadData
            },  
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          });
        });
      }
    });
  }

  changedCkCompito(checked: boolean,) {
    this.ckCompito = checked;
    if (checked) {
      this.form.controls['argomentoCompito'].enable();

      //Ora bisogna inserire in Voti un valore per ogni alunno
      this.svcIscrizioni.listByClasseSezioneAnno(this.data.classeSezioneAnnoID)
      .subscribe(iscrizioni => {
        //Inserisce le presenze
        for (let iscrizione of iscrizioni) {
          let objVoto : TST_VotoCompito =
          { 
            id : 0,
            alunnoID : iscrizione.alunnoID,
            lezioneID : this.data.lezioneID,
            voto : 0,
            giudizio: ''
          };
          this.svcVotiCompiti.post(objVoto).subscribe();
        }

        //ora deve salvare il ckCompito e l'argomentoCompito nella lezione: 
        //ATTENZIONE: così salva anche eventuali modifiche ad altri campi che magari uno non voleva salvare
        //forse bisognerebbe salvare SOLO il ckCompito e l'argomentoCompito
        //this.form.controls['ckCompito'].setValue(true); //dovrebbe essere già settato
        
        for (const prop in this.form.controls) {
          this.form.value[prop] = this.form.controls[prop].value;
        }
      
        this.svcLezioni.put(this.form.value).subscribe({
          next: res=> this.VotiCompitoListComponent.loadData(),//qui funziona 
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });
      });
    }
    else {
      this.form.controls['argomentoCompito'].setValue('');
      this.form.controls['argomentoCompito'].disable();

      const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma di voler cancellare il compito e con esso tutti i voti dello stesso?"}
      });
  
      dialogYesNo.afterClosed().subscribe(result => {
        if(result) {
          this.svcVotiCompiti.deleteByLezione(this.data.lezioneID).subscribe();
          for (const prop in this.form.controls) {
            this.form.value[prop] = this.form.controls[prop].value;
          }
        
          this.svcLezioni.put(this.form.value).subscribe({
            next: res=> console.log ("ho cancellato i voti ma non faccio la refresh, non serve, i voti sono nascosti dalla ngIf"),
            //this.VotiCompitoListComponent.loadData(),  //qui non serve fare la loadData, c'è un ngIf e quindi è nascosto, e poi non funzionerebbe per questo stesso motivo
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          });
        } 
        else {
          this.form.controls['ckCompito'].setValue(true);
          this.ckCompito = true;
        }
      });
    }
  }

  selectedTabValue(event: any){
    //senza questo espediente non fa il primo render correttamente
    this.selectedTab = event.index;
  }

//#endregion
}
