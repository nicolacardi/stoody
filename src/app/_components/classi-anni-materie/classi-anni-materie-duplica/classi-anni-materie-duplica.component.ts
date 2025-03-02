//#region ----- IMPORTS ------------------------

import { Component, OnInit }                    from '@angular/core';
import { Observable }                           from 'rxjs';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef }              from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

//services
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { ClasseAnnoMateriaService }             from '../classe-anno-materia.service';
import { ClassiService }                        from '../../classi/classi.service';
import { TipiVotoService }                      from '../tipi-voto.service';

//components
import { DialogOkComponent }                    from 'src/app/_components/utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from 'src/app/_components/utilities/snackbar/snackbar.component';

//models
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Classe }                           from 'src/app/_models/CLS_Classe';
import { CLS_TipoVoto }                         from 'src/app/_models/CLS_TipoVoto';

//#endregion
@Component({
  selector: 'app-classi-anni-materie-duplica',
  templateUrl: './classi-anni-materie-duplica.component.html',
  styleUrls: ['../classi-anni-materie.css']
})
export class ClassiAnniMaterieDuplicaComponent implements OnInit {

//#region ----- Variabili ----------------------

  obsAnni$!:                                    Observable<ASC_AnnoScolastico[]>;
  obsClassi$!:                                  Observable<CLS_Classe[]>;
  obsTipiVoto$!:                                Observable<CLS_TipoVoto[]>;

  form1!:              UntypedFormGroup;
  form2!:              UntypedFormGroup;
  form3!:              UntypedFormGroup;

//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialogRef:                MatDialogRef<ClassiAnniMaterieDuplicaComponent>,
              private svcAnni:                  AnniScolasticiService,
              private svcClassiAnniMaterie:     ClasseAnnoMateriaService,
              private svcClassi:                ClassiService,
              private svcTipiVoto:              TipiVotoService,

              private fb:                       UntypedFormBuilder,
              public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar ) {

    _dialogRef.disableClose = true;

    this.form1 = this.fb.group({
      selectAnnoFrom: [null],
      selectAnnoTo: [null],
    })

    this.form2 = this.fb.group({
      selectAnnoFromClasse: [null],
      selectClasseFrom: [null],
      selectClasseTo: [null],
    })

    this.form3 = this.fb.group({
      selectAnnoClasse: [null],
      selectClasse: [null],
      selectTipo: [null],
    })


  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.obsAnni$ = this.svcAnni.list();
    this.obsClassi$ = this.svcClassi.list();
    this.obsTipiVoto$ = this.svcTipiVoto.list();

  }

//#endregion

//#region ----- Altri metodi --------------------
  
  duplicaAnno() {
    if (this.form1.controls['selectAnnoFrom']
.value == this.form1.controls['selectAnnoTo']
.value) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: { titolo: "ATTENZIONE!", sottoTitolo: "L'anno di origine e destinazione coincidono" }
      });
      return;
    };

    this.svcClassiAnniMaterie.duplicaClassiAnniMaterieByAnni(this.form1.controls['selectAnnoFrom']
.value, this.form1.controls['selectAnnoTo']
.value).subscribe(
      res => {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record duplicati', panelClass: ['green-snackbar']});
      }
    );
    
  }

  duplicaClasse() {
    if (this.form2.controls['selectClasseFrom']
.value == this.form2.controls['selectClasseTo']
.value) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: { titolo: "ATTENZIONE!", sottoTitolo: "La classe di origine e destinazione coincidono" }
      });
      return;
    };

    this.svcClassiAnniMaterie.DuplicaClassiAnniMaterieByAnnoAndClassi(this.form2.controls['selectAnnoFromClasse']
.value, this.form2.controls['selectClasseFrom']
.value, this.form2.controls['selectClasseTo']
.value).subscribe(
      res => {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record duplicati', panelClass: ['green-snackbar']});
      }
    );
  }

  cambiaTipo() {
    this.svcClassiAnniMaterie.CambiaTipoByAnnoAndClasse(this.form3.controls['selectAnnoClasse']
.value, this.form3.controls['selectClasse']
.value, this.form3.controls['selectTipo']
.value).subscribe(
      res => {
        this._dialogRef.close();
        this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record modificati', panelClass: ['green-snackbar']});
      }
    );
  }

//#endregion
}
