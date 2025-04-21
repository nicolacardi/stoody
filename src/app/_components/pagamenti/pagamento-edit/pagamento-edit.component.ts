//#region ----- IMPORTS ------------------------
import { Component, Inject }                                      from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }       from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef }               from '@angular/material/dialog';
import { MatSnackBar }                                            from '@angular/material/snack-bar';
import { concatMap, Observable, of, tap }                         from 'rxjs';

//components
import { SnackbarComponent }                                      from '../../utilities/snackbar/snackbar.component';
import { DialogOkComponent }                                      from '../../utilities/dialog-ok/dialog-ok.component';
//services
import { CausaliPagamentoService }                                from '../causaliPagamento.service';
import { TipiPagamentoService }                                   from '../tipiPagamento.service';
import { AnniScolasticiService }                                  from '../../anni-scolastici/anni-scolastici.service';
import { PagamentiService }                                       from '../pagamenti.service';
import { LoadingService }                                         from '../../utilities/loading/loading.service';
import { PagamentiRetteService }                                  from '../pagamentiRette.service';
import { IscrizioniService }                                      from '../../iscrizioni/iscrizioni.service';
import { RetteService }                                           from '../rette.service';

//models
import { ASC_AnnoScolastico }                                     from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_CausalePagamento }                                   from 'src/app/_models/PAG_CausalePagamento';
import { PAG_Pagamento }                                          from 'src/app/_models/PAG_Pagamento';
import { PAG_TipoPagamento }                                      from 'src/app/_models/PAG_TipoPagamento';
import { CLS_Iscrizione }                                         from 'src/app/_models/CLS_Iscrizione';



//#endregion
@Component({
  selector: 'app-pagamento-edit',
  templateUrl: './pagamento-edit.component.html',
  styleUrl: '../pagamenti.css'
})
export class PagamentoEditComponent {

//#region ----- Variabili ----------------------
  pagamento$!                    : Observable<PAG_Pagamento>;

  obsAnni$!                      : Observable<ASC_AnnoScolastico[]>;
  causaliPagamento$!             : Observable<PAG_CausalePagamento[]>;
  tipiPagamento$!                : Observable<PAG_TipoPagamento[]>;

  obsIscrizioni$!                : Observable<CLS_Iscrizione[]>;

  formPagamento!                 : UntypedFormGroup;
  formPagamentoRetta!            : UntypedFormGroup;
  emptyForm                      : boolean = false;
  iscrizioneIDprec!              : number;
  pagamentoRettaIDIniziale!      : number;
//#endregion

//#region ----- Constructor --------------------
  constructor(
    @Inject(MAT_DIALOG_DATA) public pagamentoID       : number,
    
    public _dialogRef                                 : MatDialogRef<PagamentoEditComponent>,
    private fb                                        : UntypedFormBuilder,
    private svcCausaliPagamento                       : CausaliPagamentoService,
    private svcTipiPagamento                          : TipiPagamentoService,
    private svcAnni                                   : AnniScolasticiService,
    private svcPagamenti                              : PagamentiService,
    private svcRette                                  : RetteService,
    private svcPagamentiRette                         : PagamentiRetteService,
    private svcIscrizioni                             : IscrizioniService,
    private _snackBar                                 : MatSnackBar,
    public _dialog                                    : MatDialog,
    private _loadingService                           : LoadingService,

  ) {

        this.formPagamento = this.fb.group({
          id               : [null],
          annoID           : ['', Validators.required],
          importo          : ['', Validators.required],
          dtPagamento      : ['', Validators.required],
          tipoPagamentoID  : [''],
          causaleID        : ['', Validators.required]
        });


        this.formPagamentoRetta = this.fb.group({
          id               : [null],
          iscrizioneID     : [''],
          rettaID          : [''],
          pagamentoID      : ['']
        });

        this.causaliPagamento$ = this.svcCausaliPagamento.list();
        this.tipiPagamento$ = this.svcTipiPagamento.list();
        this.obsAnni$ = this.svcAnni.list();  

   }
//#endregion

//#region ----- LifeCycle Hooks e simili-------
   ngOnInit() {
    this.loadData();

    this.formPagamento.controls['annoID'].valueChanges.subscribe(
      val=>{

        this.obsIscrizioni$ = this.svcIscrizioni.listByAnno(val) //serve per trovare l'elenco iscrizioni da inserire nella select dell'alunno

        //se scelgo un anno diverso per un pagamento esistente la faccenda è grave o quantomeno complessa:
        //bisognerebbe con l'anno scelto e SE C'E' alunnoID (attenzione non con l'iscrizione scelta ma con il suo sottoggetto alunnoID) andare a vedere se esiste una iscrizione
        //e SE C'E' caricare QUELLA sulla selectIscrizione
        //TODO*********************************************************************************************************

      } 
    )

    this.formPagamentoRetta.controls['iscrizioneID'].valueChanges.subscribe(
      val=> {
        //console.log ("pagamento-edit ngOnInit - iscrizioneID selezionata",val);
        this.svcRette.getByIscrizione(val)
        .subscribe({
          next: res=>{
            if (res) {
              this.formPagamentoRetta.controls['rettaID'].setValue(res.id)
              this.iscrizioneIDprec = val;
            } else {
              //è difficile (e si potrebbe anche inibire) che si debba cambiare l'alunno a un pagamento esistente, ma potrebbe accadere per l'inserimento di un nuovo pagamento
              this._dialog.open(DialogOkComponent, {
                width: '320px',
                data: {titolo: "ATTENZIONE!", sottoTitolo: "L'iscrizione dell'alunno selezionato non ha rette nell'anno indicato<br>Per inserire pagamenti collegati ad una retta questa deve essere stata creata"}
              });
              this.formPagamentoRetta.controls['iscrizioneID']
              .setValue(this.iscrizioneIDprec, { emitEvent: false })
            }
          },
          error: err=> { }
        })
      }
    )

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
              console.log("pagamento-edit - loadData - pagamento", pagamento);
              this.obsIscrizioni$ = this.svcIscrizioni.listByAnno(pagamento.annoID); //serve per trovare iscrizioneID in caso di causale retta
              this.formPagamento.patchValue(pagamento)
              if (pagamento.causaleID == 1) {
                console.log("pagamento.pagamentoRetta", pagamento.pagamentoRetta);
                //this.formPagamentoRetta.patchValue(pagamento.pagamentoRetta!)
                this.formPagamentoRetta.controls['id'].setValue(pagamento.pagamentoRetta!.id);
                this.formPagamentoRetta.controls['iscrizioneID'].setValue(pagamento.pagamentoRetta!.retta!.iscrizioneID);
                this.formPagamentoRetta.controls['rettaID'].setValue(pagamento.pagamentoRetta!.rettaID);
                this.formPagamentoRetta.controls['pagamentoID'].setValue(pagamento.pagamentoRetta!.pagamentoID);
                this.pagamentoRettaIDIniziale = pagamento.pagamentoRetta!.id;
              }
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
    // console.log("pagamento-edit - save formPagamento: ", this.formPagamento.value);
    // console.log("pagamento-edit - save formPagamentoRetta", this.formPagamentoRetta.value);
    if (this.pagamentoID == 0) { 
      // console.log("this.formPagamento - save - POST");
      this.svcPagamenti.post(this.formPagamento.value).pipe(
        concatMap(pagamento => {
          //console.log("è finita la prima post e ha generato il pagamento con ID:", pagamento)
          this.formPagamentoRetta.controls['pagamentoID'].setValue(pagamento.id);
          //console.log("quindi adesso formPagamentoRetta:", this.formPagamentoRetta.value);
          const shouldPost = this.formPagamentoRetta.controls['rettaID'].value !== 0;
          return shouldPost
            ? this.svcPagamentiRette.post(this.formPagamentoRetta.value)
            : of(null);
        }))
        .subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> {
          console.log(err);
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        }
      })
    } else {
      // console.log("this.formPagamento - save - PUT");
      this.svcPagamenti.put(this.formPagamento.value).pipe(
        concatMap(() => {
          // console.log ("rimuovo pagamentoRetta con ID SE C'E'", this.pagamentoRettaIDIniziale)
          const shouldDelete = this.pagamentoRettaIDIniziale;
          return shouldDelete
            ? this.svcPagamentiRette.delete(this.pagamentoRettaIDIniziale)
            : of(null);
        }), //tolgo quello iniziale perchè magari nel frattempo è cambiata la causale e quindi l'id ora è 0 o diverso da quello iniziale
        concatMap(() => {      //salvo il nuovo form, forse uguale a quello iniziale, forse no. lo faccio solo se c'è un rettaID (conseguenza di un'iscrizione selezionata)
          // console.log ("post pagamentoRetta con form", this.formPagamentoRetta.value)
          this.formPagamentoRetta.controls['pagamentoID'].setValue(this.formPagamento.controls['id'].value);
          const shouldPost = this.formPagamentoRetta.controls['rettaID'].value !== 0;
          return shouldPost
            ? this.svcPagamentiRette.post(this.formPagamentoRetta.value)
            : of(null);
        })
      )
      .subscribe({
        next: res=> {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
        },
        error: err=> (
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        )
      })
    }
  }

  delete() {
    if (this.pagamentoID != null) {
      this.svcPagamentiRette.deleteByPagamento(this.pagamentoID).pipe(
        concatMap(()=> this.svcPagamenti.delete(this.pagamentoID))
      )
      .subscribe({
        next: () => {
          this._dialogRef.close();
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Record cancellato',
            panelClass: ['red-snackbar']
          });
        },
        error: () => {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Errore in cancellazione',
            panelClass: ['red-snackbar']
          });
        }
      });
    }
  }
//#endregion

//#region ----- Altre Operazioni --------------
    changedCausale(causaleID: number) {
      //se tolgo la causale Retta in fase di save dovrò CANCELLARE il record pagamentoRettaID
      if (causaleID != 1){
        this.formPagamentoRetta.controls['id'].setValue(0);
        this.formPagamentoRetta.controls['iscrizioneID'].setValue(null,  { emitEvent: false });
        this.formPagamentoRetta.controls['rettaID'].setValue(0);
        this.formPagamentoRetta.controls['pagamentoID'].setValue(0);

        this.formPagamentoRetta.controls['iscrizioneID'].clearValidators();
        this.formPagamentoRetta.controls['iscrizioneID'].updateValueAndValidity({emitEvent: false});
      } else {
        this.formPagamentoRetta.controls['iscrizioneID'].setValidators([ Validators.required]);
        this.formPagamentoRetta.controls['iscrizioneID'].updateValueAndValidity({emitEvent: false});
        console.log(this.formPagamentoRetta.value);
      }

    }
//#endregion
  }

