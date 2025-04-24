//#region ----- IMPORTS ------------------------
import { Component, EventEmitter, Input, OnInit, Output}       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                from '@angular/forms';
import { MatDialog }                                           from '@angular/material/dialog';

//services
import { RetteService }                                        from '../rette.service';
import { ScadenzeRetteService } from '../scadenzeRette.service';
import { concatMap, of, switchMap, tap } from 'rxjs';

//models


//#endregion
@Component({
  selector        : 'app-rettamese-edit',
  templateUrl     : './rettamese-edit.component.html',
  styleUrls       : ['../pagamenti.css'],
})

export class RettameseEditComponent implements OnInit{

//#region ----- Variabili ----------------------
  form!        : UntypedFormGroup;
  emptyForm    : boolean = false;
//#endregion

//#region ----- ViewChild Input Output -------


  @Input() rettaMese!      : any;
  @Output() mesePagamentoClicked = new EventEmitter<number>();
  @Output() saved          = new EventEmitter<void>();
//#endregion

//#region ----- Constructor --------------------

  constructor(
    private fb                      : UntypedFormBuilder,
    private svcScadenzeRette        : ScadenzeRetteService,
    private svcRette                : RetteService,
    public _dialog                  : MatDialog,
  ) { 

    this.form = this.fb.group({
      id                : [null],
      iscrizioneID      : [null],
      rettaID           : [''],
      dtScadenza        : [''],
      importo           : [0],
      quotaDefault      : [0],
      totPagamenti: [{ value: 0, disabled: true }],  // 👈 disabilitato subito
    });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnChanges() {
    //console.log ("retta-mese - ngOnChanges - rettaMese", this.rettaMese);
    if (this.rettaMese) {
      this.loadData();

    }
    //if (this.toHighlight == this.rettaID && this.toHighlight!= null) {this.evidenzia = true} else { this.evidenzia = false}
  }

  ngOnInit(): void {
  }
  
  loadData(){

    if (this.rettaMese) {
      this.form.patchValue({
        id              : this.rettaMese.scadenzaRettaID,
        rettaID         : this.rettaMese.rettaID,
        dtScadenza      : this.formatDateToString(this.rettaMese.dtScadenza),
        importo         : this.rettaMese.quotaConcordata,
        quotaDefault    : this.rettaMese.quotaDefault,
        totPagamenti    : this.rettaMese.totPagamenti,
      });
    }
  }

//#endregion

//#region ----- Operazioni CRUD ----------------
  save(){



    const rettaObs = this.rettaMese.rettaID == null
    ? this.svcRette.post({
          id: 0,
          iscrizioneID: this.rettaMese.iscrizioneID,
          quotaDefault: 0,
          quotaConcordata: 0
        }).pipe(
          tap((res: any) => {
            console.log('[DEBUG] POST retta result:', res);
            this.rettaMese.rettaID = res.id;

            // Aggiorniamo direttamente il form con il nuovo rettaID
            this.form.patchValue({
              rettaID: res.id
            });
            console.log('[DEBUG] Form dopo POST retta:', this.form.value);
          })
        )
  : of(null).pipe(
      tap(() => console.log('[DEBUG] Skipping POST retta (già esiste)'))
    );

  // Eseguiamo saveObs dopo che rettaID è stato settato
  rettaObs.pipe(
    switchMap(() => {
      const saveObs = this.rettaMese.scadenzaRettaID != null && this.rettaMese.scadenzaRettaID != 0
        ? this.svcScadenzeRette.put(this.form.value).pipe(
            tap(() => console.log('[DEBUG] PUT scadenza', this.form.value))
          )
        : this.svcScadenzeRette.post(this.form.value).pipe(
            tap(() => console.log('[DEBUG] POST scadenza', this.form.value))
          );

      return saveObs;
    }),
    concatMap(() => {
      console.log('[DEBUG] Calling aggiornaQuotaTotale con rettaID:', this.rettaMese.rettaID);
      return this.svcScadenzeRette.aggiornaQuotaTotale(this.rettaMese.rettaID);
    })
  ).subscribe({
    next: () => {
      console.log('[DEBUG] Operazioni completate correttamente.');
      setTimeout(() => this.saved.emit(), 50); // micro-delay
    },
    error: (err) => {
      console.error('[DEBUG] Errore nel salvataggio:', err);
    }
  });

    
  

    
    
  }




  formatDateToString(date: Date): string {
    // Formato yyyy-MM-dd (compatibile con .NET DateTime)
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    return `${yyyy}-${mm}-${dd}`;
  }
//#endregion

//#region ----- Altri metodi -------
  ConvertToNumber (x: string): number {
    return parseInt(x);
  }



  clickOnPagamento() {
    //this.mesePagamentoClicked.emit(this.rettaMese.meseRetta);
  }

//#endregion
}


