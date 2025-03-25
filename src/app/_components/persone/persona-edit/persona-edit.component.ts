//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable, firstValueFrom }           from 'rxjs';
import { shareReplay, take, tap }                            from 'rxjs/operators';
import { MatOptionSelectionChange }             from '@angular/material/core';

//components
import { PersonaFormComponent }                 from '../persona-form/persona-form.component';
import { GenitoreFormComponent }                from '../../genitori/genitore-form/genitore-form.component';
import { AlunnoFormComponent }                  from '../../alunni/alunno-form/alunno-form.component';
import { DocenteFormComponent }                 from '../../docenti/docente-form/docente-form.component';

import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { Utility }                              from '../../utilities/utility.component';


//services
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { PersoneService }                       from '../persone.service';
import { TipiPersonaService }                   from '../tipi-persona.service';
import { AlunniService }                        from '../../alunni/alunni.service';
import { GenitoriService }                      from '../../genitori/genitori.service';
import { DocentiService }                       from '../../docenti/docenti.service';
import { DocentiCoordService }                  from '../docenticoord.service';
import { NonDocentiService }                    from '../nondocenti.service';
import { ITManagersService }                    from '../ITmanagers.service';
import { DirigentiService }                     from '../dirigenti.service';


//models
import { PER_Persona, PER_TipoPersona }         from 'src/app/_models/PER_Persone';
import { User }                                 from 'src/app/_user/Users';


//#endregion

@Component({
  selector: 'app-persona-edit',
  templateUrl: './persona-edit.component.html',
  styleUrls: ['../persone.css']
})
export class PersonaEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  form!                 : UntypedFormGroup;

  currUser!             : User;
  persona$!             : Observable<PER_Persona>;
  persona!              : PER_Persona;
  obsTipiPersona$!      : Observable<PER_TipoPersona[]>;
  _lstRoles!            : string[];
  lstTipiPersona!       : PER_TipoPersona[];
  selectedRoles         : number[] = []

  showGenitoreForm      : boolean  = false;
  showAlunnoForm        : boolean = false;
  showDocenteForm       : boolean = false;

  alunnoID!             : number;
  genitoreID!           : number;
  docenteID!            : number;

  emptyForm             : boolean = false;
  disabledSave          = false;

  //#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(PersonaFormComponent) personaFormComponent!: PersonaFormComponent; 
  //[static false servirebbe a consentire un riferimento a appalunnoform anche se non è stato caricato ancora]
  @ViewChild('appalunnoform', {static: false}) appalunnoform!: AlunnoFormComponent; 
  @ViewChild('appgenitoreform', {static: false}) appgenitoreform!: GenitoreFormComponent;
  @ViewChild('appdocenteform', {static: false}) appdocenteform!: DocenteFormComponent; 
  //TODO....
  
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef: MatDialogRef<PersonaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public personaID: number,
              private fb:                       UntypedFormBuilder, 
              private svcPersone:               PersoneService,
              private svcAlunni:                AlunniService,
              private svcGenitori:              GenitoriService,
              private svcDocenti:               DocentiService,
              private svcDocentiCoord:          DocentiCoordService,
              private svcNonDocenti:            NonDocentiService,
              private svcITManagers:            ITManagersService,
              private svcDirigenti:             DirigentiService,
              private svcTipiPersona:           TipiPersonaService,

              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private _loadingService :         LoadingService      ) {

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
    //console.log ("persona-edit loadData");
    if (this.personaID && this.personaID + '' != "0") {

      //interrogo ed aspetto per avere la lista dei tipi persona che mi serve nella loadPersona successiva
      await firstValueFrom(this.obsTipiPersona$.pipe(tap(lstTipiPersona=> this.lstTipiPersona = lstTipiPersona)));

      const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(this.personaID);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);

      this.persona$ = loadPersona$
      .pipe( 
          tap(
            persona => {
              //console.log("persona-edit loadData - persona", persona);
              this.personaID = persona.id
              this.persona = persona
              this._lstRoles = persona._LstRoles!;
              //console.log("persona-edit arrivati:", persona._LstRoles)

              for (let i= 0; i < persona._LstRoles!.length; i++) {
                const ruoloPersona = this.lstTipiPersona.find(tp => tp.descrizione === persona._LstRoles![i]);
                if (ruoloPersona) this.selectedRoles.push(ruoloPersona.id)
              }
              //imposto i ruoli arrivati e mostro il form specifico
              this.form.controls['_lstRoles'].setValue(this.selectedRoles);
              if (persona._LstRoles!.includes('Alunno')) { 
                this.svcAlunni.getByPersona(this.persona.id).subscribe(alunno=>{this.alunnoID= alunno.id; this.showAlunnoForm = true; });
              }//devo anche valorizzare alunnoID e passarlo a alunno form
              if (persona._LstRoles!.includes('Genitore')) {
                this.svcGenitori.getByPersona(this.persona.id).subscribe(genitore=> {
                  console.log ("persona-edit - loadData - ritorno da getByPersona di genitori", genitore);
                  this.genitoreID= genitore.id; 
                  this.showGenitoreForm = true
                } );
              } //devo anche valorizzare genitoreID e passarlo a genitore form
              if (persona._LstRoles!.includes('Docente')) {
                this.svcDocenti.getByPersona(this.persona.id).subscribe(docente=> {this.docenteID= docente.id; this.showDocenteForm = true});
              }  //devo anche valorizzare docenteID e passarlo a docente form
              //TODO...

            }
            //this.form.patchValue(persona)
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
      next: ()=> {
        this._dialogRef.close();
        this.saveRoles();

        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
      },
      error: ()=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    })
  }


  getCurrentForm(role:string): any {
    switch (role) {
      case "Alunno":
        return this.appalunnoform ? this.appalunnoform.form : null;
      case "Genitore":
        return this.appgenitoreform ? this.appgenitoreform.form : null;
      case "Docente":
        return this.appdocenteform ? this.appdocenteform.form : null;
      default:
        return null;
    }
  }

  saveRoles() {
    //parallelamente alla save (put o post che sia) della persona bisogna occuparsi di inserire i diversi ruoli
    //ALU_Alunno
    //ALU_Genitore
    //PER_Docente
    //PER_DocenteCoord - per questo una modalità diversa
    //PER_NonDocente
    //PER_Dirigente
    //PER_ITManager

    let selectedRolesIds = []
    if (this.form.controls['_lstRoles'].value.length != 0) selectedRolesIds = this.form.controls['_lstRoles'].value;
      const selectedRolesDescrizioni = selectedRolesIds.map((tipo:any) => {const tipoPersona = this.lstTipiPersona.find(tp => tp.id === tipo);
      return tipoPersona ? tipoPersona.descrizione : ''; // Restituisce la descrizione se trovata, altrimenti una stringa vuota
    });

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
    selectedRolesDescrizioni.forEach(async (roleselected:string)=> {
      {

          const currentForm = this.getCurrentForm(roleselected);
          console.log ("persona.ID", this.personaID);

          let formData = {
            ...currentForm.value, // Ottiene tutti i valori del form selezionato
            personaID: this.personaID
          };

          console.log ("adesso faccio post o put del formData per ", roleselected, formData);
          switch (roleselected) {
            case "Alunno":
              //this._lstRoles.includes(roleselected)? this.svcAlunni.put(formData).subscribe() : this.svcAlunni.post(formData).subscribe();
              this.appalunnoform.save();
              break;
            case "Genitore":
              //this._lstRoles.includes(roleselected)? this.svcGenitori.put(formData).subscribe() : this.svcGenitori.post(formData).subscribe();
              this.appgenitoreform.save();
              break;
            case "Docente":
              //this._lstRoles.includes(roleselected)? this.svcDocenti.put(formData).subscribe() : this.svcDocenti.post(formData).subscribe();  
              this.appdocenteform.save();  
              break;
            case "DocenteCoord":
              let formDataDocenteCoord = {};
              await firstValueFrom(this.svcDocenti.getByPersona(this.personaID).pipe(tap(docenteEstratto => 
                {
                  formDataDocenteCoord = {
                    docenteID: docenteEstratto.id
                  }
                })));
              this.svcDocentiCoord.post(formDataDocenteCoord).subscribe();

              break;
            case "NonDocente":
              this._lstRoles.includes(roleselected)? this.svcNonDocenti.put(formData).subscribe() : this.svcNonDocenti.post(formData).subscribe();
              break;
            case "Dirigente":
              this._lstRoles.includes(roleselected)? this.svcDirigenti.put(formData).subscribe() : this.svcDirigenti.post(formData).subscribe();
              break;
            case "ITManager":
              this._lstRoles.includes(roleselected)? this.svcITManagers.put(formData).subscribe() : this.svcITManagers.post(formData).subscribe();
              break;
          }
        
      }
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


  changeOptionRoles (event: MatOptionSelectionChange){

    //se si vuole impedire il deflaggamento
    // if (!event.source.selected) {
    //   event.source.select();
    //   return;
    // }



    if (event.source.viewValue == 'Alunno') 
      this.showAlunnoForm = event.source.selected; 

    if (event.source.viewValue == 'Genitore')
      this.showGenitoreForm = event.source.selected; 

    if (event.source.viewValue == 'Docente')
      this.showDocenteForm = event.source.selected; 

    //TODO ...-

    setTimeout(() => {
      this.refreshSaveDisable();
    }, 10); //devo ritardare altrimenti non fa a tempo a essere attivo il form caricato
  }

  // ngDoCheck() {
  //   this.refreshSaveDisable(); //questo fa schifo perchè viene chiamato ad ogni piè sospinto!
  // }

  refreshSaveDisable(){
    //è stato emesso il refreshSaveDisable in seguito a modifica di uno dei form
    //questa routine aggiorna la disable del pulsante save
    let personaFormValid = true;
    let alunnoFormValid = true;
    let genitoreFormValid = true;
    let docenteFormValid = true;

    if (this.personaFormComponent) 
      personaFormValid = this.personaFormComponent.form.valid;

    if (this.showAlunnoForm && this.appalunnoform && this.appalunnoform.form) 
      alunnoFormValid = this.appalunnoform.form.valid;

    if (this.showGenitoreForm && this.appgenitoreform && this.appgenitoreform.form) 
      genitoreFormValid = this.appgenitoreform.form.valid;
    
    if (this.showDocenteForm && this.appdocenteform && this.appdocenteform.form) 
      docenteFormValid = this.appdocenteform.form.valid;
    

    this.disabledSave = !personaFormValid || !alunnoFormValid || !genitoreFormValid || !docenteFormValid;
  }

  deletedRole(who: string) {
    //è stato emesso il deletedRole in seguito a pressione del cestino
    //questa routine va anche aggiornare la combo così che ci sia coerenza
    
    const lstRolesCombo = this.form.get('_lstRoles');                                                     //lstRolesCombo è la combo
    if (lstRolesCombo) {
      this.obsTipiPersona$.pipe(take(1)).subscribe(options => {
        const roleToDeflag = options.find(option => option.descrizione === who);                          //estraggo l'oggetto del ruolo da deflaggare
        if (roleToDeflag) {
          let selectedRolesArray = lstRolesCombo.value as number[];                                       //carico l'array delle selezioni corrente
          const indexToRemove = selectedRolesArray.findIndex(roleId => roleId == roleToDeflag.id);        //Trovo nell'array della selezione corrente l'indice di quello da deflaggare
          if (indexToRemove !== -1) {
            selectedRolesArray.splice(indexToRemove, 1);                                                  //rimuovo dall'array delle selezioni correnti quello da deflaggare
            lstRolesCombo.setValue(selectedRolesArray);                                                   //e ripasso l'array alla combo
          }
        }
      });
    }
    this.refreshSaveDisable();                  //va infine aggiornata l'abilitazione della save
  }
}



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
