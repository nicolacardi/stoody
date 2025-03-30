//#region ----- IMPORTS ------------------------

import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild }       from '@angular/core';
import { Form, FormGroup, UntypedFormBuilder, UntypedFormGroup }       from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA }   from '@angular/material/dialog';
import { MatSnackBar }                                from '@angular/material/snack-bar';
import { Observable, firstValueFrom }                 from 'rxjs';
import { shareReplay, tap }                           from 'rxjs/operators';
import { MatExpansionPanel }                          from '@angular/material/expansion';

//components
import { PersonaFormComponent }                       from '../persona-form/persona-form.component';
import { GenitoreFormComponent }                      from '../../genitori/genitore-form/genitore-form.component';
import { AlunnoFormComponent }                        from '../../alunni/alunno-form/alunno-form.component';
import { DocenteFormComponent }                       from '../../docenti/docente-form/docente-form.component';
import { NonDocenteFormComponent }                    from '../../nondocenti/nondocente-form/nondocente-form.component';
import { UserFormComponent }                          from '../../users/user-form/user-form.component';
import { DirigenteFormComponent }                     from '../../dirigenti/dirigente-form/dirigente-form.component';

import { DialogYesNoComponent }                       from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent }                          from '../../utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                          from '../../utilities/snackbar/snackbar.component';
import { Utility }                                    from '../../utilities/utility.component';


//services
import { LoadingService }                             from '../../utilities/loading/loading.service';
import { PersoneService }                             from '../persone.service';
import { TipiPersonaService }                         from '../tipi-persona.service';
import { AlunniService }                              from '../../alunni/alunni.service';
import { GenitoriService }                            from '../../genitori/genitori.service';
import { DocentiService }                             from '../../docenti/docenti.service';
import { NonDocentiService }                          from '../nondocenti.service';

import { UserService }                                from 'src/app/_user/user.service';

//models
import { PER_Persona, PER_TipoPersona }               from 'src/app/_models/PER_Persone';
import { User }                                       from 'src/app/_user/Users';
import { DirigentiService }                           from '../../dirigenti/dirigenti.service';



export interface Variabili {
  showForm: { get: () => boolean; set: (value: boolean) => void };
  isValid: { get: () => boolean; set: (value: boolean) => void };
  formComponent: { get: () => Component; set: (value: Component) => void };
  panel: { get: () => MatExpansionPanel; set: (value: MatExpansionPanel) => void };
  id: { get: () => number; set: (value: number) => void };
}

//#endregion

@Component({
  selector: 'app-persona-edit',
  templateUrl: './persona-edit.component.html',
  styleUrls: ['../persone.css']
})
export class PersonaEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  form!                       : UntypedFormGroup;
  public userID!              : string;
  currUser!                   : User;
  persona$!                   : Observable<PER_Persona>;
  persona!                    : PER_Persona;
  obsTipiPersona$!            : Observable<PER_TipoPersona[]>;
  _lstRoles!                  : string[];
  selectedRoles               : number[] = []

  userFormisValid!            : boolean;
  personaFormisValid!         : boolean;
  alunnoFormisValid!          : boolean;
  genitoreFormisValid!        : boolean;
  docenteFormisValid!         : boolean;
  nonDocenteFormisValid!      : boolean;
  dirigenteFormisValid!       : boolean;



  showGenitoreForm            : boolean = false;
  showAlunnoForm              : boolean = false;
  showUserForm                : boolean = false;
  showDocenteForm             : boolean = false;
  showNonDocenteForm          : boolean = false;
  showDirigenteForm           : boolean = false;

  alunnoID!                   : number;
  genitoreID!                 : number;
  docenteID!                  : number;
  nondocenteID!               : number;
  dirigenteID!                : number;

  emptyForm                   : boolean = false;
  disabledSave                : boolean = false;
  ckMostraAggiunte            : boolean = false;
  ruoli = ['Alunno', 'Genitore', 'Docente', 'NonDocente', 'Dirigente'];


  
//#endregion

 //#region ----- ViewChild Input Output ---------
  //[static false servirebbe a consentire un riferimento a appalunnoform anche se non è stato caricato ancora]
    @ViewChild(PersonaFormComponent) personaFormComponent!        : PersonaFormComponent;
    @ViewChild(AlunnoFormComponent) alunnoFormComponent!          : AlunnoFormComponent;
    @ViewChild(UserFormComponent) userFormComponent!              : UserFormComponent;
    @ViewChild(GenitoreFormComponent) genitoreFormComponent!      : GenitoreFormComponent;
    @ViewChild(DocenteFormComponent) docenteFormComponent!        : DocenteFormComponent;
    @ViewChild(NonDocenteFormComponent) nondocenteFormComponent!  : NonDocenteFormComponent;
    @ViewChild(DirigenteFormComponent) dirigenteFormComponent!    : DirigenteFormComponent;


    @ViewChild('genitorePanel') genitorePanel!: MatExpansionPanel;
    @ViewChild('alunnoPanel') alunnoPanel!: MatExpansionPanel;
    @ViewChild('docentePanel') docentePanel!: MatExpansionPanel;
    @ViewChild('nondocentePanel') nondocentePanel!: MatExpansionPanel;
    @ViewChild('dirigentePanel') dirigentePanel!: MatExpansionPanel;


    //#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<PersonaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public personaID: number,
              private fb:                       UntypedFormBuilder, 
              private svcPersone:               PersoneService,
              private svcUser:                  UserService,
              private svcAlunni:                AlunniService,
              private svcGenitori:              GenitoriService,
              private svcDocenti:               DocentiService,
              private svcNonDocenti:            NonDocentiService,
              private svcDirigenti:             DirigentiService,

              private svcTipiPersona:           TipiPersonaService,

              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private _loadingService :         LoadingService,
              private cdr: ChangeDetectorRef  
            ) {

    _dialogRef.disableClose = true;
    
    this.obsTipiPersona$ = this.svcTipiPersona.list();

    this.form = this.fb.group({
      _lstRoles:                                [[]],
    });

    this.currUser = Utility.getCurrentUser();
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.loadData();

  }

  async loadData(){
    this.ckMostraAggiunte = false;
    //console.log ("persona-edit loadData");
    if (this.personaID && this.personaID + '' != "0") {

      await firstValueFrom(this.svcUser.getByPersonaID(this.personaID).pipe(tap(user=> {
        if (user) {
          this.userID = user.id; this.showUserForm = true;
        } else {
          this.userID = '';
        }
      })));

      const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(this.personaID);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);

      this.persona$ = loadPersona$
      .pipe( 
          tap(
            persona => {
              // console.log("persona-edit loadData - persona", persona);
              this.personaID = persona.id
              this.persona = persona
              this._lstRoles = persona._LstRoles!;

              if (persona._LstRoles!.includes('Alunno')) { 
                this.svcAlunni.getByPersona(this.persona.id).subscribe(alunno=>{this.alunnoID= alunno.id; this.showAlunnoForm = true; });
              } else {this.showAlunnoForm = false;}
              if (persona._LstRoles!.includes('Genitore')) {
                this.svcGenitori.getByPersona(this.persona.id).subscribe(genitore=> {this.genitoreID= genitore.id; this.showGenitoreForm = true });
              }  else {this.showGenitoreForm = false;}
              if (persona._LstRoles!.includes('Docente')) {
                this.svcDocenti.getByPersona(this.persona.id).subscribe(docente=> {this.docenteID= docente.id; this.showDocenteForm = true});
              }  else {this.showDocenteForm = false;}
              if (persona._LstRoles!.includes('NonDocente')) {
                this.svcNonDocenti.getByPersona(this.persona.id).subscribe(nondocente=> {this.nondocenteID= nondocente.id; this.showNonDocenteForm = true});
              }   else {this.showNonDocenteForm = false;}
              if (persona._LstRoles!.includes('Dirigente')) {
               this.svcDirigenti.getByPersona(this.persona.id).subscribe(dirigente=> {this.dirigenteID= dirigente.id; this.showDirigenteForm = true});
              }  else {this.showDirigenteForm = false;}
            }
          ),
          shareReplay(1)   //serve perchè la tap per qualche motivo veniva chiamata DUE volte e quindi popolava la multiple combo due volte!!!
      );
    }
    else 
      this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ----------------

  save()
  {
    this.personaFormComponent.save().subscribe({
      next: persona=> {
        //console.log ("genitore-edit save() - subscribe...prima di genitoreFormComponent.save() e userFormComponent.save() ");
        //quello che segue serve per la POST e non per la PUT
        if (this.showGenitoreForm) {
          if (this.genitoreFormComponent.form.controls['personaID'].value == null) this.genitoreFormComponent.form.controls['personaID'].setValue(persona.id);
          // console.log ("genitoreFormComponent.form.value", this.genitoreFormComponent.form.value);
          this.genitoreFormComponent.save();
        }
        if (this.showDocenteForm) {
          if (this.docenteFormComponent.form.controls['personaID'].value == null) this.docenteFormComponent.form.controls['personaID'].setValue(persona.id);
          //console.log ("docenteFormComponent.form.value", this.docenteFormComponent.form.value);
          this.docenteFormComponent.save();
        }
        if (this.showNonDocenteForm) {
          if (this.nondocenteFormComponent.form.controls['personaID'].value == null) this.nondocenteFormComponent.form.controls['personaID'].setValue(persona.id);
          //console.log ("nondocenteFormComponent.form.value", this.nondocenteFormComponent.form.value);
          this.nondocenteFormComponent.save();
        }
        if (this.showAlunnoForm) {
          if (this.alunnoFormComponent.form.controls['personaID'].value == null) this.alunnoFormComponent.form.controls['personaID'].setValue(persona.id);
          //console.log ("alunnoFormComponent.form.value", this.alunnoFormComponent.form.value);
          this.alunnoFormComponent.save();
        }
        if (this.showDirigenteForm) {
          if (this.dirigenteFormComponent.form.controls['personaID'].value == null) this.dirigenteFormComponent.form.controls['personaID'].setValue(persona.id);
          //console.log ("dirigenteFormComponent.form.value", this.alunnoFormComponent.form.value);
          this.dirigenteFormComponent.save();
        }
        //quello che segue serve per la POST e non per la PUT
        if (this.showUserForm) {
          if (this.userFormComponent.form.controls['personaID'].value == null) this.userFormComponent.form.controls['personaID'].setValue(persona.id);
          if (this.userFormComponent.form.controls['userName'].value == null) this.userFormComponent.form.controls['userName'].setValue(this.userFormComponent.form.controls['email'].value);
          if (this.userFormComponent.form.controls['password'].value == null) this.userFormComponent.form.controls['password'].setValue(1234);
          //console.log ("userFormComponent.form.value", this.userFormComponent.form.value);

          this.userFormComponent.save();
        }

        this._dialogRef.close();

        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      error: ()=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    })
  }




  delete()
  {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });

    dialogYesNo.afterClosed().subscribe( result => {
      if(result){
        if( this.persona._LstRoles!.length != 0) {
          let lstRolesstr = this.persona._LstRoles!.join(', ');
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa persona non si può cancellare: <br>è "+ lstRolesstr}
          });
          return;
        }
        this.personaFormComponent.delete()
        .subscribe( {
          next: res=> { 
            this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
            this._dialogRef.close();
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
        });
      }
    });
  }
//#endregion



  
//#region ----- AGGIUNTE ------------------------


  aggiungiDerivato(Derivato: string, personaID: number) {
    // const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
    //   width: '320px',
    //   data: {titolo: "AGGIUNTA RUOLO", sottoTitolo: "Si conferma l'aggiunta del ruolo di <br>"+Derivato+"?"}
    // });
    
    // dialogYesNo.afterClosed().subscribe( result => {
    // if(result){

      switch (Derivato) {
        // case 'Persona':
        //   this.personaForm = true;
        //   break;
        case 'User':
          this.showUserForm = true;
          this.cdr.detectChanges();
          
          break;
        case 'Alunno':
          this.showAlunnoForm = true;
          this.cdr.detectChanges();
          this.alunnoPanel.toggle();
          break;
        case 'Genitore':
          this.showGenitoreForm = true;
          this.cdr.detectChanges();
          this.genitorePanel.toggle();
          break;
        case 'Docente':
          this.showDocenteForm = true;
          this.cdr.detectChanges();
          this.docentePanel.toggle();
          break;
        case 'NonDocente':
          this.showNonDocenteForm = true;
          this.cdr.detectChanges();
          this.nondocentePanel.toggle();
          break;
        case 'Dirigente':
          this.showDirigenteForm = true;
          this.cdr.detectChanges();
          this.dirigentePanel.toggle();
          break;
        default:
          console.warn('Unknown form type');
      
      }

    // }});
  }

//#endregion

//#region ----- RIMOZIONI ------------------------

  rimuoviDerivato(Derivato: string, personaID: number) {
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "RIMOZIONE RUOLO", sottoTitolo: "Si conferma la cancellazione del ruolo di <br>"+Derivato+"? <br> Qualora possibile verrà cancellato ma solo in quanto "+Derivato+".<br>Resterà l'anagrafica della persona."}
    });
    
    dialogYesNo.afterClosed().subscribe( result => {
    if(result){

      switch (Derivato) {
        // case 'Persona':
        //   this.personaForm = true;
        //   break;
        // case 'User':
        //   this.userFormComponent.delete();  //DELICATISSIMO...forse meglio disabilitare per il momento
        //   this.showUserForm = true;
        //   break;
        case 'Alunno':
          this.alunnoFormComponent.delete();
          this.showAlunnoForm = false;
          this.alunnoFormisValid = true;
          break;
        case 'Genitore':
          this.genitoreFormComponent.delete();
          this.showGenitoreForm = false;
          this.genitoreFormisValid = true;
          break;
        case 'Docente':
          this.docenteFormComponent.delete();
          this.showDocenteForm = false;
          this.docenteFormisValid = true;
          break;
        case 'NonDocente':
          this.nondocenteFormComponent.delete();
          this.showNonDocenteForm = false;
          this.nonDocenteFormisValid = true;
          break;
        case 'Dirigente':
          this.dirigenteFormComponent.delete();
          this.showDirigenteForm = false;
          this.dirigenteFormisValid = true;
          break;
        default:
          console.warn('valore Derivato sconosciuto');
      
      }

      this.disabledSaveGetter();
    }});
  }



//#endregion

//#region ----- DISABLEDSAVE ------------------------

  formValidEmitted(Derivato: string, isValid: boolean) {

    switch (Derivato) {
      case 'Persona':
        this.personaFormisValid = isValid;

        break;
      case 'User':
        this.userFormisValid = isValid;
        break;
      case 'Alunno':
        this.alunnoFormisValid = isValid;
        break;
      case 'Genitore':
        this.genitoreFormisValid = isValid;
        break;
      case 'Docente':
        this.docenteFormisValid = isValid;
        break;
      case 'NonDocente':
        this.nonDocenteFormisValid = isValid;
        break;
      case 'Dirigente':
        this.dirigenteFormisValid = isValid;
        break;
      default:
        console.warn('Unknown form type');
    }

    this.disabledSaveGetter();
  }

  disabledSaveGetter() {
    let personaFormValid = this.personaFormisValid ?? true;
    let alunnoFormValid = this.alunnoFormisValid ?? true;
    let genitoreFormValid = this.genitoreFormisValid ?? true;
    let docenteFormValid = this.docenteFormisValid ?? true;
    let nonDocenteFormValid = this.nonDocenteFormisValid ?? true;
    let dirigenteFormValid = this.dirigenteFormisValid ?? true;

                        setTimeout(() => {  //BRUTTO MA EFFICACE X CONTRASTARE L'EXPRESSIONCHANGEDAFTERITWASCHECKED
                          this.disabledSave = !personaFormValid || 
                          !alunnoFormValid || 
                          !genitoreFormValid || 
                          !docenteFormValid || 
                          !nonDocenteFormValid || 
                          !dirigenteFormValid;
                      }, 0);

    // console.log("Valore di disabledSave aggiornato:", this.disabledSave);

    // console.log ("*******persona-edit - disableSave", this.disabledSave);
    // console.log ("personaFormValid", personaFormValid);
    // console.log ("alunnoFormValid", alunnoFormValid);
    // console.log ("genitoreFormValid", genitoreFormValid);
    // console.log ("docenteFormValid", docenteFormValid);
    // console.log ("nondocenteFormValid", nonDocenteFormValid);
    // console.log ("dirigenteFormValid", dirigenteFormValid);
  }

  // changedCkAttivoPersona (ckAttivoPersona: boolean) {
  //   console.log (" persona-edit - changedckAttivoPersona - arrivato ckAttivoPersona", ckAttivoPersona);
  //   if (!ckAttivoPersona) {
  //     this._dialog.open(DialogOkComponent, {
  //       width: '320px',
  //       data: { titolo: "ATTENZIONE!", sottoTitolo: "Il flag 'attivo' di tutti i ruoli <br>di questa persona<br>verrà tolto" }
  //     });
  //     //devo disabilitare il ckjAttivo di tutti i form Derivati
  //     if (this.alunnoFormComponent) this.alunnoFormComponent.form.controls['ckAttivo'].setValue (false);
  //     if (this.genitoreFormComponent) this.genitoreFormComponent.form.controls['ckAttivo'].setValue (false);
  //     if (this.docenteFormComponent) this.docenteFormComponent.form.controls['ckAttivo'].setValue (false);
  //     if (this.nondocenteFormComponent) this.nondocenteFormComponent.form.controls['ckAttivo'].setValue (false);
  //     if (this.dirigenteFormComponent) this.dirigenteFormComponent.form.controls['ckAttivo'].setValue (false);      

  //   }
  // }


  changedCkAttivoPersona(ckAttivoPersona: boolean) {
    console.log("persona-edit - changedckAttivoPersona - arrivato ckAttivoPersona", ckAttivoPersona);
    
    if (!ckAttivoPersona) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: { titolo: "ATTENZIONE!", sottoTitolo: "Il flag 'attivo' di tutti i ruoli <br>di questa persona<br>verrà tolto" }
      });
  
      // Cicla su tutti i ruoli per disabilitare 'ckAttivo' in ogni form
      this.ruoli.forEach(ruolo => {
        const variabili = this.getVariabili(ruolo);
        if (variabili && variabili.formComponent) {
          variabili.formComponent.form.controls['ckAttivo'].setValue(false);
        }
      });
    }
  }



  mostraAggiunte() {

    this.ckMostraAggiunte = !this.ckMostraAggiunte;

    if (!this.ckMostraAggiunte) {
      this.ruoli.forEach(ruolo => {
        const variabili = this.getVariabili(ruolo);
        if (variabili && !variabili.id.get()) {
          variabili.isValid.set(true);
          variabili.showForm.set(false);
        }
      });
  
      this.disabledSaveGetter();
    }
  }

  
    // Funzione getVariabili
    getVariabili(tipo: string): Variabili | null {
      const variabili: Record<'Alunno' | 'Genitore' | 'Docente' | 'NonDocente' | 'Dirigente', Variabili> = {
        'Alunno': {
          showForm: { get: () => this.showAlunnoForm, set: (value) => this.showAlunnoForm = value },
          isValid: { get: () => this.alunnoFormisValid, set: (value) => this.alunnoFormisValid = value },
          formComponent: { get: () => this.alunnoFormComponent, set: (value) => this.alunnoFormComponent = value },
          panel: { get: () => this.alunnoPanel, set: (value) => this.alunnoPanel = value },
          id: { get: () => this.alunnoID, set: (value) => this.alunnoID = value }
        },
        'Genitore': {
          showForm: { get: () => this.showGenitoreForm, set: (value) => this.showGenitoreForm = value },
          isValid: { get: () => this.genitoreFormisValid, set: (value) => this.genitoreFormisValid = value },
          formComponent: { get: () => this.genitoreFormComponent, set: (value) => this.genitoreFormComponent = value },
          panel: { get: () => this.genitorePanel, set: (value) => this.genitorePanel = value },
          id: { get: () => this.genitoreID, set: (value) => this.genitoreID = value }
        },
        'Docente': {
          showForm: { get: () => this.showDocenteForm, set: (value) => this.showDocenteForm = value },
          isValid: { get: () => this.docenteFormisValid, set: (value) => this.docenteFormisValid = value },
          formComponent: { get: () => this.docenteFormComponent, set: (value) => this.docenteFormComponent = value },
          panel: { get: () => this.docentePanel, set: (value) => this.docentePanel = value },
          id: { get: () => this.docenteID, set: (value) => this.docenteID = value }
        },
        'NonDocente': {
          showForm: { get: () => this.showNonDocenteForm, set: (value) => this.showNonDocenteForm = value },
          isValid: { get: () => this.nonDocenteFormisValid, set: (value) => this.nonDocenteFormisValid = value },
          formComponent: { get: () => this.nondocenteFormComponent, set: (value) => this.nondocenteFormComponent = value },
          panel: { get: () => this.nondocentePanel, set: (value) => this.nondocentePanel = value },
          id: { get: () => this.nondocenteID, set: (value) => this.nondocenteID = value }
        },
        'Dirigente': {
          showForm: { get: () => this.showDirigenteForm, set: (value) => this.showDirigenteForm = value },
          isValid: { get: () => this.dirigenteFormisValid, set: (value) => this.dirigenteFormisValid = value },
          formComponent: { get: () => this.dirigenteFormComponent, set: (value) => this.dirigenteFormComponent = value },
          panel: { get: () => this.dirigentePanel, set: (value) => this.dirigentePanel = value },
          id: { get: () => this.dirigenteID, set: (value) => this.dirigenteID = value }
        }
      };
    
      // Controlla se 'tipo' è un valore valido prima di restituire le variabili
      if (variabili.hasOwnProperty(tipo)) {
        return variabili[tipo as 'Alunno' | 'Genitore' | 'Docente' | 'NonDocente' | 'Dirigente'];
      } else {
        return null;  // Restituisce null se 'tipo' non è valido
      }
    }
    
  
  
  
  
  
  

}

//#endregion


  // getCurrentForm(role:string): any {
  //   switch (role) {
  //     case "Alunno":
  //       return this.alunnoFormComponent ? this.alunnoFormComponent.form : null;
  //     case "Genitore":
  //       return this.genitoreFormComponent ? this.genitoreFormComponent.form : null;
  //     case "Docente":
  //       return this.docenteFormComponent ? this.docenteFormComponent.form : null;
  //     case "NonDocente":
  //       return this.nondocenteFormComponent ? this.nondocenteFormComponent.form : null;
  //     case "Dirigente":
  //       return this.dirigenteFormComponent ? this.dirigenteFormComponent.form : null;
  //     default:
  //       return null;
  //   }
  // }



//#region ----- NON USATI -------------------

  // onResize(event: any) {
  //   this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 4;
  //   this.breakpoint2 = (event.target.innerWidth <= 800) ? 2 : 4;
  // }



  // formPersonaChangedRolesEmitted () {
  //   console.log("passo di qua");
  //   //in questo modo quando si cambia il ruolo viene emesso un emit e si impostano i valori a true o false
  //   //ma se sono in edit di una persona??????questo va bene se faccio un nuovo alunno o nuovo genitore!
  //   if (this.genitoreFormComponent) this.genitoreFormIsValid = this.genitoreFormComponent.form.valid;
  //   if (this.alunnoFormComponent) this.alunnoFormIsValid = this.alunnoFormComponent.form.valid;
  // }

  // updateDisableSave () {
  //   this.tmpN++;
  //   console.log (this.tmpN, "updateDisableSave");
  // }

//#endregion



// refreshSaveDisableOLD(){
//   //è stato emesso il refreshSaveDisable in seguito a modifica di uno dei form
//   //questa routine aggiorna la disable del pulsante save
//   //console.log("persona-edit - refreshSaveDisable");
//   let personaFormValid = true;
//   let alunnoFormValid = true;
//   let genitoreFormValid = true;
//   let docenteFormValid = true;
//   let nonDocenteFormValid = true;
//   let dirigenteFormValid = true;

//   //if (this.personaFormComponent) 
//     this.personaFormisValid!=undefined?personaFormValid = this.personaFormisValid : null;

//   //if (this.showAlunnoForm && this.alunnoFormComponent) 
//   this.alunnoFormisValid!=undefined?alunnoFormValid = this.alunnoFormisValid : null

//   //if (this.showGenitoreForm && this.genitoreFormComponent) 
//   this.genitoreFormisValid!=undefined?genitoreFormValid = this.genitoreFormisValid : null
  
//   //if (this.showDocenteForm && this.docenteFormComponent) 
//   this.docenteFormisValid!=undefined?docenteFormValid = this.docenteFormisValid : null
  
//   //if (this.showNonDocenteForm && this.nondocenteFormComponent)
//   this.nonDocenteFormisValid!=undefined?nonDocenteFormValid = this.nonDocenteFormisValid : null


//   //if (this.showDirigenteForm && this.dirigenteFormComponent) 
//   this.dirigenteFormisValid!=undefined?dirigenteFormValid = this.dirigenteFormisValid : null

//   // this.disabledSave = !personaFormValid || !alunnoFormValid || !genitoreFormValid || !docenteFormValid || !nonDocenteFormValid|| !dirigenteFormValid;

//   setTimeout(() => {
//     console.log("Valore di disabledSave aggiornato:");
//     this.disabledSave = !personaFormValid || !alunnoFormValid || !genitoreFormValid || !docenteFormValid || !nonDocenteFormValid|| !dirigenteFormValid;
//   }, 0);

//   console.log ("*******persona-edit - disableSave", this.disabledSave);
//   console.log ("personaFormValid", personaFormValid);
//   console.log ("alunnoFormValid", alunnoFormValid);
//   console.log ("genitoreFormValid", genitoreFormValid);
//   console.log ("docenteFormValid", docenteFormValid);
//   console.log ("nondocenteFormValid", nonDocenteFormValid);
//   console.log ("dirigenteFormValid", dirigenteFormValid);
// }
// }




  // saveRoles() {
    //parallelamente alla save (put o post che sia) della persona bisogna occuparsi di inserire i diversi ruoli
    //ALU_Alunno
    //ALU_Genitore
    //PER_Docente
    //PER_DocenteCoord - per questo una modalità diversa
    //PER_NonDocente
    //PER_Dirigente
    //PER_ITManager

    // let selectedRolesIds = []
    // if (this.form.controls['_lstRoles'].value.length != 0) selectedRolesIds = this.form.controls['_lstRoles'].value;
    //   const selectedRolesDescrizioni = selectedRolesIds.map((tipo:any) => {const tipoPersona = this.lstTipiPersona.find(tp => tp.id === tipo);
    //   return tipoPersona ? tipoPersona.descrizione : ''; // Restituisce la descrizione se trovata, altrimenti una stringa vuota
    // });

    /*
    console.log("this._lstRoles - quello che attualmente c'è in db",this._lstRoles);
    console.log ("this.form.controls['_lstRoles'].value.length - quanti ruoli l'utente ha selezionato", this.form.controls['_lstRoles'].value.length);
    console.log("this.form.controls['_lstRoles'].value - quello che l'utente ha selezionato",this.form.controls['_lstRoles'].value);
    console.log("elenco dei valori selezionati dall'utente",selectedRolesDescrizioni);
    */

    /*
    if (this._lstRoles) { //se ci sono ruoli già assegnati in db per questa persona vado a cancellare i lstRoles attualmente presenti se non sono più selezionati
      this._lstRoles.forEach(async roleinput=> {
        {
          if (!selectedRolesDescrizioni.includes(roleinput)) {
            switch (roleinput) {
              case "Alunno":
                this.svcAlunni.deleteByPersona(this.personaID).subscribe();
              break;
              case "Genitore":
                this.svcGenitori.deleteByPersona(this.personaID).subscribe();
              break;
              case "Docente":
                this.svcDocenti.deleteByPersona(this.personaID).subscribe();
              break;
              case "DocenteCoord":
                let docente!: PER_Docente;
                await firstValueFrom(this.svcDocenti.getByPersona(this.personaID).pipe(tap(docenteEstratto => 
                  {docente = docenteEstratto})));
                this.svcDocentiCoord.deleteByDocente(docente.id);
                break;
              case "NonDocente":
                this.svcNonDocenti.deleteByPersona(this.personaID).subscribe();
              break;
              case "Dirigente":
                this.svcDirigenti.deleteByPersona(this.personaID).subscribe();
              break;
              case "ITManager":
                this.svcITManagers.deleteByPersona(this.personaID).subscribe();
              break;
            }
          }
        }
      });
    }
      */

    //ora vado a vedere se ne sono stati aggiunti quindi faccio il check inverso, però attenzione manca la put in questo modo c'è solo la post di un nuovo ruolo!
    //ma se uno modifica senza cambiare i ruoli? manca un pezzo
    // selectedRolesDescrizioni.forEach(async (roleselected:string)=> {
    //   {

    //       const currentForm = this.getCurrentForm(roleselected);
    //       console.log ("persona.ID", this.personaID);

    //       let formData = {
    //         ...currentForm.value, // Ottiene tutti i valori del form selezionato
    //         personaID: this.personaID
    //       };

    //       console.log ("adesso faccio post o put del formData per ", roleselected, formData);
    //       switch (roleselected) {
    //         case "Alunno":
    //           //this._lstRoles.includes(roleselected)? this.svcAlunni.put(formData).subscribe() : this.svcAlunni.post(formData).subscribe();
    //           this.alunnoFormComponent.save();
    //           break;
    //         case "Genitore":
    //           //this._lstRoles.includes(roleselected)? this.svcGenitori.put(formData).subscribe() : this.svcGenitori.post(formData).subscribe();
    //           this.genitoreFormComponent.save();
    //           break;
    //         case "Docente":
    //           //this._lstRoles.includes(roleselected)? this.svcDocenti.put(formData).subscribe() : this.svcDocenti.post(formData).subscribe();  
    //           this.docenteFormComponent.save();  
    //           break;
    //         case "DocenteCoord":
    //           let formDataDocenteCoord = {};
    //           await firstValueFrom(this.svcDocenti.getByPersona(this.personaID).pipe(tap(docenteEstratto => 
    //             {
    //               formDataDocenteCoord = {
    //                 docenteID: docenteEstratto.id
    //               }
    //             })));
    //           this.svcDocentiCoord.post(formDataDocenteCoord).subscribe();

    //           break;
    //         case "NonDocente":
    //           this._lstRoles.includes(roleselected)? this.svcNonDocenti.put(formData).subscribe() : this.svcNonDocenti.post(formData).subscribe();
    //           break;
    //         case "Dirigente":
    //           this._lstRoles.includes(roleselected)? this.svcDirigenti.put(formData).subscribe() : this.svcDirigenti.post(formData).subscribe();
    //           break;
    //         case "ITManager":
    //           this._lstRoles.includes(roleselected)? this.svcITManagers.put(formData).subscribe() : this.svcITManagers.post(formData).subscribe();
    //           break;
    //       }
        
    //   }
    // })
    
  // }