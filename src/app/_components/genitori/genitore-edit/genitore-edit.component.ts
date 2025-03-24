//#region ----- IMPORTS ------------------------

import { AfterViewInit, Component, EventEmitter, Inject, OnInit, Output, ViewChild }      from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                                                             from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA }                      from '@angular/material/dialog';
import { MatSnackBar }                                                                    from '@angular/material/snack-bar';
import { SnackbarComponent }                                                              from '../../utilities/snackbar/snackbar.component';
import { iif, Observable, of }                                                            from 'rxjs';
import { concatMap, debounceTime, switchMap, tap }                                                                 from 'rxjs/operators';

//components
import { AlunniListComponent }                                                            from '../../alunni/alunni-list/alunni-list.component';
import { DialogYesNoComponent }                                                           from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { PersonaFormComponent }                                                           from '../../persone/persona-form/persona-form.component';
import { AlunnoEditComponent }                                                            from '../../alunni/alunno-edit/alunno-edit.component';
import { GenitoreFormComponent }                                                          from '../genitore-form/genitore-form.component';
import { UserFormComponent }                                                              from '../../users/user-form/user-form.component';
//services
import { GenitoriService }                                                                from 'src/app/_components/genitori/genitori.service';
import { LoadingService }                                                                 from '../../utilities/loading/loading.service';
import { AlunniService }                                                                  from '../../alunni/alunni.service';
import { TipiGenitoreService }                                                            from '../tipi-genitore.service';

//models
import { ALU_Genitore }                                                                   from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni }                                                                     from 'src/app/_models/_UT_Comuni';
import { ALU_Alunno }                                                                     from 'src/app/_models/ALU_Alunno';
import { ALU_TipoGenitore }                                                               from 'src/app/_models/ALU_Tipogenitore';
import { UserService } from 'src/app/_user/user.service';
import { PersoneService } from '../../persone/persone.service';
import { FormCustomValidatorsArray } from '../../utilities/requireMatch/requireMatch';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';


//#endregion

@Component({
  selector: 'app-genitore-edit',
  templateUrl: './genitore-edit.component.html',
  styleUrls: ['./../genitori.css'],
  standalone: false
})

export class GenitoreEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  genitore$!               : Observable<ALU_Genitore>;
  obsTipiGenitore$!        : Observable<ALU_TipoGenitore[]>;
  filteredComuni$!         : Observable<_UT_Comuni[]>;
  filteredComuniNascita$!  : Observable<_UT_Comuni[]>;

  public personaID!        : number;
  public userID!           : string;
  genitoreNomeCognome      : string = "";

  personaFormisValid!      : boolean;
  genitoreFormisValid!     : boolean;

  emptyForm                : boolean = false;
  loading                  : boolean = true;

  comuniIsLoading          : boolean = false;
  comuniNascitaIsLoading   : boolean = false;
  breakpoint!              : number;
  selectedTab              : number = 0;
  filteredPersone$!        : Observable<PER_Persona[]>;
  filteredPersoneArray!    : PER_Persona[];
    form!                  : UntypedFormGroup;
  
    
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('alunniFamiglia') alunniFamigliaComponent!: AlunniListComponent; 
  @ViewChild(PersonaFormComponent) personaFormComponent!: PersonaFormComponent; 
  @ViewChild(UserFormComponent) userFormComponent!: UserFormComponent; 
  @ViewChild(GenitoreFormComponent) genitoreFormComponent!: GenitoreFormComponent; 

//#endregion

//#region ----- Constructor --------------------
  constructor(public _dialogRef                                : MatDialogRef<GenitoreEditComponent>,
              @Inject(MAT_DIALOG_DATA) public genitoreID       : number,
              private fb                                       : UntypedFormBuilder,
              private svcGenitori                              : GenitoriService,
              private svcUser                                  : UserService,
              private svcPersone                               : PersoneService,
              private svcAlunni                                : AlunniService, //serve perchè è in questa che si trovano le addToFamily e RemoveFromFamily"
              public _dialog                                   : MatDialog,
              private _snackBar                                : MatSnackBar,
              private _loadingService :                   LoadingService) {

    _dialogRef.disableClose = true;

    this.form = this.fb.group(
    {
    nomeCognomePersona: [null],
    });

    //this.obsTipiGenitore$ = this.svcTipiGenitore.list();
  }

//#endregion 

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){



        this.svcPersone.list().subscribe(persone => {
          this.form.controls['nomeCognomePersona'].setValidators(
            [FormCustomValidatorsArray.valueSelected(persone)]
          );
        })
    
        this.filteredPersone$ = this.form.controls['nomeCognomePersona'].valueChanges
          .pipe(
            debounceTime(300),
            switchMap(() => this.svcPersone.filterPersone(this.form.value.nomeCognomePersona)),
          );



    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    
    if (this.genitoreID && this.genitoreID + '' != "0") {
      const obsGenitore$: Observable<ALU_Genitore> = this.svcGenitori.get(this.genitoreID);
      const loadGenitore$ = this._loadingService.showLoaderUntilCompleted(obsGenitore$);
      this.genitore$ = loadGenitore$
      .pipe(
          tap(
            genitore => {
              this.personaID = genitore.personaID;
              // console.log("genitore-edit - loadData - this.personaID", this.personaID);
              this.svcUser.getByPersonaID(this.personaID).subscribe(user=> {
                //l'utente potrebbe non esserci (nuovo record ma anche utente senza user)
                if (user) {
                  // console.log ("genitore-edit - loadData - user",user);
                  this.userID = user.id;
                } else {
                  this.userID = '';
                }
              });
              this.genitoreNomeCognome = genitore.persona.nome + " "+ genitore.persona.cognome;
              // this.form.patchValue(genitore);
            }
          )
      );
    } 
    else this.emptyForm = true
  }  

//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {
      this.personaFormComponent.save()
      //.pipe(
        //tap(persona => {
          //console.log ("genitore-edit save() - questo è persona dopo save di personaForm", persona)
          //if (this.genitoreFormComponent.form.controls['personaID'].value == null) this.genitoreFormComponent.form.controls['personaID'].setValue(persona.id);
          //if (this.userFormComponent.form.controls['personaID'].value == null) this.userFormComponent.form.controls['personaID'].setValue(persona.id);
        //}),
        //concatMap( () => this.genitoreFormComponent.save())
      //)
      .subscribe({
        next: res=> {
          console.log ("genitore-edit save() - subscribe...prima di genitoreFormComponent.save() ");
          console.log ("genitoreFormComponent.form.value", this.genitoreFormComponent.form.value);

          // if (this.genitoreFormComponent.form.controls['personaID'].value == null) this.genitoreFormComponent.form.controls['personaID'].setValue(this.personaID);
          // if (this.userFormComponent.form.controls['personaID'].value == null) this.userFormComponent.form.controls['personaID'].setValue(this.personaID);


          this.genitoreFormComponent.save();

          console.log ("userFormComponent.form.value", this.userFormComponent.form.value);

          this.userFormComponent.save();
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      });
  }

  delete()
  {
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });

    dialogRef.afterClosed().subscribe( result => {
      if(result) {
        this.svcGenitori.delete(Number(this.genitoreID))
        .pipe(
          //tap( () => this.personaFormComponent.form.controls['tipoPersonaID'].setValue(12)),
          //concatMap(()=> this.personaFormComponent.save()) //non cancelliamo la persona ma impostiamo a non assegnato il tipo
        ).subscribe({
          next: res=>{
            this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
            this._dialogRef.close();
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
        });
      }
    });
  }
//#endregion

//#region ----- Metodi di gestione Genitori, Famiglia e Classi -------

  addAlunno() 
  {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '850px',
      height: '650px',
      data: 0
    };

    const dialogRef = this._dialog.open(AlunnoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
        () => this.loadData()
    );
  }

  addToFamily(figlio: ALU_Alunno) {
    //devo fare una verifica prima della post:
    //per caso è già figlio? Per questo faccio una concatMap (la post deve avvenire in sequenza quando la verifica è finita)
    //ma con una condizione: la iif specifica proprio che SE il risultato della verifica è vuoto allora si può procedere con la post
    //altrimenti si mette in successione l'observable vuoto (of())
    
    this.svcAlunni.listByGenitoreAlunno(this.genitoreID, figlio.id)
    .pipe(
      concatMap( res => iif (()=> res.length == 0, this.svcAlunni.postGenitoreAlunno(this.genitoreID, figlio.id), of() )
      )
    ).subscribe({
      next: res=> this.alunniFamigliaComponent.loadData(),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    })
  }

  removeFromFamily(figlio: ALU_Alunno) {
    //devo fare una verifica prima della post:
    //per caso è già figlio? In teoria dovremmo aver nascosto il genitore dalla lista da cui pescare, no?
    const genitoreID = this.genitoreID;
    this.svcAlunni.deleteByGenitoreAlunno(genitoreID, figlio.id).subscribe({
      next: res=> this.alunniFamigliaComponent.loadData(),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
    })
  }
//#endregion

//#region ----- Altri metodi -------
  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 3;
  }

  selectedTabValue(event: any){
    this.selectedTab = event.index;
  }

  formPersonaValidEmitted(isValid: boolean) {
    this.personaFormisValid = isValid;
  }

  formGenitoreValidEmitted(isValid: boolean) {
    this.genitoreFormisValid = isValid;
  }

  formUserValidEmitted(isValid: boolean) {
    this.genitoreFormisValid = isValid;
  }


    selected(event: MatAutocompleteSelectedEvent): void {
  
      //come approccio alternativo all'uso di un customformvalidator vorrei fare come in 
      //https://stackblitz.com/edit/mat-autocomplete-force-selection-of-option?file=src%2Fapp%2Fautocomplete-auto-active-first-option-example.ts 
      //sembra infatti molto più "diretto" e "semplice" MA....come lo propone lui su ngAfterViewInit ...NON FUNZIONA CASSO! quindi lo metto qui che non è il massimo
  
      //***NC 25.12.22 ***/
      // this.form.controls['personaID'].setValue(event.option.id);
      // //vado a pescare la mail della persona selezionata
      // const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(event.option.id);
      //   const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);
      //   this.persona$ = loadPersona$
      //   .pipe( 
      //       tap(
      //         persona => {this.form.controls['email'].setValue(persona.email);}
      //       )
      //   );
      //   this.persona$.subscribe();
      
    }
  
//#endregion
}
