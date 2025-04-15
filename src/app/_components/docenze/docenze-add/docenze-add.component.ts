//#region ----- IMPORTS ------------------------

import { Component, ElementRef, Inject, OnInit, ViewChild }       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                   from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA }               from '@angular/material/dialog';
import { iif, Observable, of }                                    from 'rxjs';
import { concatMap, debounceTime, map, switchMap, tap }           from 'rxjs/operators';
import { MatSnackBar }                                            from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent }                           from '@angular/material/autocomplete';

//components
import { SnackbarComponent }                                      from '../../utilities/snackbar/snackbar.component';
import { DialogOkComponent }                                      from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogData }                                             from 'src/app/_models/DialogData';

//services
import { DocenzeService }                                         from '../docenze.service';
import { DocentiService }                                         from '../../docenti/docenti.service';
import { ClassiSezioniAnniService }                               from '../../classi/classi-sezioni-anni.service';
import { MaterieService }                                         from 'src/app/_components/materie/materie.service';

//models
import { PER_Docente }                                            from 'src/app/_models/PER_Docente';
import { MAT_Materia }                                            from 'src/app/_models/MAT_Materia';
import { CLS_ClasseSezioneAnno }                                  from 'src/app/_models/CLS_ClasseSezioneAnno';

//#endregion
@Component({
  selector: 'app-docenze-add',
  templateUrl: './docenze-add.component.html',
  styleUrls: ['./../docenze.css']
})

export class DocenzeAddComponent implements OnInit {

//#region ----- Variabili ----------------------
  obsFilteredDocenti$!:                         Observable<PER_Docente[]>;
  obsMaterie$!:                                 Observable<MAT_Materia[]>;
  form! :                                       UntypedFormGroup;

  docentiIsLoading:                             boolean = false;
  classeSezioneAnno!:                           CLS_ClasseSezioneAnno;
  public docenteSelectedID!:                    number;
  public materiaSelectedID!:                    number;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('nomeCognomeDocente') nomeCognomeDocente!: ElementRef<HTMLInputElement>;
//#endregion

//#region ----- Constructor --------------------
  constructor(private fb:                             UntypedFormBuilder,
              private svcMaterie:                     MaterieService,
              private svcDocenti:                     DocentiService,
              private svcClasseSezioneAnno:           ClassiSezioniAnniService,
              private svcDocenze:                     DocenzeService,
              public dialogRef:                       MatDialogRef<DocenzeAddComponent>,
              private _snackBar:                      MatSnackBar,
              public _dialog:                         MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: DialogData ) { 

    this.form = this.fb.group({
      nomeCognomeDocente:     [null],
      selectMateria:          ['']
    });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
  
    this.svcClasseSezioneAnno.get(this.data.classeSezioneAnnoID).subscribe(
      res => this.classeSezioneAnno = res
    );

    this.obsFilteredDocenti$ = this.form.controls['nomeCognomeDocente'].valueChanges
      .pipe(
        tap(() => this.docentiIsLoading = true),
        debounceTime(300),
        //delayWhen(() => timer(2000)),
        switchMap(val => 
          this.svcDocenti.filterDocenti(this.form.value.nomeCognomeDocente)       
              // .pipe(
              //   map( val2 => val2.filter(val=>!this.idDocentiSelezionati.includes(val.id)) )//FANTASTICO!!! NON MOSTRA QUELLI GIA'SELEZIONATI! MEGLIO DI GOOGLE CHE LI RIMOSTRA!
              // ) 
        ),
        // switchMap(() => 
        //   this.svcAlunni.listByAnnoNoClasse(this.form.value.nomeCognomeAlunno, this.data.annoID)
        // )
        tap(() => this.docentiIsLoading = false)
    );

    this.form.controls['selectMateria'].valueChanges.subscribe(
       val=> this.materiaSelectedID = val 
    );

    this.obsMaterie$ = this.svcMaterie.list()
    .pipe(
      map(materie => materie.sort((a, b) => a.descrizione.localeCompare(b.descrizione)))
    );
    //Vanno mostrate solo le materie che hanno un tipo di voto già espresso per questa classe...?
    //In quel caso va usato invece del precedente svcMaterie.list : svcClasseAnnoMateria.listByClasseSezioneAnno
    //Attenzione però: se una materia viene cancellata da CLS_ClasseAnnoMateria bisogna impedirlo qualora sia utilizzata in svcClasseDocenzaMateria...e non è molto facile
    //verificarlo. Attualmente è possibile fare questa operazione e quindi lasciare delle materie in una classe pur senza avere la materia tra quelle con tipo di voto disponibile
    //this.obsClassiAnniMaterie$ = this.svcClasseAnnoMateria.listByClasseSezioneAnno(this.data.classeSezioneAnnoID);
  }
//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {
    let objDocenza = {
      DocenteID: this.docenteSelectedID,
      MateriaID: this.materiaSelectedID,
      ClasseSezioneAnnoID: this.data.classeSezioneAnnoID,
      ckOrario: true,
      ckPagella: true
    };


    
    const checks$ = this.svcDocenze
    .getByClasseSezioneAnnoAndMateriaAndDocente(this.data.classeSezioneAnnoID, this.materiaSelectedID, this.docenteSelectedID)
    .pipe(
      concatMap(res1 => {
        if (res1 != null) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {
              titolo: "ATTENZIONE!",
              sottoTitolo: "Il docente insegna già questa materia in questa classe"
            }
          });
          return of(null); // blocca la catena
        } else {
          // Proseguo al secondo controllo
          return this.svcDocenze.getByClasseSezioneAnnoAndMateria(this.data.classeSezioneAnnoID, this.materiaSelectedID);
        }
      }),
      concatMap(res2 => {
        if (res2 != null) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {
              titolo: "ATTENZIONE!",
              sottoTitolo: "Questa materia ha già una docenza assegnata in questa classe"
            }
          });
          return of(null); // blocca la catena
        } else {
          // Nessun controllo aggiuntivo, procedo direttamente al salvataggio
          return this.svcDocenze.post(objDocenza);
        }
      })
    );
    
    checks$.subscribe({
      next: res => {
        if (res) {
          this.dialogRef.close(); // Chiude solo se è stato effettuato il salvataggio
        }
      },
      error: err => {
        // Il catchError cattura l'errore, quindi questa parte non dovrebbe mai essere eseguita.
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: 'Errore in salvataggio',
          panelClass: ['red-snackbar']
        });
      }
    });
  }
    
  




  saveOLD() {

    let objDocenza = {
      DocenteID: this.docenteSelectedID,
      MateriaID: this.materiaSelectedID,
      ClasseSezioneAnnoID: this.data.classeSezioneAnnoID,

      ckOrario: true,
      ckPagella: true
    };

    console.log ("objDocenza", objDocenza);
    //Bisogna verificare che già in questa classe non ci sia il maestro di questa materia
    //e anche che questo stesso maestro non sia già maestro di questa materia in questa classe

    //1. verifica che nella classe questo maestro non insegni già questa materia (si poteva verificare anche nel webservice)
    const checks$ = 
    this.svcDocenze.getByClasseSezioneAnnoAndMateriaAndDocente(this.data.classeSezioneAnnoID, this.materiaSelectedID, this.docenteSelectedID)
    .pipe(
      //se trova che la stessa classe è già presente res.length è != 0 quindi non procede con la getByAlunnoAnno ma restituisce of()
      //se invece res.length == 0 dovrebbe proseguire e concatenare la verifica successiva ch è getByAlunnoAndAnno...
      //invece "test" non compare mai...quindi? sta uscendo sempre con of()?
      tap(res=> {
          if (res != null) {
            this._dialog.open(DialogOkComponent, {
              width: '320px',
              data: {titolo: "ATTENZIONE!", sottoTitolo: "Il docente insegna già questa materia in questa classe"}
            });
          } 
          // else {
          //  la materia non è già insegnata per la classe in cui sto cercando di inserirla da questo insegnante, posso procedere
          // }
        }
      ),
      // 2. passato il primo controllo verifica che la materia non sia già insegnata...anche da qualcun altro
      concatMap( res => iif (()=> res == null,
        this.svcDocenze.getByClasseSezioneAnnoAndMateria(this.data.classeSezioneAnnoID, this.materiaSelectedID) , of() )
      ),
      tap(res=> {
        if (res != null) {
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa materia ha già una docenza assegnata in questa classe"}
          });
        } 
        // else {
        //la materia non è già insegnata da alcuno per la classe in cui sto cercando di inserirla, posso procedere
        // }
      })
    )


    //manca un altro controllo
    //potrei essere in fase di inserimento di una docenza (CSADocenteMateria), ma potrebbe NON esistere il corrispondente record in classiAnniMaterie
    //si tratta della tabella che indica il tipo di voti
    //se si procede in questa situazione finisce che una docenza non ha un tipovoto corrispondente e questo in cascata genera altri problemi, ad esempio in fase consultazione pagelle da parte di un docente
    //dunque dovrei chiedere all'utente di fare PRIMA quello: assegnare a quella materia in quella CLASSE (non in quella CSA) un record
    //può darsi che non serva, ma il check andrebbe fatto
    //chi lo fa? il WS o angular?
    
    checks$.pipe(
       concatMap( res => iif (()=> res == null, this.svcDocenze.post(objDocenza) , of() )
      )
    ).subscribe({
      next: res=> this.dialogRef.close(),
      error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']}) 
    })


  }


//#endregion

  docenteSelected(event: MatAutocompleteSelectedEvent): void {
    this.docenteSelectedID = parseInt(event.option.id);
  }
}
