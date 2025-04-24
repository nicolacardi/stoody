import { Component, Inject, OnInit }                              from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                   from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA }               from '@angular/material/dialog';
import { MatSnackBar }                                            from '@angular/material/snack-bar';
import { firstValueFrom, iif, Observable, of }                    from 'rxjs';
import { concatMap, finalize, tap }                               from 'rxjs/operators';

//components
import { DialogYesNoComponent }                                   from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent }                                      from '../../utilities/dialog-ok/dialog-ok.component';

import { SnackbarComponent }                                      from '../../utilities/snackbar/snackbar.component';
import { Utility }                                                from '../../utilities/utility.component';

//services
import { VerbaliService }                                         from '../verbali.service';
import { VerbaliPresentiService }                                 from '../verbali-presenti.service';
import { ClassiSezioniAnniService }                               from '../../classi/classi-sezioni-anni.service';
import { PersoneService }                                         from '../../persone/persone.service';
import { LoadingService }                                         from '../../utilities/loading/loading.service';
import { TipiPersonaService }                                     from '../../persone/tipi-persona.service';

//models
import { DOC_TipoVerbale, DOC_Verbale, DOC_VerbalePresente }      from 'src/app/_models/DOC_Verbale';
import { PER_Persona }                                            from 'src/app/_models/PER_Persone';
import { CLS_ClasseSezioneAnno }                                  from 'src/app/_models/CLS_ClasseSezioneAnno';
import { DialogDataVerbale }                                      from 'src/app/_models/DialogData';


@Component({
  selector: 'app-verbale-edit',
  templateUrl: './verbale-edit.component.html',
  styleUrls: ['../verbali.css']
})

export class VerbaleEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  obsVerbale$!:                                 Observable<DOC_Verbale>;
  obsTipiVerbale$!:                             Observable<DOC_TipoVerbale[]>;
  obsPersonaleScuola$!:                         Observable<PER_Persona[]>;
  obsClassiSezioniAnni$!:                       Observable<CLS_ClasseSezioneAnno[]>;
  obsGenitoriClasse$!:                          Observable<PER_Persona[]>;
  classeSezioneAnnoSelected!:                   number;
  mostraClassiEGenitori:                        boolean = false;
  form! :                                       UntypedFormGroup;
  personaID!:                                   number;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  breakpoint!:                                  number;
//#endregion

  constructor(public _dialogRef:                MatDialogRef<VerbaleEditComponent>,
              
              private fb:                       UntypedFormBuilder, 
              private svcVerbali:               VerbaliService,
              private svcVerbaliPresenti:       VerbaliPresentiService,
              private svcPersone:               PersoneService,
              private svcTipiPersona:           TipiPersonaService,
              private svcClassiSezioniAnni:     ClassiSezioniAnniService,
              @Inject(MAT_DIALOG_DATA) public data:       DialogDataVerbale,
              private _loadingService:          LoadingService,
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group(
    {
      id:                                       [null],
      annoID:                                   [],
      tipoVerbaleID:                            [],
      nomeCognome:                              [{ value: '', disabled: true }],
      personaID:                                [],
      personale:                                [],
      genitori:                                 [],
      dtVerbale:                                [],
      classeSezioneAnnoID:                      [],
      hVerbale:                                 [],
      titolo:                                   [],
      contenuti:                                []
    });
  }

  ngOnInit() {

    this.obsTipiVerbale$ = this.svcVerbali.listTipiVerbale();
    this.obsPersonaleScuola$ = this.svcPersone.listPersonaleScuola();
    
    this.loadData();
  }

  loadData() {
    //console.log("annoID arrivato", this.data.annoID);
    this.form.controls['annoID'].setValue(this.data.annoID);

    //quando cambia il tipo di verbale cancella la classe e i genitori, poi mostra le combo a seconda
    this.form.controls['tipoVerbaleID'].valueChanges
    .pipe(
      concatMap( val => this.svcVerbali.getTipoVerbale(val)),
    ).subscribe(
      val => {
          //this.form.controls['classeSezioneAnnoID'].setValue(null);
          //accidenti questa impedisce di mostrare i genitori! ma se la tolgo non va bene se c'è perchè deve cancellare su change
          //dovrebbe funzionare sempre meno che su load
          //this.form.controls['genitori'].setValue(null);  
        if (val.ckMostraGenitori) 
          this.mostraClassiEGenitori = true;
        else 
          this.mostraClassiEGenitori = false;
      }
    );

    this.form.controls['classeSezioneAnnoID'].valueChanges
    .pipe(
      tap(val => { this.classeSezioneAnnoSelected = val? val: 0}),
      //concatMap( (val:number) => iif( ()=> val!= null, this.obsGenitoriClasse$ = this.svcPersone.listGenitoriByClasseSezioneAnno(val), of())),
      concatMap( () => this.obsGenitoriClasse$ = this.svcPersone.listGenitoriByClasseSezioneAnno(this.classeSezioneAnnoSelected))
    ).subscribe(
      //val => console.log(val)
    );

    if (this.data.verbale) {
      let arrPersonaleIDPresenti : number[] = [];
      let arrGenitoriIDPresenti : number[] = [];
      //in teoria potrei anche fare a meno dell'observable e dell'async nel form: potrei passare TUTTI i valori tramite DialogData...tanto li ho già...ma non sarebbe rxJs
      const obsVerbale$: Observable<DOC_Verbale> = this.svcVerbali.get(this.data.verbale.id);
      const loadVerbale$ = this._loadingService.showLoaderUntilCompleted(obsVerbale$);
      
      this.obsVerbale$ = loadVerbale$
      .pipe( tap(
        verbale => {
          console.log ("verbale-edit -  loadData - verbale", verbale);

          
          //impostare i flag estraendo l'array da verbale.personale
          verbale._VerbalePresenti.forEach(async (x, index) =>
            { //devo inserire SOLO quelli che sono del personale
              let personale = false;
              console.log("verbale-edit - loadData x.persona!._LstRoles!.length: ",x.persona!._LstRoles!.length ?? 0)
              //il seguente ciclo dovrebbe determinare se personale = true o personale = false
              for (let i=0; i <  x.persona!._LstRoles!.length; i++){
                await firstValueFrom(this.svcTipiPersona.getByDescrizione(x.persona!._LstRoles![i])
                .pipe(
                  tap (role=> {if (role.ckPersonale) personale = true }
                )))
              }
              console.log ("verbale-edit -  loadData - arrPersonaleIDPresenti", arrPersonaleIDPresenti);

              if (personale) 
                arrPersonaleIDPresenti.push(verbale._VerbalePresenti[index].personaID)
              else 
                arrGenitoriIDPresenti.push(verbale._VerbalePresenti[index].personaID)
            }
          )
          this.form.controls['personale'].setValue(arrPersonaleIDPresenti);
          this.form.controls['genitori'].setValue(arrGenitoriIDPresenti);

          this.form.patchValue(verbale);
          //console.log ("classeSezioneAnnoID", verbale.classeSezioneAnnoID);

          //purtroppo va fatto qui l'obSClassiSezioniAnni per poter selezionare poi il valore della classe in arrivo dalla get
          this.obsClassiSezioniAnni$ = this.svcClassiSezioniAnni.listByAnno(this.data.annoID)
          .pipe(
              tap( val=> this.form.controls['classeSezioneAnnoID'].setValue(verbale.classeSezioneAnnoID)
          ));

          if (verbale.tipoVerbale.ckMostraGenitori) 
            this.mostraClassiEGenitori = true;
          
          this.form.controls['nomeCognome'].setValue (verbale.persona.nome + ' ' + verbale.persona.cognome);
        } )
      );
    } 
    else {
      this.emptyForm = true;
      this.obsClassiSezioniAnni$ = this.svcClassiSezioniAnni.listByAnno(this.data.annoID);
      this.form.controls['nomeCognome'].setValue (Utility.getCurrentUser().fullname);
      this.form.controls['personaID'].setValue (Utility.getCurrentUser().personaID);
    }
  }

  delete() {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });

    dialogYesNo.afterClosed().subscribe(
      result => {
        if(result){
          this.svcVerbaliPresenti.deleteByVerbale(this.form.controls['id'].value);
          this.svcVerbali.delete (this.form.controls['id'].value).subscribe({
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

  save() {
    //console.log (this.mostraClassiEGenitori);
    //console.log (this.form.controls['classeSezioneAnnoID'].value);
    if (this.mostraClassiEGenitori && !this.form.controls['classeSezioneAnnoID'].value) {
      const dialogOK = this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE", sottoTitolo: "Indicare la classe"}
      });
    } 
    else {
      //per sicurezza, qualora tipo fosse su un valore che non prevede la classe e i genitori,
      //vado a cancellare i contenuti di quest'ultime in fase di salvataggio, potrebbero esserci valori rimasti
      //da precedenti selezioni
      if (!this.mostraClassiEGenitori) {
        this.form.controls['classeSezioneAnnoID'].setValue(null);
        this.form.controls['genitori'].setValue(null);
      }
      
      if (this.form.controls['id'].value == null) {
        
        //imposto per default l'anno corrente
        //let objAnno = sessionStorage.getItem('AnnoCorrente');
        //this.form.controls['annoID'].setValue(JSON.parse(objAnno!).id);
        this.svcVerbali.post(this.form.value).subscribe({
          next: res=> {  
            this.insertPresenze("personale", res.id);
            this.insertPresenze("genitori", res.id);

            this._dialogRef.close();
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });
      }
      else { 

        //cancello tutte le presenze del verbale e le ripristino
        let cancellaeRipristinaPresenze = this.svcVerbaliPresenti.deleteByVerbale(this.form.controls['id'].value)
          .pipe(
            finalize(()=>{
              this.insertPresenze("personale", this.form.controls['id'].value);
              this.insertPresenze("genitori", this.form.controls['id'].value);
            })
          );
        //.subscribe();         //AS: perchè no subscribe ??

        //ora salvo il verbale e lancio alla fine anche il cancellaeRipristinaPresenze
        this.svcVerbali.put(this.form.value)
          .pipe(
            concatMap(()=>cancellaeRipristinaPresenze)
          )
          .subscribe({
            next: res=> {  
              this._dialogRef.close();
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            error:  err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          });
      }
    }
  }


  insertPresenze(control: string, verbaleID: number) {

    if (this.form.controls[control].value) {
      for (let i = 0; i<this.form.controls[control].value.length; i++) {
        let objVerbalePresente: DOC_VerbalePresente = {
          personaID: this.form.controls[control].value[i],
          verbaleID : verbaleID
        }
        this.svcVerbaliPresenti.post(objVerbalePresente).subscribe();
      }
    }
  }
}
