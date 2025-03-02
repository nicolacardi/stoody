//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, HostListener, Inject, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, timer } from 'rxjs';
import { debounceTime, delayWhen, map, switchMap, tap } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

//components
import { SnackbarComponent } from '../../utilities/snackbar/snackbar.component';
import { RettameseEditComponent } from '../rettamese-edit/rettamese-edit.component';
import { PagamentiListComponent } from '../pagamenti-list/pagamenti-list.component';
import { RettapagamentoEditComponent } from '../rettapagamento-edit/rettapagamento-edit.component';

//services
import { RetteService } from '../rette.service';
import { LoadingService } from '../../utilities/loading/loading.service';
import { AlunniService } from '../../alunni/alunni.service';

//models
import { ALU_Alunno } from 'src/app/_models/ALU_Alunno';
import { ASC_AnnoScolastico } from 'src/app/_models/ASC_AnnoScolastico';
import { PAG_Retta } from 'src/app/_models/PAG_Retta';
import { AnniScolasticiService } from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { RettaCalcoloAlunnoComponent } from '../retta-calcolo-alunno/retta-calcolo-alunno.component';
import { RettaannoEditComponent } from '../rettaanno-edit/rettaanno-edit.component';
import { DialogData } from 'src/app/_models/DialogData';

//#endregion
@Component({
  selector: 'app-retta-edit',
  templateUrl: './retta-edit.component.html',
  styleUrls: ['../pagamenti.css']
})

export class RettaEditComponent implements OnInit {

//#region ----- Variabili ----------------------

  public obsRette$!:          Observable<PAG_Retta[]>;
  obsAnni$!:                  Observable<ASC_AnnoScolastico[]>;    //Serve per la combo anno scolastico

  filteredAlunni$!:           Observable<ALU_Alunno[]>;
  formRetta! :                UntypedFormGroup;
  formAlunno! :               UntypedFormGroup;

  alunno!:                    ALU_Alunno;
  anno!:                      ASC_AnnoScolastico;

  mesi:                       number[] = [];
  quoteConcordate:            number[] = [];
  quoteDefault:               number[] = [];
  totPagamenti:               number[] = [];
  quotaConcordataAnno:        number=0;
  quotaDefaultAnno:           number=0;
  totPagamentiAnno:           number=0;

  nPagamenti:                 number[] = [];
  retteID:                    number[] = [];
  idToHighlight!:             number;

  //public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
//#endregion

//#region ----- ViewChild Input Output ---------
  //@ViewChildren(RettameseEditComponent) ChildrenRettaMese!:QueryList<RettameseEditComponent>;
  @ViewChild(RettaannoEditComponent) ChildRettaAnno!: RettaannoEditComponent;
  @ViewChild(PagamentiListComponent) ChildPagamenti!: PagamentiListComponent;
  @ViewChild(RettapagamentoEditComponent) ChildRettapagamentoEdit!: RettapagamentoEditComponent;
  @ViewChild(RettaCalcoloAlunnoComponent) ChildRettaCalcoloAlunno!: RettaCalcoloAlunnoComponent;
  @ViewChild(MatAutocomplete) matAutocomplete!: MatAutocomplete;
//#endregion

//#region ----- Constructor --------------------

  constructor(
    public _dialogRef: MatDialogRef<RettaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb:             UntypedFormBuilder, 
    private svcRette:       RetteService,
    private svcAlunni:      AlunniService,
    private svcAnni:        AnniScolasticiService,
    public _dialog:         MatDialog,
    private _snackBar:      MatSnackBar,
    private _loadingService:  LoadingService  
  ) 
  { 
    _dialogRef.disableClose = true;

    this.formRetta = this.fb.group({
      id:                         [null],
      alunnoID:                   ['', Validators.required],
      annoID:                     ['', Validators.required],
      causaleID:                  ['', Validators.required],
      dtPagamento:                ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      importo:                    ['', { validators:[ Validators.required]}],
      tipoPagamentoID:            ['', Validators.required],
      nomeCognomeAlunno:          [null],
      selectAnnoScolastico:       [null]
    });

    // this.formAlunno = this.fb.group({
    //   nomeCognomeAlunno:          [null]
    // })
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.filteredAlunni$ = this.formRetta.controls['nomeCognomeAlunno'].valueChanges
    .pipe(
      debounceTime(300),
      switchMap(() => this.svcAlunni.filterAlunni(this.formRetta.value.nomeCognomeAlunno))
    )

    this.obsAnni$ = this.svcAnni.list();

    this.formRetta.controls['selectAnnoScolastico'].setValue(this.data.annoID);
    this.formRetta.controls['selectAnnoScolastico'].valueChanges.subscribe(
      val=> {
        if (val) {
          this.data.annoID = val;
          this.loadData();
        }
      }
    )
    this.loadData();
  }

  loadData(){
    
    this.quotaConcordataAnno=0;
    this.quotaDefaultAnno=0;
    this.totPagamentiAnno=0;

    this.obsRette$ = this.svcRette.listByAlunnoAnno(this.data.alunnoID, this.data.annoID);  
    const loadRette$ =this._loadingService.showLoaderUntilCompleted(this.obsRette$);
    loadRette$.pipe(
      map(obj => { 
        //obsRette$ è un Observable<PAG_Retta[]> quindi è un elenco/lista/array di 12 oggetti di tipo PAG_Rette
        //prendo CIASCUNO di questi 12 oggetti e ci popolo vari array di numeri in cui l'indice va da 0 a 11
        //in particolare passo il rettaID ORDINATAMENTE a ognuno dei 12 component
        if (obj.length!= 0 ) {

          this.anno = obj[0].anno!;
          this.alunno = obj[0].alunno!;
          this.formRetta.controls['nomeCognomeAlunno'].setValue(this.alunno.persona.nome+" "+this.alunno.persona.cognome);

          obj.forEach((val, i)=>{
            this.retteID[obj[i].meseRetta-1] = obj[i].id;

            this.mesi[obj[i].meseRetta - 1] = obj[i].meseRetta;
            this.quoteConcordate[obj[i].meseRetta - 1] = obj[i].quotaConcordata;
            this.quotaConcordataAnno += obj[i].quotaConcordata;

            this.quoteDefault[obj[i].meseRetta - 1] = obj[i].quotaDefault;
            this.quotaDefaultAnno += obj[i].quotaDefault;

            //ora calcolo il totale dei pagamenti per ciascun mese e lo metto nell'array totPagamenti sommandolo 
            this.totPagamenti[obj[i].meseRetta-1] = 0;
            //this.nPagamenti[obj[i].meseRetta-1] = 0;

            obj[i].pagamenti?.forEach(x=>{
              this.totPagamenti[obj[i].meseRetta-1] += x.importo;
              //this.nPagamenti[obj[i].meseRetta-1] = this.nPagamenti[obj[i].meseRetta-1] + 1;
              this.totPagamentiAnno += x.importo;
            });
          })
        } else {
          //obj.length è = 0 quando non c'è alcun obj, cioè quando si vuole inserire un "nuovo pagamento" da zero
          //la differenza in questo caso è che non c'è un anno e quindi lo dobbiamo forzare
          //creo un oggetto vuoto di tipo ASC_Annoscolastico, lo assegno a this.anno e poi ci setto il valor di default
          // const tmpObj = <ASC_AnnoScolastico>{};
          // this.anno = tmpObj;

          //this.formRetta.controls['nomeCognomeAlunno'].setValue("");
          //retta.edit passa i valori a 12 children, uno per mese, che si chiamano rettamese-edit:
          //nel caso di "nuovo pagamento" impostiamo a 0 tutti i valori trasmessi ai child
          for (let i = 0; i <= 11; i++) {
            //idRette[da 0 a 11] è il valore dirà ad ognuno dei 12 child che si tratta di un nuovo pagamento
            this.retteID[i] = 0; 

            this.quotaConcordataAnno=0;
            this.quotaDefaultAnno=0;
            this.totPagamentiAnno=0;
          }
        }
      })
    ).subscribe( )
  }


//#endregion

//#region ----- Interazioni Varie Interfaccia --

  nuovoPagamentoArrivato(str: string) {
    //è stato inserito un nuovo pagamento: devo fare il refresh dei child: della lista (ChildPagamenti) e di retta edit che in cascata passa i totali aggiornati ai vari
    //retta-mese edit e retta-anno-edit
    this.ChildPagamenti.loadData();
    this.loadData();
    
  }

  pagamentoEliminatoArrivato () {
    this.loadData();
  }

  ricalcoloRetteArrivato() {
    // //è stato effettuato un ricalcolo delle rette calcolate: ora bisogna fare la refresh di tutti i 12 rettamese

    // for (let i = 0; i < 12; i++) {
    //   let childRettaMese = this.ChildrenRettaMese.find(childRettaMese => childRettaMese.indice == i);
    //   childRettaMese!.ngOnChanges();
    // }

    this.loadData()
  }

  // hoverPagamentoArrivato(id: number) {
  //   //console.log ("arrivato", id);
  //   this.idToHighlight = id;
  //   //this.ChildPagamenti.refresh();
  // }


  enterAlunnoInput () {
    //Su pressione di enter devo dapprima selezionare il PRIMO valore della lista aperta (a meno che non sia vuoto)
    //Una volta selezionato devo trovare, SE esiste, il valore dell'id che corrisponde a quanto digitato e quello passarlo a passAlunno del service
    //Mancherebbe qui la possibilità di selezionare solo con le freccette e Enter


    if (this.formRetta.controls['nomeCognomeAlunno'].value != '') {
      this.matAutocomplete.options.first.select();
      //Questo è il valore che devo cercare: this.matAutocomplete.options.first.viewValue;
      this.svcAlunni.findAlunnoID(this.matAutocomplete.options.first.viewValue)
      .subscribe();
    }
  }


  selected(event: MatAutocompleteSelectedEvent): void {
    //evento triggered su selezione di una voce tra quelle proposte
    this.data.alunnoID = parseInt(event.option.id);
    this.formRetta.controls['alunnoID'].setValue(parseInt(event.option.id));
    this.loadData();
  }



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

  mesePagamentoClicked (meseRettaClicked: number ){
    //ora devo passare queste informazioni a rettapagamento-edit
    this.ChildRettapagamentoEdit.formRetta.controls['causaleID'].setValue(1);
    this.ChildRettapagamentoEdit.formRetta.controls['meseRetta'].setValue(meseRettaClicked - 1);
  }
//#endregion

//#region FUNZIONI NON PIU' UTILIZZATE ?

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
