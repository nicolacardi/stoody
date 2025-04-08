//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnChanges, OnInit, Output }       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }                from '@angular/forms';
import { MatDialog }                                                       from '@angular/material/dialog';
import { Observable, of, tap }                                             from 'rxjs';
import { MatSnackBar }                                                     from '@angular/material/snack-bar';

//components
import { SnackbarComponent }                                               from '../../utilities/snackbar/snackbar.component';

//services
import { DocentiService }                                                  from '../docenti.service';
import { LoadingService }                                                  from '../../utilities/loading/loading.service';

//models
import { PER_Docente }                                                     from 'src/app/_models/PER_Docente';


//#endregion

@Component({
  selector: 'app-docente-form',
  templateUrl: './docente-form.component.html',
  styleUrls:    ['./../docenti.css']
})

export class DocenteFormComponent implements OnInit, OnChanges {

//#region ----- Variabili ----------------------
  docente$!:                                    Observable<PER_Docente>;
  form! :                                       UntypedFormGroup;
  
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() docenteID!:                           number;
  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();
  @Output('deletedRole') deletedRole = new EventEmitter<string>();

//#endregion
  
//#region ----- Constructor --------------------

  constructor(
    public _dialog               : MatDialog,
    private fb                   : UntypedFormBuilder,
    private svcDocenti           : DocentiService,
    private _loadingService      : LoadingService,
    private _snackBar            : MatSnackBar  ) {

    this.form        = this.fb.group(
    {
      id             : [null],
      personaID      : [null],
      abilitazione   : ['', Validators.maxLength(255)],
      ckAttivo       : [true]
    });
  }

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();

    this.form.valueChanges.subscribe( res=> {
        this.formValid.emit(this.form.valid);
        //this.formChanged.emit()
      }
    )
  }

  ngOnChanges () {
    this.loadData();
    // console.log ("docente-form - ngOnChange - emit del form valid", this.form.valid);
    this.formValid.emit(this.form.valid);
  }

  loadData(){

    if (this.docenteID && this.docenteID + '' != "0") {
      const obsDocente$: Observable<PER_Docente> = this.svcDocenti.get(this.docenteID);
      const loadDocente$ = this._loadingService.showLoaderUntilCompleted(obsDocente$);

      this.docente$ = loadDocente$
      .pipe( 
          tap(
            docente => 
              {this.form.patchValue(docente)
                //console.log (docente);
              }
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() {
    if (this.docenteID == null || this.docenteID == 0) 
      this.svcDocenti.post(this.form.value).subscribe();
    else 
      this.svcDocenti.put(this.form.value).subscribe();
  }
  
  delete(){
    if (this.docenteID != null) 
      this.svcDocenti.delete(this.docenteID)
      .subscribe({
        next: res=>{
          this._snackBar.openFromComponent(SnackbarComponent,{data: 'Ruolo Docente cancellato', panelClass: ['red-snackbar']});
        },
        // error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
        error: err => {
          const messaggio = err?.error || 'Errore in cancellazione';
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Errore in cancellazione: ' + messaggio,
            panelClass: ['red-snackbar']
          });
        }
      });
}


  deleteRole() {
    this.delete();
    this.deletedRole.emit('Docente')
  }
//#endregion
}
