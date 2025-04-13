//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { EMPTY, Observable, Subscription, iif, of }             from 'rxjs';
import { concatMap, map, tap }                       from 'rxjs/operators';

//components
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { ClassiSezioniAnniService }             from '../classi-sezioni-anni.service';
import { ClassiSezioniService }                 from '../classi-sezioni.service';
import { ClassiService }                        from '../classi.service';
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { CLS_ClasseSezioneAnno, CLS_ClasseSezioneAnnoGroup } from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe }                           from 'src/app/_models/CLS_Classe';
import { CLS_ClasseSezione }                    from 'src/app/_models/CLS_ClasseSezione';

//#endregion
@Component({
  selector: 'app-classe-sezione-anno-edit',
  templateUrl: './classe-sezione-anno-edit.component.html',
  styleUrls: ['./../classi.css'],
  standalone: false
})
export class ClasseSezioneAnnoEditComponent implements OnInit {

//#region ----- Variabili ---------------------

  classeSezioneAnno$!:                          Observable<CLS_ClasseSezioneAnno>;
  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;
  obsClassi$!:                                  Observable<CLS_Classe[]>;
  obsClassiSezioniAnniSucc$!:                   Observable<CLS_ClasseSezioneAnno[]>;
  obsClasseSezione$!:                           Observable<CLS_ClasseSezione>;

  obs!:                                         Subscription;

  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  breakpoint!:                                  number;
//#endregion

//#region ----- Constructor -------------------
  constructor(@Inject(MAT_DIALOG_DATA) public classeSezioneAnnoID: number,
              public _dialogRef:                          MatDialogRef<ClasseSezioneAnnoEditComponent>,
              private fb:                                 UntypedFormBuilder,
              private svcClasseSezioneAnno:               ClassiSezioniAnniService,
              private svcClasseSezione:                   ClassiSezioniService,
              private svcClassi:                          ClassiService,
              private svcAnni:                            AnniScolasticiService,
              public _dialog:                             MatDialog,
              private _snackBar:                          MatSnackBar,
              private _loadingService :                   LoadingService ) { 
    
    _dialogRef.disableClose = true;

    this.form = this.fb.group({
      id:                         [null],
      annoID:                     ['', Validators.required],
      classeSezioneAnnoSuccID:    [''],
      classeSezioneID:            [null],
      sezione:                    ['', Validators.required],
      classeID:                   ['', Validators.required]
    });
  }

//#endregion 

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.loadData();
  }

  loadData(){

    this.obsAnni$= this.svcAnni.list();
    this.obsClassi$= this.svcClassi.list();
    
    //TODO per ottenere l'elenco di tutte le classi dell'anno scolastico successivo 
    //forse bisogna prelevare l'id dell'anno della classe che si sta guardando, e poi prendere le classi
    //tramite loadClassiByAnnoScolastico a cui si passa l'id + 1? Solo e si è sicuri che gli anni scolastici sono stati inseriti tutti
    //con una sequenza di id...altrimenti serve che ogni anno scolastico abbia l'indicazione dell'id dell'anno successivo...per poter estrarre l'id
    //dell'anno successivo e con quello fare la loadClassiByAnnoScolastico....

    //********************* POPOLAMENTO FORM *******************
    if (this.classeSezioneAnnoID && this.classeSezioneAnnoID + '' != "0") {
      console.log ("classesezioneanno - loadData - classeSezioneAnnoID", this.classeSezioneAnnoID);
      const obsClasseSezioneAnno$: Observable<CLS_ClasseSezioneAnno> = this.svcClasseSezioneAnno.getWithClasseSezioneAnno(this.classeSezioneAnnoID);
      const loadClasseSezioneAnno$ = this._loadingService.showLoaderUntilCompleted(obsClasseSezioneAnno$);
      
      this.classeSezioneAnno$ = loadClasseSezioneAnno$.pipe(
          tap(classe => {
            console.log ("CSA-edit - loadData classe", classe);
            //this.form.patchValue(classe); //non funziona bene, perchè ci sono dei "sotto-oggetti"
            this.form.controls['id'].setValue(classe.id); //NB in questo modo si setta il valore di un campo del formBuilder quando NON compare anche come Form-field nell'HTML
            this.form.controls['sezione'].setValue(classe.classeSezione.sezione); 
            this.form.controls['classeID'].setValue(classe.classeSezione.classe!.id);
            this.form.controls['annoID'].setValue(classe.anno.id);

            let annoIDsucc=0;
            this.svcAnni.getAnnoSucc(classe.anno.id).pipe (
              tap (val   =>  {
                
                annoIDsucc= val.id
                //console.log ("classesezioneanno - loadData - anno succ", val);
              }),
              concatMap(() => this.obsClassiSezioniAnniSucc$ = this.svcClasseSezioneAnno.listByAnno(annoIDsucc))
            ).subscribe({
              next: res=> { console.log ("classesezioneanno - loadData - res", res)},
              error: err=> { console.log ("errore")},
            });
            this.form.controls['classeSezioneAnnoSuccID'].setValue(classe.classeSezioneAnnoSuccID); 
          })
      );
    } 
    else this.emptyForm = true
  }

//#endregion

//#region ----- Operazioni CRUD ---------------

save() {
  const idCorrente = this.form.controls['id'].value;
  const classeID = this.form.controls['classeID'].value;
  const sezione = this.form.controls['sezione'].value;
  const annoID = this.form.controls['annoID'].value;

  this.getOrCreateClasseSezione(classeID, sezione).pipe(
    tap(classeSezione => this.form.controls['classeSezioneID'].setValue(classeSezione.id)),
    concatMap(classeSezione =>
      this.checkDuplicato(classeSezione.id!, annoID, idCorrente).pipe(
        concatMap(duplicato => {
          if (duplicato) {
            this._snackBar.openFromComponent(SnackbarComponent, {
              data: 'Combinazione Classe Sezione Anno già presente.',
              panelClass: ['red-snackbar']
            });
            return EMPTY;
          }

          // Decide se fare POST o PUT
          return idCorrente == null
            ? this.svcClasseSezioneAnno.post(this.form.value)
            : this.svcClasseSezioneAnno.put(this.form.value);
        })
      )
    )
  ).subscribe({
    next: () => {
      this._snackBar.openFromComponent(SnackbarComponent, {
        data: idCorrente == null ? 'Record creato' : 'Record aggiornato',
        panelClass: ['green-snackbar']
      });
      this._dialogRef.close();
    },
    error: () => {
      this._snackBar.openFromComponent(SnackbarComponent, {
        data: 'Errore nel salvataggio',
        panelClass: ['red-snackbar']
      });
    }
  });
}

private getOrCreateClasseSezione(classeID: number, sezione: string): Observable<CLS_ClasseSezione> {
  return this.svcClasseSezione.getByClasseSezione(classeID, sezione).pipe(
    concatMap(classeSezione => {
      console.log ("classe-sezione-anno-edit - getorcreateclassesezione classeSezione", classeSezione)
      if (classeSezione) {
        return of(classeSezione);
      } else {
        const nuovo = { classeID, sezione };
        return this.svcClasseSezione.post(nuovo);
      }
    })
  );
}

private checkDuplicato(classeSezioneID: number, annoID: number, idCorrente: number): Observable<boolean> {
  console.log("classe-sezione-anno-edit - checkDuplicato ", classeSezioneID, annoID, idCorrente); // Log dei dati restituiti
  return this.svcClasseSezioneAnno.getByCSAndAnno(classeSezioneID, annoID).pipe(
    map(esistente => !!esistente && esistente.id !== idCorrente)
  );
}
 

  delete(){
    const dialogYesNo = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });

    dialogYesNo.afterClosed().subscribe( result => {
        if(result) {
          this.svcClasseSezioneAnno.delete(Number(this.classeSezioneAnnoID)).subscribe({
            next: ()=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']});
              this._dialogRef.close();
            },
            error: ()=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
          });
        }
    });
  }

//#endregion

//#region ----- Altri metodi ------------------

  updateAnnoSucc(selectedAnno: number) {
    let annoIDsucc = 0;

    // Annulla eventuale subscription precedente
    if (this.obs) {
      this.obs.unsubscribe();
    }

    this.obs = this.svcAnni.getAnnoSucc(selectedAnno).pipe(
      tap(val => annoIDsucc = val?.id ?? 0),
      concatMap(() => this.svcClasseSezioneAnno.listByAnno(annoIDsucc))
    ).subscribe({
      next: classi => {
        this.obsClassiSezioniAnniSucc$ = of(classi);
      },
      error: () => {
        this.obsClassiSezioniAnniSucc$ = of([]); // fallback sicuro
      }
    });
  }
  
//#endregion

}
