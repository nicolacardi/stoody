//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { iif, Observable, of }                  from 'rxjs';
import { concatMap, tap }                       from 'rxjs/operators';

//components
import { ClassiSezioniAnniListComponent }       from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { GenitoreEditComponent }                from '../../genitori/genitore-edit/genitore-edit.component';
import { GenitoriListComponent }                from '../../genitori/genitori-list/genitori-list.component';
import { PersonaFormComponent }                 from '../../persone/persona-form/persona-form.component';

import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { AlunniService }                        from 'src/app/_components/alunni/alunni.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { _UT_Comuni }                           from 'src/app/_models/_UT_Comuni';
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ALU_GenitoreAlunno }                   from 'src/app/_models/ALU_GenitoreAlunno';
import { AlunnoFormComponent } from '../alunno-form/alunno-form.component';


//#endregion

@Component({
  selector:     'app-alunno-edit',
  templateUrl:  './alunno-edit.component.html',
  styleUrls:    ['./../alunni.css'],
  standalone: false
})

export class AlunnoEditComponent implements OnInit {

//#region ----- Variabili ----------------------
  genitore!:                                    ALU_GenitoreAlunno;
  alunno$!:                                     Observable<ALU_Alunno>;
  filteredComuni$!:                             Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:                      Observable<_UT_Comuni[]>;
  genitoriArr :                                 ALU_GenitoreAlunno[] = []
  public personaID!:                            number;

  alunnoNomeCognome:                            string = "";
  //formAlunno! :                               UntypedFormGroup;

  personaFormisValid!:                          boolean;
  alunnoFormisValid!:                           boolean;

  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  breakpoint!:                                  number;

  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  selectedTab:                                  number = 0;

//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChild('genitoriFamiglia') genitoriFamigliaComponent!:            GenitoriListComponent; 
  @ViewChild('genitoriDisponibili') genitoriDisponibiliComponent!:      GenitoriListComponent; 

  @ViewChild('iscrizioniAlunno') classiAttendedComponent!:              ClassiSezioniAnniListComponent; 
  @ViewChild('classiSezioniAnniList') classiSezioniAnniListComponent!:  ClassiSezioniAnniListComponent; 
  @ViewChild(PersonaFormComponent) personaFormComponent!:               PersonaFormComponent; 
  @ViewChild(AlunnoFormComponent) alunnoFormComponent!:                 AlunnoFormComponent; 


//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:                MatDialogRef<AlunnoEditComponent>,
              @Inject(MAT_DIALOG_DATA) public alunnoID:   number,
              private svcIscrizioni:            IscrizioniService,
              private svcAlunni:                AlunniService,
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private _loadingService :         LoadingService ) {

    _dialogRef.disableClose = true;
    
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit () {
    this.loadData();
  }

  loadData(){

    this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
 
    if (this.alunnoID && this.alunnoID + '' != "0") {

      const obsAlunno$: Observable<ALU_Alunno> = this.svcAlunni.getWithParents(this.alunnoID);
      const loadAlunno$ = this._loadingService.showLoaderUntilCompleted(obsAlunno$);
      this.alunno$ = loadAlunno$
      .pipe(
          tap(
            alunno => {
              this.personaID = alunno.personaID;
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
    .pipe(
      tap(persona => {
        if (this.alunnoFormComponent.form.controls['personaID'].value == null)
            this.alunnoFormComponent.form.controls['personaID'].setValue(persona.id);
        //this.personaID = persona.id; //questa non fa a tempo ad arrivare a alunnoFormComponent per fare anche la post di formAlunno con il giusto personaID
      }),
    concatMap( () => this.alunnoFormComponent.save())
    ).subscribe({
      next: res=> {
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
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });

    dialogYesNo.afterClosed().subscribe(result => {
      if(result) {
        this.svcAlunni.delete(Number(this.alunnoID))
        .pipe(
          tap( () => this.personaFormComponent.form.controls['tipoPersonaID'].setValue(12)),
          concatMap(()=> this.personaFormComponent.save()) //non cancelliamo la persona ma impostiamo a non assegnato il tipo
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

//#endregion
}

