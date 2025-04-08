//#region ----- IMPORTS ------------------------

import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild }       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }       from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA }   from '@angular/material/dialog';
import { MatSnackBar }                                from '@angular/material/snack-bar';
import { forkJoin, Observable }                       from 'rxjs';
import { debounceTime, map, switchMap, tap }          from 'rxjs/operators';
import { FormCustomValidatorsArray }                  from '../../utilities/requireMatch/requireMatch';
import { MatAutocompleteSelectedEvent }               from '@angular/material/autocomplete';

//components
import { DialogYesNoComponent }                       from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { SnackbarComponent }                          from '../../utilities/snackbar/snackbar.component';
import { DocenteFormComponent }                       from '../docente-form/docente-form.component';
import { PersonaFormComponent }                       from '../../persone/persona-form/persona-form.component';
import { UserFormComponent }                          from '../../users/user-form/user-form.component';

//services
import { LoadingService }                             from '../../utilities/loading/loading.service';
import { DocentiService }                             from '../docenti.service';
import { PersoneService }                             from '../../persone/persone.service';
import { UserService }                                from 'src/app/_user/user.service';

//models
import { PER_Docente }                                from 'src/app/_models/PER_Docente';
import { User }                                       from 'src/app/_user/Users';
import { PER_Persona }                                from 'src/app/_models/PER_Persone';

//#endregion

@Component({
  selector: 'app-docente-edit',
  templateUrl: './docente-edit.component.html',
  styleUrl: '../docenti.css'
})
export class DocenteEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  docente$!                : Observable<PER_Docente>;
  currdocente!             : User;

  public personaID!        : number;
  public userID!           : string;

  docenteNomeCognome       : string = "";
  selectedTab              : number = 0;
  personaFormisValid!      : boolean;
  docenteFormisValid!      : boolean;
  userFormisValid!         : boolean;

  isValid!                 : boolean;
  emptyForm                : boolean = false;

  breakpoint!              : number;
  breakpoint2!             : number;
  filteredPersone$!        : Observable<PER_Persona[]>;
  filteredPersoneArray!    : PER_Persona[];
  form!                    : UntypedFormGroup;
//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChild(PersonaFormComponent) personaFormComponent!       : PersonaFormComponent;
  @ViewChild(UserFormComponent) userFormComponent!             : UserFormComponent;
  @ViewChild(DocenteFormComponent) docenteFormComponent!       : DocenteFormComponent;

//#endregion

//#region ----- Constructor --------------------

  constructor(
    public _dialogRef                              : MatDialogRef<DocenteEditComponent>,
    @Inject(MAT_DIALOG_DATA) public docenteID      : number,
    private fb                                     : UntypedFormBuilder,
    private svcDocenti                             : DocentiService,
    private svcPersone                             : PersoneService,
    private svcUser                                : UserService,
    public _dialog                                 : MatDialog,
    private _snackBar                              : MatSnackBar,
    private _loadingService                        : LoadingService,
    private cdr                                    : ChangeDetectorRef
            
  ) {

    _dialogRef.disableClose = true;
    
    this.form = this.fb.group(
      {
        nomeCognomePersona: [null],
      });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    forkJoin({
      persone: this.svcPersone.list(),
      docenti: this.svcDocenti.list()
    }).subscribe(({ persone, docenti }) => {
      const docentiIDs = new Set(docenti.map(g => g.personaID));
      const personeFiltrate = persone.filter(p => !docentiIDs.has(p.id));
    
      // Imposta il validatore con persone filtrate
      this.form.controls['nomeCognomePersona'].setValidators(
        [FormCustomValidatorsArray.valueSelected(personeFiltrate)]
      );
    
      this.filteredPersone$ = this.form.controls['nomeCognomePersona'].valueChanges.pipe(
        debounceTime(300),
        switchMap(value => this.svcPersone.filterPersone(value).pipe(
          map(filtered => filtered.filter(p => !docentiIDs.has(p.id))) // Escludi i docenti
        ))
      );
    });


    if (this.docenteID && this.docenteID + '' != "0") {

      const obsdocente$: Observable<PER_Docente> = this.svcDocenti.get(this.docenteID);
      const loaddocente$ = this._loadingService.showLoaderUntilCompleted(obsdocente$);

      this.docente$ = loaddocente$
      .pipe( 
          tap(
            docente => {
              this.personaID = docente.personaID;
              //this.docenteID = docente.id SERVE???
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
              this.docenteNomeCognome = docente.persona.nome + " "+ docente.persona.cognome;
            }
          )
      );
    }
    else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {
    this.personaFormComponent.save()
    .subscribe({
      next: persona=> {
        //console.log ("docente-edit save() - subscribe...prima di docenteFormComponent.save() e userFormComponent.save() ");

        //quello che segue serve per la POST e non per la PUT
        if (this.docenteFormComponent.form.controls['personaID'].value == null) this.docenteFormComponent.form.controls['personaID'].setValue(persona.id);
        //console.log ("genitoreFormComponent.form.value", this.genitoreFormComponent.form.value);
        this.docenteFormComponent.save();


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
    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ? <br> Qualora possibile verrà cancellato ma solo come Docente.<br>Resterà l'anagrafica della persona."}
    });
    dialogRef.afterClosed().subscribe( result => {
        if(result){
          this.docenteFormComponent.delete();
          this._dialogRef.close();
        }
    });
  }
//#endregion

//#region ----- Altri metodi -------------------

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 4;
    this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  }

  formPersonaValidEmitted(isValid: boolean) {
    this.personaFormisValid = isValid;
  }

  formDocenteValidEmitted(isValid: boolean) {
   this.isValid = isValid;
   this.cdr.detectChanges();  //serve per ovviare a un ExpressionChangedAfterItHasBeenCheckedError
  }

  formUserValidEmitted(isValid: boolean) {
    this.userFormisValid = isValid;
  }

  selectedNomeCognome(event: MatAutocompleteSelectedEvent): void {
      this.personaID = +event.option.id;
  }


  selectedTabValue(event: any){
    this.selectedTab = event.index;
  }
//#endregion
}



