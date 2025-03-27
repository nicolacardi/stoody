//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnChanges, OnInit, Output }       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }                from '@angular/forms';
import { MatDialog }                                                       from '@angular/material/dialog';
import { Observable, of, tap }                                             from 'rxjs';
import { MatSnackBar }                                                     from '@angular/material/snack-bar';

//components
import { SnackbarComponent }                                               from '../../utilities/snackbar/snackbar.component';


//services
import { NonDocentiService }                                                  from '../nondocenti.service';
import { LoadingService }                                                  from '../../utilities/loading/loading.service';

//models
import { PER_NonDocente }                                                     from 'src/app/_models/PER_NonDocente';


//#endregion

@Component({
  selector: 'app-nondocente-form',
  templateUrl: './nondocente-form.component.html',
  styleUrls:    ['./../nondocenti.css']
})

export class NonDocenteFormComponent implements OnInit, OnChanges {

//#region ----- Variabili ----------------------
  nondocente$!:                                    Observable<PER_NonDocente>;
  form! :                                       UntypedFormGroup;
  
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() nondocenteID!:                           number;
  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();
  @Output('deletedRole') deletedRole = new EventEmitter<string>();

//#endregion
  
//#region ----- Constructor --------------------

  constructor(
    public _dialog               : MatDialog,
    private fb                   : UntypedFormBuilder,
    private svcNonDocenti           : NonDocentiService,
    private _loadingService      : LoadingService,
    private _snackBar            : MatSnackBar,
              
  ) {

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
        this.formChanged.emit()
      }
    )
  }

  ngOnChanges () {
    this.loadData();
  }

  loadData(){

    if (this.nondocenteID && this.nondocenteID + '' != "0") {
      const obsNonDocente$: Observable<PER_NonDocente> = this.svcNonDocenti.get(this.nondocenteID);
      const loadNonDocente$ = this._loadingService.showLoaderUntilCompleted(obsNonDocente$);

      this.nondocente$ = loadNonDocente$
      .pipe( 
          tap(
            nondocente => 
              {this.form.patchValue(nondocente)
                console.log (nondocente);
              }
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() {
    if (this.nondocenteID == null || this.nondocenteID == 0) 
      this.svcNonDocenti.post(this.form.value).subscribe();
    else 
      this.svcNonDocenti.put(this.form.value).subscribe();
  }
  
  delete(){
    if (this.nondocenteID != null) 
      this.svcNonDocenti.delete(this.nondocenteID)
      .subscribe({
        next: res=>{
          this._snackBar.openFromComponent(SnackbarComponent,{data: 'Record cancellato', panelClass: ['red-snackbar']});
        },
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in cancellazione', panelClass: ['red-snackbar']})
      });
}


  deleteRole() {
    this.delete();
    this.deletedRole.emit('NonDocente')
  }
//#endregion
}
