//#region ----- IMPORTS ------------------------
import { Component, Inject }                                      from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }       from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef }               from '@angular/material/dialog';
import { MatSnackBar }                                            from '@angular/material/snack-bar';
import { Observable, tap }                                             from 'rxjs';



//components


//services
import { CausaliPagamentoService }                                from '../causaliPagamento.service';
import { TipiPagamentoService }                                   from '../tipiPagamento.service';
import { AnniScolasticiService }                                  from '../../anni-scolastici/anni-scolastici.service';
import { PagamentiService }                                       from '../pagamenti.service';
import { LoadingService }                                         from '../../utilities/loading/loading.service';

//models
import { ASC_AnnoScolastico }                                     from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_CausalePagamento }                                   from 'src/app/_models/PAG_CausalePagamento';
import { PAG_Pagamento }                                          from 'src/app/_models/PAG_Pagamento';
import { PAG_TipoPagamento }                                      from 'src/app/_models/PAG_TipoPagamento';



//#endregion
@Component({
  selector: 'app-pagamento-edit',
  templateUrl: './pagamento-edit.component.html',
  styleUrl: '../pagamenti.css'
})
export class PagamentoEditComponent {

//#region ----- Variabili ----------------------
  pagamento$!        : Observable<PAG_Pagamento>;

  obsAnni$!          : Observable<ASC_AnnoScolastico[]>;
  causaliPagamento$! : Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!    : Observable<PAG_TipoPagamento[]>;

  form!              : UntypedFormGroup;
  emptyForm          : boolean = false;
//#endregion

  constructor(
    @Inject(MAT_DIALOG_DATA) public pagamentoID : number,
    
    public _dialogRef                  : MatDialogRef<PagamentoEditComponent>,
    private fb                         : UntypedFormBuilder,
    private svcCausaliPagamento        : CausaliPagamentoService,
    private svcTipiPagamento           : TipiPagamentoService,
    private svcAnni                    : AnniScolasticiService,
    private svcPagamenti               : PagamentiService,
    private _snackBar                  : MatSnackBar,
    public _dialog                     : MatDialog,
    private _loadingService            : LoadingService,
  ) {

        this.form = this.fb.group({
          id:                         [null],
          annoID:                     [''],
          importo:                    [''],
          dtPagamento:                ['', Validators.required],
          tipoPagamentoID:            ['', Validators.required],
          causaleID:                  ['', Validators.required],
          rettaID:                    [''],
          soggetto:                   [''],
          alunnoID:                   [''],
          genitoreID:                 [''],
        });

        this.causaliPagamento$ = this.svcCausaliPagamento.list();
        this.tipiPagamento$ = this.svcTipiPagamento.list();
        this.obsAnni$ = this.svcAnni.list();  
   }
//#region ----- LifeCycle Hooks e simili-------
   ngOnInit() {
    this.loadData();
   }
  loadData() {
    console.log ("pagamento-edit - loadData ", this.pagamentoID);
    if (this.pagamentoID && this.pagamentoID + '' != "0") {

      const obsPagamento$: Observable<PAG_Pagamento> = this.svcPagamenti.get(this.pagamentoID);
      const loadPagamento$ = this._loadingService.showLoaderUntilCompleted(obsPagamento$);
      this.pagamento$ = loadPagamento$
      .pipe( 
          tap(
            pagamento => {
              console.log("alunno-form loadData - pagamento", pagamento);
              this.form.patchValue(pagamento)
            }
          )
      );
    } 
    else 
        this.emptyForm = true
  }
//#endregion
//#region ----- Operazioni CRUD ---------------
  save() {

  }

  delete() {

  }
//#endregion
changedCausale(causaleID: number) {

}
  }
