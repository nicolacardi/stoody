//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit }            from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { Observable, firstValueFrom }                           from 'rxjs';
import { tap }                                  from 'rxjs/operators';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';

//services
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { MaterieService }                       from '../../materie/materie.service';
import { ClassiService }                        from '../../classi/classi.service';
import { TipiVotoService }                      from '../tipi-voto.service';
import { ClasseAnnoMateriaService }             from '../classe-anno-materia.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe }                           from 'src/app/_models/CLS_Classe';
import { CLS_ClasseAnnoMateria }                from 'src/app/_models/CLS_ClasseAnnoMateria';
import { CLS_TipoVoto }                         from 'src/app/_models/CLS_TipoVoto';
import { MAT_Materia }                          from 'src/app/_models/MAT_Materia';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
import { DocenzeService } from '../../docenze/docenze.service';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';

//#endregion
@Component({
  selector: 'app-classe-anno-materia-edit',
  templateUrl: './classe-anno-materia-edit.component.html',
  styleUrls: ['../classi-anni-materie.css']
})

export class ClasseAnnoMateriaEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  classeAnnoMateria$!:                          Observable<CLS_ClasseAnnoMateria>;
  obsClassi$!:                                  Observable<CLS_Classe[]>;
  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;
  obsMaterie$!:                                 Observable<MAT_Materia[]>;
  obsTipiVoto$!:                                Observable<CLS_TipoVoto[]>;

  form! :                                       UntypedFormGroup;
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- Constructor --------------------
  constructor(public _dialogRef: MatDialogRef<ClasseAnnoMateriaEditComponent>,
              @Inject(MAT_DIALOG_DATA) public classeAnnoMateriaID: number,
              private svcClassi:                          ClassiService,
              private svcAnni:                            AnniScolasticiService,
              private svcMaterie:                         MaterieService,
              private svcClassiAnniMaterie:               ClasseAnnoMateriaService,
              private svcTipiVoto:                        TipiVotoService,

              private _loadingService :                   LoadingService,
              private fb:                                 UntypedFormBuilder, 
              public _dialog:                             MatDialog,
              private _snackBar:                          MatSnackBar) { 

    _dialogRef.disableClose = true;
  
    this.form = this.fb.group({
      id:                         [null],
      classeID:                   [''],
      annoID:                     [''],
      materiaID:                  [''],
      tipoVotoID:                 ['', { validators:[ Validators.required, Validators.maxLength(50)]}]
    });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(){
  
    this.obsClassi$ = this.svcClassi.list();
    this.obsAnni$= this.svcAnni.list();
    this.obsMaterie$ = this.svcMaterie.list();
    this.obsTipiVoto$ = this.svcTipiVoto.list();
  
    if (this.classeAnnoMateriaID && this.classeAnnoMateriaID + '' != "0") {
      const obsClasseAnnoMateria$: Observable<CLS_ClasseAnnoMateria> = this.svcClassiAnniMaterie.get(this.classeAnnoMateriaID);
      const loadObiettivo$ = this._loadingService.showLoaderUntilCompleted(obsClasseAnnoMateria$);
      this.classeAnnoMateria$ = loadObiettivo$
        .pipe( 
          tap( val => this.form.patchValue(val) )
        );
    } 
    else 
      this.emptyForm = true
  }
//#endregion

//#region ----- Operazioni CRUD ----------------

  save(){

    if (this.form.controls['id'].value == null) 
      this.svcClassiAnniMaterie.post(this.form.value)
        .subscribe({
          next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']}))
        });
    else {
      
      this.svcClassiAnniMaterie.put(this.form.value).subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      });
    }
  }

  delete(){

    const dialogRef = this._dialog.open(DialogYesNoComponent, {
      width: '320px',
      data: {titolo: "ATTENZIONE", sottoTitolo: "Si conferma la cancellazione del record ?"}
    });
    dialogRef.afterClosed().subscribe(async result => {
      if(result){

                    //VOLENDO INIBIRE LA CANCELLAZIONE NEL CASO IN CUI CI SIANO DOCENZE DI QUESTA MATERIA IN QUESTA CLASSE QUEST'ANNO....
                    //verifico se la materia è stata utilizzata in qualche docenza, per questa classe, quindi vado a vedere classedocentemateria
                    //dove classe però è classesezioneanno, quindi devo 
                    //1. estrarre tutte le classisezionianni con lo stesso classe e anno.
                    //2. per ciascuna di queste classesezionianni devo verificare se esiste un record in classedocentemateria (che dovrebbe infatti chiamarsi classesezioneannodocentemateria)
                    //3. se esiste devo bloccare la cancellazione altrimenti devo far procedere la cancellazione
                    //   let classeID = this.form.controls['classeID'].value;
                    //   let annoID = this.form.controls['annoID'].value;
                    //   let materiaID = this.form.controls['materiaID'].value;
                    //   let docenze = 0;
                    //   await firstValueFrom(this.svcDocenze.countDocenzeByClasseAnnoMateria(classeID, annoID, materiaID).pipe(tap(ndocenze => docenze = ndocenze)));
                    //   if (docenze != 0)
                    // { 
                    //     this._dialog.open(DialogOkComponent, {
                    //       width: '320px',
                    //       data: {titolo: "ATTENZIONE!", sottoTitolo: "Questa materia viene insegnata <br> da qualche docente in questa classe!<br>Pertanto non è cancellabile"}
                    //     });
                    //     return;
                    //   }


        this.svcClassiAnniMaterie.delete(Number(this.classeAnnoMateriaID)).subscribe({
          next: res=>{
            this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record cancellato', panelClass: ['red-snackbar']} );
            this._dialogRef.close();
          },
          error: err=> (this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']}))
        });
      }
    });
  }
//#endregion


}
