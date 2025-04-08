//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild }                            from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }       from '@angular/material/dialog';
import { MatSnackBar }                                                     from '@angular/material/snack-bar';
import { forkJoin, iif, Observable, of }                                   from 'rxjs';
import { concatMap, debounceTime, map, switchMap, tap }                                                  from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup }                            from '@angular/forms';
import { MatAutocompleteSelectedEvent }                                    from '@angular/material/autocomplete';

//components
import { ClassiSezioniAnniListComponent }                                  from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { GenitoreEditComponent }                                           from '../../genitori/genitore-edit/genitore-edit.component';
import { GenitoriListComponent }                                           from '../../genitori/genitori-list/genitori-list.component';
import { PersonaFormComponent }                                            from '../../persone/persona-form/persona-form.component';

import { SnackbarComponent }                                               from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                                            from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent }                                               from '../../utilities/dialog-ok/dialog-ok.component';

import { AlunnoFormComponent }                                             from '../alunno-form/alunno-form.component';
import { UserFormComponent }                                               from '../../users/user-form/user-form.component';

//services
import { AlunniService }                                                   from 'src/app/_components/alunni/alunni.service';
import { IscrizioniService }                                               from '../../iscrizioni/iscrizioni.service';
import { LoadingService }                                                  from '../../utilities/loading/loading.service';
import { UserService }                                                     from 'src/app/_user/user.service';
import { PersoneService }                                                  from '../../persone/persone.service';

//models
import { ALU_Alunno }                                                      from 'src/app/_models/ALU_Alunno';
import { ALU_Genitore }                                                    from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni }                                                      from 'src/app/_models/_UT_Comuni';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup }               from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ALU_GenitoreAlunno }                                              from 'src/app/_models/ALU_GenitoreAlunno';
import { PER_Persona }                                                     from 'src/app/_models/PER_Persone';
import { FormCustomValidatorsArray } from '../../utilities/requireMatch/requireMatch';



//#endregion

@Component({
  selector:     'app-alunno-edit',
  templateUrl:  './alunno-edit.component.html',
  styleUrls:    ['./../alunni.css'],
  standalone: false
})

export class AlunnoEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  genitore!                      : ALU_GenitoreAlunno;
  alunno$!                       : Observable<ALU_Alunno>;
  filteredComuni$!               : Observable<_UT_Comuni[]>;
  filteredComuniNascita$!        : Observable<_UT_Comuni[]>;
  genitoriArr                    : ALU_GenitoreAlunno[] = []
  public personaID!              : number;
  public userID!                 : string;

  alunnoNomeCognome              : string = "";

  personaFormisValid!            : boolean;
  alunnoFormisValid!             : boolean;
  userFormisValid!               : boolean;

  emptyForm                      : boolean = false;
  loading                        : boolean = true;
  breakpoint!                    : number;

  comuniIsLoading                : boolean = false;
  comuniNascitaIsLoading         : boolean = false;
  selectedTab                    : number = 0;

  filteredPersone$!              : Observable<PER_Persona[]>;
  filteredPersoneArray!          : PER_Persona[];
  form!                          : UntypedFormGroup;

//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChild('genitoriFamiglia') genitoriFamigliaComponent!:            GenitoriListComponent; 
  @ViewChild('genitoriDisponibili') genitoriDisponibiliComponent!:      GenitoriListComponent; 

  @ViewChild('iscrizioniAlunno') classiAttendedComponent!:              ClassiSezioniAnniListComponent; 
  @ViewChild('classiSezioniAnniList') classiSezioniAnniListComponent!:  ClassiSezioniAnniListComponent; 
  
  @ViewChild(PersonaFormComponent) personaFormComponent!       : PersonaFormComponent;
  @ViewChild(AlunnoFormComponent) alunnoFormComponent!         : AlunnoFormComponent;
  @ViewChild(UserFormComponent) userFormComponent!             : UserFormComponent;

//#endregion

//#region ----- Constructor --------------------

  constructor(
    public _dialogRef                              : MatDialogRef<AlunnoEditComponent>,
    @Inject(MAT_DIALOG_DATA) public alunnoID       : number,
    private fb                                     : UntypedFormBuilder,
    private svcIscrizioni                          : IscrizioniService,
    private svcAlunni                              : AlunniService,
    private svcUser                                : UserService,
    private svcPersone                             : PersoneService,
    public _dialog                                 : MatDialog,
    private _snackBar                              : MatSnackBar,
    private _loadingService                        : LoadingService
  ) 
  {
    _dialogRef.disableClose = true;
    this.form = this.fb.group(
      {
        nomeCognomePersona: [null],
      });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit () {
    this.loadData();
  }

  loadData(){
 
    //quello che segue è il modo per
    //estrarre la lista delle persone
    //estrarre la lista dei genitori
    //togliere dalla lista delle eprsone quelle che sono già genitori
    //questo serve per evitare di creare un SECONDO genitore con la stessa persona
    //nulla infatti impedirebbe di farlo

    forkJoin({
      persone: this.svcPersone.list(),
      alunni: this.svcAlunni.list()
    }).subscribe(({ persone, alunni }) => {
      const alunniIDs = new Set(alunni.map(g => g.personaID));
      const personeFiltrate = persone.filter(p => !alunniIDs.has(p.id));
    
      // Imposta il validatore con persone filtrate
      this.form.controls['nomeCognomePersona'].setValidators(
        [FormCustomValidatorsArray.valueSelected(personeFiltrate)]
      );
    
      this.filteredPersone$ = this.form.controls['nomeCognomePersona'].valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this.svcPersone.filterPersone(value).pipe(
          map(filtered => filtered.filter(p => !alunniIDs.has(p.id))) // Escludi i genitori
        ))
      );
    });

        
    if (this.alunnoID && this.alunnoID + '' != "0") {

      const obsAlunno$: Observable<ALU_Alunno> = this.svcAlunni.getWithParents(this.alunnoID);
      const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);
      this.alunno$ = loadAlunno$
      .pipe(
          tap(
            alunno => {
              this.personaID = alunno.personaID;
              this.svcUser.getByPersonaID(this.personaID).subscribe(user=> {
                //l'utente potrebbe non esserci (nuovo record ma anche utente senza user)
                if (user) {
                  // console.log ("genitore-edit - loadData - user",user);
                  this.userID = user.id;
                } else {
                  this.userID = '';
                }
              });
              this.alunnoNomeCognome = alunno.persona.nome + " " + alunno.persona.cognome;
            }       
          )
      );
    }
    else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ----------------
  
save(){

    this.personaFormComponent.save()
    .subscribe({
      next: persona=> {

        //console.log ("genitore-edit save() - subscribe...prima di genitoreFormComponent.save() e userFormComponent.save() ");

        //quello che segue serve per la POST e non per la PUT
        if (this.alunnoFormComponent.form.controls['personaID'].value == null) this.alunnoFormComponent.form.controls['personaID'].setValue(persona.id);
        //console.log ("genitoreFormComponent.form.value", this.genitoreFormComponent.form.value);
        this.alunnoFormComponent.save();

        //quello che segue serve per la POST e non per la PUT
        if (this.userFormComponent.form.controls['personaID'].value == null) this.userFormComponent.form.controls['personaID'].setValue(persona.id);
        if (this.userFormComponent.form.controls['userName'].value == null) this.userFormComponent.form.controls['userName'].setValue(this.userFormComponent.form.controls['email'].value);
        if (this.userFormComponent.form.controls['password'].value == null) this.userFormComponent.form.controls['password'].setValue(1234);
        //console.log ("userFormComponent.form.value", this.userFormComponent.form.value);

        this.userFormComponent.save();
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    });
  }

  delete()
  {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ? <br> Qualora possibile verrà cancellato ma solo come Alunno.<br>Resterà l'anagrafica della persona."}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcAlunni.delete(Number(this.alunnoID))
        //.pipe(
          // tap( () => this.personaFormComponent.form.controls['tipoPersonaID'].setValue(12)),
          //concatMap(()=> this.personaFormComponent.save()) //non cancelliamo la persona ma impostiamo a non assegnato il tipo
        //)
        .subscribe({
          next: res=>{
            this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
            this._dialogRef.close();
          },
          // error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})

          error: err => {
            const messaggio = err?.error || 'Errore in cancellazione';
            this._snackBar.openFromComponent(SnackbarComponent, {
              data: messaggio,
              panelClass: ['red-snackbar']
            });
          }

        });
      }
    });
  }

//#endregion

//#region ----- Metodi di gestione Genitori, Famiglia e Classi -------
  
  addGenitore(){
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '650px',
      data: 0
    };

    const dialogRef = this._dialog.open(GenitoreEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        () => {
          this.loadData()
          this.genitoriDisponibiliComponent.loadData();
        }
    );
  }

  addToFamily(genitore: ALU_Genitore) {
    //devo fare una verifica prima della post:
    //per caso è già figlio? Per questo faccio una concatMap (la post deve avvenire in sequenza quando la verifica è finita)
    //ma con una condizione: la iif specifica proprio che SE il risultato della verifica è vuoto allora si può procedere con la post
    //altrimenti si mette in successione l'observable vuoto (of())
    
    this.svcAlunni.listByGenitoreAlunno(genitore.id, this.alunnoID)
    .pipe(
      concatMap( res => iif (()=> res.length == 0, this.svcAlunni.postGenitoreAlunno(genitore.id, this.alunnoID), of() ))
    ).subscribe({
      next: res=> this.genitoriFamigliaComponent.loadData(),
      error: err=> { }
    })
  }

  removeFromFamily(genitore: ALU_Genitore) {
    const alunnoID = this.alunnoID;
    this.svcAlunni.deleteByGenitoreAlunno(genitore.id, this.alunnoID).subscribe({
      next: res=> this.genitoriFamigliaComponent.loadData(),
      error: err=> { }
    })
  }

  addToAttended(classeSezioneAnno: CLS_ClasseSezioneAnnoGroup) {
    //così come ho fatto in dialog-add mi costruisco un oggetto "stile" form e lo passo alla postClasseSezioneAnnoAlunno
    //avrei potuto anche passare i valori uno ad uno, ma è già pronta così avendola usata in dialog-add
    let objClasseSezioneAnnoAlunno = {AlunnoID: this.alunnoID, ClasseSezioneAnnoID: classeSezioneAnno.id};
    const checks$ = this.svcIscrizioni.getByAlunnoAndClasseSezioneAnno(classeSezioneAnno.id, this.alunnoID)
    .pipe(
      //se trova che la stessa classe è già presente res.length è != 0 quindi non procede con la getByAlunnoAnno ma restituisce of()
      //se invece res.length == 0 dovrebbe proseguire e concatenare la verifica successiva ch è getByAlunnoAndAnno...
      //invece "test" non compare mai...quindi? sta uscendo sempre con of()?
      tap(res=> {
          if (res != null) {
            this._dialog.open(DialogOkComponent, {
              width: '320px',
              data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa classe è già stata inserita!"}
            });
          } else {
            //l'alunno non frequenta la classe a cui sto cercando di iscriverlo, posso procedere
          }
        }
      ),
      concatMap( res => iif (()=> res == null,
        this.svcIscrizioni.getByAlunnoAndAnno(classeSezioneAnno.annoID, this.alunnoID) , of() )
      ),
      tap(res=> {
        if (res != null) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "E' già stata inserita una classe in quest'anno!"}
          });
        } 
      })

    )
    checks$.pipe(
      concatMap( res => iif (()=> res == null, this.svcIscrizioni.post(objClasseSezioneAnnoAlunno) , of() )
      )
    ).subscribe({
      next: res=> { this.classiAttendedComponent.loadData() },
      error: err=> { }
    })
  }

  removeFromAttended(classeSezioneAnno: CLS_ClasseSezioneAnno) {
    let errorMsg: string;
    this.svcIscrizioni.deleteByAlunnoAndClasseSezioneAnno(classeSezioneAnno.id , this.alunnoID)
      .subscribe({
      next: res=> { this.classiAttendedComponent.loadData() },
      error: err => {this._snackBar.openFromComponent(SnackbarComponent, {data: err.error.errorMessage, panelClass: ['red-snackbar']});}
    })
  }

//#endregion

//#region ----- Eventi -------------------------

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
  }

  selectedTabValue(event: any){
    this.selectedTab = event.index;
  }

  formPersonaValidEmitted(isValid: boolean) {
    this.personaFormisValid = isValid;
  }

  formAlunnoValidEmitted(isValid: boolean) {
    this.alunnoFormisValid = isValid;
  }

  formUserValidEmitted(isValid: boolean) {
    this.userFormisValid = isValid;
  }


  selectedNomeCognome(event: MatAutocompleteSelectedEvent): void {
      this.personaID = +event.option.id;
  }
//#endregion
}



