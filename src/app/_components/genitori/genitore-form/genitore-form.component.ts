//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, of, tap }                  from 'rxjs';

//components

//services
import { GenitoriService }                      from '../genitori.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';

//models
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { ALU_TipoGenitore } from 'src/app/_models/ALU_Tipogenitore';
import { TipiGenitoreService } from '../tipi-genitore.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';

//#endregion

@Component({
  selector: 'app-genitore-form',
  templateUrl: './genitore-form.component.html',
  styleUrls: ['./../genitori.css']
})

export class GenitoreFormComponent implements OnInit {

  //#region ----- Variabili ----------------------
  genitore$!:                                     Observable<ALU_Genitore>;
  obsTipiGenitore$!:                            Observable<ALU_TipoGenitore[]>;

  form! :                                       UntypedFormGroup;
  
  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() genitoreID!:                         number;
  @Input() personaID!:                         number;

  @Output('formValid') formValid = new EventEmitter<boolean>();
  @Output('formChanged') formChanged = new EventEmitter();
  @Output('deletedRole') deletedRole = new EventEmitter<string>();

//#endregion


//#region ----- Constructor --------------------

  constructor(
    public _dialog               : MatDialog,
    private fb                   : UntypedFormBuilder,
    private svcGenitori          : GenitoriService,
    private svcTipiGenitore      : TipiGenitoreService,
    private _loadingService      : LoadingService,
    private _snackBar            : MatSnackBar,
   ) {

    this.form        = this.fb.group(
    {
      id             : [null],
      personaID      : [null],
      tipoGenitoreID : ['', Validators.required],
      titoloStudio   : [''],
      professione    : [''],
      ckAttivo       : [true]
    });

    this.obsTipiGenitore$ = this.svcTipiGenitore.list();
  }

//#endregion


//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){
    this.loadData();
    this.form.valueChanges.subscribe(
      res=> {
        // console.log ("genitore-form - ngOninit - emit del form valid", this.form.valid);
        this.formValid.emit(this.form.valid);
        //this.formChanged.emit();
      }
    )

  }

  ngOnChanges () {
    this.loadData();
    // console.log ("genitore-form - ngOnChange - emit del form valid", this.form.valid);

    this.formValid.emit(this.form.valid);
  }

  loadData(){

    if (this.genitoreID && this.genitoreID + '' != "0") {
      const obsGenitore$: Observable<ALU_Genitore> = this.svcGenitori.get(this.genitoreID);
      const loadGenitore$ = this._loadingService.showLoaderUntilCompleted(obsGenitore$);

      this.genitore$ = loadGenitore$
      .pipe( 
          tap(
            genitore => this.form.patchValue(genitore)
          )
      );
    }
    else 
      this.emptyForm = true
  }

  save() {
    
    //this.form.controls['personaID'].setValue(this.personaID);

    if (this.genitoreID == null || this.genitoreID == 0) {
      console.log ("genitore-form - save - post form", this.form.value);
      //return this.svcGenitori.post(this.form.value)
      this.svcGenitori.post(this.form.value).subscribe();
    }
    else {
      console.log ("genitore-form - save - put form", this.form.value);
      this.svcGenitori.put(this.form.value).subscribe();
    }
  }

  delete(){
    if (this.genitoreID != null) 
      this.svcGenitori.delete(this.genitoreID)
      .subscribe({
        next: res=>{
          this._snackBar.openFromComponent(SnackbarComponent,{data: 'Ruolo Genitore cancellato', panelClass: ['red-snackbar']});
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
    this.deletedRole.emit('Genitore')
  }
}
