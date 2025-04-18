//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild }                   from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }       from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA }               from '@angular/material/dialog';
import { MatSnackBar }                                            from '@angular/material/snack-bar';
import { lastValueFrom, Observable, of }                          from 'rxjs';
import { switchMap, tap }                                         from 'rxjs/operators';

//components
import { SnackbarComponent }                                      from '../../utilities/snackbar/snackbar.component';
import { PagamentiListComponent }                                 from '../pagamenti-list/pagamenti-list.component';
import { RettapagamentoEditComponent }                            from '../rettapagamento-edit/rettapagamento-edit.component';
import { RettaCalcoloAlunnoComponent }                            from '../retta-calcolo-alunno/retta-calcolo-alunno.component';
import { RettaannoEditComponent }                                 from '../rettaanno-edit/rettaanno-edit.component';

//services
import { RetteService }                                           from '../rette.service';
import { LoadingService }                                         from '../../utilities/loading/loading.service';
import { AlunniService }                                          from '../../alunni/alunni.service';
import { AnniScolasticiService }                                  from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { IscrizioniService }                                      from '../../iscrizioni/iscrizioni.service';

//models
import { ALU_Alunno }                                             from 'src/app/_models/ALU_Alunno';
import { ASC_AnnoScolastico }                                     from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_Retta }                                              from 'src/app/_models/PAG_Retta';
import { DialogOkComponent } from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogDataIscrizione } from 'src/app/_models/DialogData';



//#endregion
@Component({
  selector: 'app-retta-edit',
  templateUrl: './retta-edit.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  public obsRette$!        : Observable<PAG_Retta[]>;
  obsAnni$!                : Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico


  formRetta!               : UntypedFormGroup;
  formAlunno!              : UntypedFormGroup;

  alunno!                  : ALU_Alunno;
  anno!                    : ASC_AnnoScolastico;

  mesi                     : number[] = [];
  annoRetta                : number[] = [];
  quoteConcordate          : number[] = [];
  quoteDefault             : number[] = [];
  totPagamenti             : number[] = [];
  quotaConcordataAnno      : number=0;
  quotaDefaultAnno         : number=0;
  totPagamentiAnno         : number=0;

  nPagamenti               : number[] = [];
  retteID                  : number[] = [];
  ultimoAnnoValido!        : number;
  retteMese                : PAG_Retta[] = [];
  idToHighlight!           : number;

  //public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
//#endregion

//#region ----- ViewChild Input Output ---------
  //@ViewChildren(RettameseEditComponent) ChildrenRettaMese!:QueryList<RettameseEditComponent>;
  @ViewChild(RettaannoEditComponent) ChildRettaAnno!                    : RettaannoEditComponent;
  // @ViewChild(PagamentiListComponent) ChildPagamenti!                    : PagamentiListComponent;
  // @ViewChild(RettapagamentoEditComponent) ChildRettapagamentoEdit!      : RettapagamentoEditComponent;
  @ViewChild(RettaCalcoloAlunnoComponent) ChildRettaCalcoloAlunno!      : RettaCalcoloAlunnoComponent;
//#endregion

//#region ----- Constructor --------------------

  constructor(
    public _dialogRef                           : MatDialogRef<RettaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data        : DialogDataIscrizione,
    private fb                                  : UntypedFormBuilder,
    private svcRette                            : RetteService,
    private svcAlunni                           : AlunniService,
    private svcIscrizioni                       : IscrizioniService,
    private svcAnni                             : AnniScolasticiService,
    public _dialog                              : MatDialog,
    private _snackBar                           : MatSnackBar,
    private _loadingService                     : LoadingService
  ) 
  { 
    _dialogRef.disableClose = true;

    this.formRetta = this.fb.group({
      id                   : [null],
      alunnoID             : ['', Validators.required],
      annoID               : ['', Validators.required],
      causaleID            : ['', Validators.required],
      dtPagamento          : ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      importo              : ['', { validators:[ Validators.required]}],
      tipoPagamentoID      : ['', Validators.required],
      nomeCognomeAlunno    : [null],
      selectAnnoScolastico : [null]
    });

    this.formRetta.controls['selectAnnoScolastico'].valueChanges.subscribe(
      val=> {
        if (val) {
          //console.log("è cambiato l'anno selezionato", val);
          //se cambia l'anno bisogna ri-acquisire l'iscrizione, sulla base dello stesso alunno ma di un anno differente
          //devo dunque estrarre l'iscrizione sulla base dell'alunnoID attuale e di annoID selezionato.
          this.svcIscrizioni.getByAlunnoAndAnno(val.id,this.data.iscrizione.alunnoID)
          .subscribe(iscrizione=>{
            console.log ("retta-edit - constructor - iscrizione", iscrizione);
            if (iscrizione) {
              this.data.iscrizione=iscrizione;
              this.loadData();
              this.ultimoAnnoValido = val;
            } else {
              //bisogna impedire che cambi o meglio reimpostare l'anno precedente e dare un messaggio
              const dialogRef = this._dialog.open(DialogOkComponent, {
                width: '320px',
                data: {titolo: "ATTENZIONE!", sottoTitolo: "Non ci sono iscrizioni<br>dell'alunno specificato<br>per l'anno scolastico selezionato"}
              });
              //this.formRetta.controls['selectAnnoScolastico'].setValue(this.ultimoAnnoValido);
              dialogRef.afterClosed().subscribe(() => {
                this.formRetta.controls['selectAnnoScolastico'].setValue(this.ultimoAnnoValido);
              });
            }
            }
          );
        }
      }
    )


  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.obsAnni$ = this.svcAnni.list();
    console.log ("retta.edit - ngOnInit", this.data);
    this.formRetta.controls['selectAnnoScolastico'].setValue(this.data.iscrizione!.classeSezioneAnno.anno);
  }

  loadData() {
    console.log ("***************LOADDATA")
    this.formRetta.controls['nomeCognomeAlunno'].setValue(
      this.data.iscrizione.alunno.persona.nome + " " + this.data.iscrizione.alunno.persona.cognome
    );
    this.retteMese = [];
    //inizializzo i 12 retteMese
    for (let i = 0; i <= 11; i++) {
      const mese = i + 1;
      this.retteMese[i] = {
        id: 0,
        iscrizioneID: this.data.iscrizione.id,
        annoRetta: (mese>=9 && mese <=12)
                    ? this.data.iscrizione?.classeSezioneAnno?.anno.anno1
                    : this.data.iscrizione?.classeSezioneAnno?.anno.anno2,
        meseRetta: mese,
        quotaDefault: 0,
        quotaConcordata: 0,
        totPagamenti: 0,
        iscrizione: this.data.iscrizione!
      };
    }
    this.quotaConcordataAnno = 0;
    this.quotaDefaultAnno = 0;
    this.totPagamentiAnno = 0;
    //console.log ("retta-edit - loadData - this.data", this.data);
    this.obsRette$ = this.svcRette.listByIscrizione(this.data.iscrizione!.id);
    const loadRette$ = this._loadingService.showLoaderUntilCompleted(this.obsRette$);

    loadRette$
    .subscribe({
      next: obj => {
        if (obj && obj.length > 0) {
          //inserirsco in un array retteMese quelli che trovo
          //retteMese[i] è l'oggetto che passo a ogni rettamese-edit
          //per qulli non trovati è stato già inizializzato a 0 (vedi più su)
          obj.forEach((val) => {
            const meseIndex = val.meseRetta - 1;
            this.retteMese[meseIndex] = {
              id: val.id,
              iscrizioneID: val.iscrizioneID,
              annoRetta: val.annoRetta,
              meseRetta: val.meseRetta,
              quotaDefault: val.quotaDefault,
              quotaConcordata: val.quotaConcordata,
              totPagamenti: 0,
              iscrizione: this.data.iscrizione! //aggiungo all'oggetto l'iscrizione
            };

            // Somma i pagamenti del mese corrente a totPagamentiAnno val.pagamenti è un array
            val.pagamenti?.forEach(x => {
                this.retteMese[meseIndex].totPagamenti! += x.importo;
                this.totPagamentiAnno += x.importo;
            });

            this.quotaConcordataAnno += val.quotaConcordata;
            this.quotaDefaultAnno += val.quotaDefault;

          });
          // for (let i = 0; i <= 11; i++) {
          //   const mese = i;
          //   console.log ("retteMese", mese, this.retteMese[mese])
          // }
          console.log (this.quotaConcordataAnno);
        }
      },
      error: (err) => {
          console.error("Errore nel recupero dei dati:", err);
      }
    });
  }

  compareAnni = (a: any, b: any): boolean => {
    return a && b && a.id === b.id;
  }

  onPanelOpened() {
    this.updateDialogSize();
  }

  // Quando il pannello viene chiuso
  onPanelClosed() {
    this.updateDialogSize();
  }

  updateDialogSize() {
    setTimeout(() => {
      this._dialogRef.updateSize('850px', 'auto'); // Ridimensiona il dialog in base al contenuto
    }, 100); // Aggiungi un piccolo ritardo per assicurarti che il layout sia stato applicato
  }


//#endregion

//#region ----- Interazioni Varie Interfaccia --

  //nuovoPagamentoArrivato(str: string) {
    //è stato inserito un nuovo pagamento: devo fare il refresh dei child: della lista (ChildPagamenti) e di retta edit che in cascata passa i totali aggiornati ai vari
    //retta-mese edit e retta-anno-edit
    // this.ChildPagamenti.loadData();
    // this.loadData();
    
  //}

  //pagamentoEliminatoArrivato () {
    // this.loadData();
  //}

  ricalcoloRetteArrivato() {
    // //è stato effettuato un ricalcolo delle rette calcolate: ora bisogna fare la refresh di tutti i 12 rettamese

    // for (let i = 0; i < 12; i++) {
    //   let childRettaMese = this.ChildrenRettaMese.find(childRettaMese => childRettaMese.indice == i);
    //   childRettaMese!.ngOnChanges();
    // }

    this.loadData()
  }


  mesePagamentoClicked (meseRettaClicked: number ){
    // //ora devo passare queste informazioni a rettapagamento-edit
    // this.ChildRettapagamentoEdit.formRetta.controls['causaleID'].setValue(1);
    // this.ChildRettapagamentoEdit.formRetta.controls['meseRetta'].setValue(meseRettaClicked - 1);
  }
//#endregion

//#region FUNZIONI NON PIU' UTILIZZATE ?

  // enterAlunnoInput () {
  //   //Su pressione di enter devo dapprima selezionare il PRIMO valore della lista aperta (a meno che non sia vuoto)
  //   //Una volta selezionato devo trovare, SE esiste, il valore dell'id che corrisponde a quanto digitato e quello passarlo a passAlunno del service
  //   //Mancherebbe qui la possibilità di selezionare solo con le freccette e Enter

  //   if (this.formRetta.controls['nomeCognomeAlunno'].value != '') {
  //     this.matAutocomplete.options.first.select();
  //     //Questo è il valore che devo cercare: this.matAutocomplete.options.first.viewValue;
  //     this.svcAlunni.findAlunnoID(this.matAutocomplete.options.first.viewValue)
  //     .subscribe();
  //   }
  // } 
  // blur() {
  //   //evento che dovrebbe essere triggered su click fuori dall'elenco proposto. Va però in conflitto con selected:
  //   //nel senso che spesso parte anche quando uno seleziona una voce dall'elenco.
  //   console.log ("blur");
  //   return;
  //   console.log (this.matAutocomplete.options.first);
  //    //l'unico caso che al momento non possiamo gestire è se non c'è alcun elemento nella dropdown (se p.e. utente scrive "hh")
  //    //e anzi per non incorrere in errori in quel caso bisogna uscire dalla routine
  //   if (!this.matAutocomplete.options.first) return; 

  //   const stored = this.matAutocomplete.options.first.viewValue;
  //   console.log ("stored", stored);
  //   const idstored = this.matAutocomplete.options.first.id;
  //   console.log("idstored", idstored);
  //   //se uno cancella tutto si ritrova selezionato il primo della lista
  //   if (this.formRetta.controls['nomeCognomeAlunno'].value == "") {
  //     this.matAutocomplete.options.first.select();
  //   }

  //   //se non trova in base a quello che uno ha scritto seleziona il primo dell'elenco
  //   this.svcAlunni.filterAlunniExact(this.formRetta.value.nomeCognomeAlunno).subscribe(val=>
  //     {
  //       if (!val) {
  //         this.data.alunnoID = parseInt(idstored);
  //         this.formRetta.controls['nomeCognomeAlunno'].setValue(stored)
  //         this.formRetta.controls['alunnoID'].setValue(parseInt(idstored));
  //         this.loadData();
  //       }
  //   })
  // }


    // hoverPagamentoArrivato(id: number) {
  //   //console.log ("arrivato", id);
  //   this.idToHighlight = id;
  //   //this.ChildPagamenti.refresh();
  // }


  // savePivot() {
    
  //   //questo metodo chiama uno ad uno il metodo save di ciascun child
  //   //salvando quindi ogni form, cioè ogni record Retta
  //   let response : boolean;
  //   let hasError: boolean = false;

  //   for (let i = 0; i < 12; i++) {
  //     let childRettaMese = this.ChildrenRettaMese.find(childRettaMese => childRettaMese.indice == i);
  //     response = childRettaMese!.save();
  //     if (!response) 
  //       hasError = true;
  //   }

  //   if (hasError) 
  //     this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore di Salvataggio', panelClass: ['red-snackbar']})
  //   else 
  //     this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record Salvato', panelClass: ['green-snackbar']})

  //   this._dialogRef.close();
  // }
//#endregion

}
