//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }                  from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }       from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA }              from '@angular/material/dialog';
import { MatSnackBar }                                from '@angular/material/snack-bar';
import { Observable, firstValueFrom }                 from 'rxjs';
import { tap }                                        from 'rxjs/operators';

//models
import { CLS_ClasseDocenteMateria }                   from 'src/app/_models/CLS_ClasseDocenteMateria';

//components
import { SnackbarComponent }                          from '../../utilities/snackbar/snackbar.component';

//services
import { LoadingService }                             from '../../utilities/loading/loading.service';
import { DocenzeService }                             from '../docenze.service';
import { CLS_ClasseSezioneAnno }                      from 'src/app/_models/CLS_ClasseSezioneAnno';
import { ClassiSezioniAnniService }                   from '../../classi/classi-sezioni-anni.service';
import { MAT_Materia }                                from 'src/app/_models/MAT_Materia';
import { PER_Docente }                                from 'src/app/_models/PER_Docente';

//#endregion
@Component({
  selector: 'app-docenza-edit',
  templateUrl: './docenza-edit.component.html',
  styleUrls: ['../docenze.css']
})
export class DocenzaEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  docenza$!:                                    Observable<CLS_ClasseDocenteMateria>;
  strMateria!:                                  string;
  strDocente!:                                  string;
  classeSezioneAnno!:                           CLS_ClasseSezioneAnno;
  materia!:                                     MAT_Materia;
  docente!:                                     PER_Docente;

  form! :                     UntypedFormGroup;
//#endregion

//#region ----- Constructor --------------------
  constructor(@Inject(MAT_DIALOG_DATA) public docenzaID: number,
              public _dialogRef:                          MatDialogRef<DocenzaEditComponent>,
              private svcDocenze:                         DocenzeService,
              private svcClassiSezioniAnni:     ClassiSezioniAnniService,
              private _loadingService :                   LoadingService,
              private fb:                                 UntypedFormBuilder,
              private _snackBar:                          MatSnackBar ) {

    this.form = this.fb.group({
      id:                                       [null],
      ckPagella:                                [''],
      ckOrario:                                 [''],
      docenteID:                                [''],
      materiaID:                                [''],
      classeSezioneAnnoID:                      [''],
      ckImpostaTutteSezioni:                    ['']
    });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(){
    this.loadData();
  }

  loadData() {

    if (this.docenzaID && this.docenzaID + '' != "0") {


      const obsDocenza$: Observable<CLS_ClasseDocenteMateria> = this.svcDocenze.get(this.docenzaID);
      const loadDocenza$ = this._loadingService.showLoaderUntilCompleted(obsDocenza$);
      
      this.docenza$ = loadDocenza$.pipe(
        tap( docenza => {
          this.form.patchValue(docenza);
          this.strMateria = docenza.materia!.descrizione;
          this.strDocente = docenza.docente!.persona.nome + ' ' + docenza.docente!.persona.cognome;
          this.classeSezioneAnno = docenza.classeSezioneAnno!;
          this.materia = docenza.materia!;
          this.docente = docenza.docente!;
        })
      );
    }
  }
//#endregion

//#region ----- Operazioni CRUD ----------------
  async save() {

    //questa routine fa SOLO la put di un record pre-esistente, ma aventualmente aggiunge la stessa doenza anche per le altre sezioni a seconda del flag

    //TODO QUI BISOGNA INSERIRE UNA SERIE DI CONTROLLI:
    //-se uno toglie la materia dall'orario......
    //        - verificare se ci sono già compiti inseriti, firme eseguite e, nel caso, bloccare l'operazione
    //        - in alternativa informare l'utente che se procede cancellerà eventuali record inseriti e procedere cancellando nelle varie tabelle 
    //-se uno toglie la materia dalla pagella....
    //        - verificare che non siano state inseriti già record in qualche pagella con questa materia in questa classeSezioneAnno
    //        - chiedere all'utente se questa modifica la vuole fare SOLO per questa classeSezioneAnno oppure per tutte le classi uguali DELL'ANNO 
    //          (di norma così sarebbe, perchè non ha senso che si voglia togliere dalla pagella di una I A e non della I C...) 
    //          (attenzione, stiamo parlando di quelle uguali dello stesso anno)

    let classeSezioneAnnoID = this.classeSezioneAnno.id;
    let materiaID = this.materia.id;
    let docenteID = this.docente.id;

    //se c'è il flag vado ad impostare tutte le classi
    if (this.form.controls['ckImpostaTutteSezioni'].value) {
      //estraggo tutte le CSA dell'Anno con la stessa classe
      let listaClassiSezioniAnno!: CLS_ClasseSezioneAnno[];
      await firstValueFrom(this.svcClassiSezioniAnni.listSezioniAnnoByCSA(classeSezioneAnnoID).pipe(tap(res=> listaClassiSezioniAnno = res)));
      //cancella tutte le materie uguali nelle classiSezioniAnnoID trovate
      for (let i = 0; i < listaClassiSezioniAnno.length; i++) {
        //mi costruisco il form per questa ClasseSezioneAnno
        let formDocenza: CLS_ClasseDocenteMateria = {
          classeSezioneAnnoID: listaClassiSezioniAnno[i].id,
          docenteID: docenteID,
          materiaID: materiaID,
          ckOrario: this.form.controls['ckOrario'].value, //questo potrebbe generare il problema di cui sopra
          ckPagella: this.form.controls['ckPagella'].value, //e questo...
        }
        //trovo se già una certa materia è impostata per questa CSA, serve per capire se fare put o post
        let docenzaTrovata!: CLS_ClasseDocenteMateria;
        await firstValueFrom(this.svcDocenze.getByClasseSezioneAnnoAndMateria(listaClassiSezioniAnno[i].id,materiaID).pipe(tap(res=> docenzaTrovata = res)))
        //se c'è faccio una put così sono sicuro che sia aggiornata - ma sarà sempre possibile? non è detto!
        console.log ("docenzaTrovata", docenzaTrovata);
        if (docenzaTrovata) { formDocenza.id = docenzaTrovata.id
          //se quella materaID o quel docente ID pre-esistente viene usato altrove! Quindi devo tenere traccia di un eventuale errore della put
          await firstValueFrom(this.svcDocenze.put(formDocenza).pipe(tap(res=> console.log("put result",formDocenza, res))))
        } else {
          //se non c'è faccio la post
          await firstValueFrom(this.svcDocenze.post(formDocenza).pipe(tap(res=> console.log("post result", formDocenza, res))));
        }
      }
    }

                
    console.log("this.form.value", this.form.value);

    //ora faccio la put della CSA corrente e mando all'utente il risultato
    this.svcDocenze.put(this.form.value).subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
    });
  }

  delete() {
    this.svcDocenze.delete(this.form.controls['id'].value)
    .subscribe({
      next: res=> {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record Eliminato', panelClass: ['green-snackbar']});
      },
      // error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore durante la cancellazione', panelClass: ['red-snackbar']})
      error: err => {
        const messaggio = err?.error || 'Errore in cancellazione';
        this._snackBar.openFromComponent(SnackbarComponent, {
          data: 'Errore in cancellazione: ' + messaggio,
          panelClass: ['red-snackbar']
        });
      }
    });
  }
//#endregion
}
