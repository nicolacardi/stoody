//#region ----- IMPORTS ------------------------

import { Component, Inject, OnInit, ViewChild }                   from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }       from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA }               from '@angular/material/dialog';
import { MatSnackBar }                                            from '@angular/material/snack-bar';
import { Observable }                                             from 'rxjs';
import { Router }                                                 from '@angular/router';

//components
import { RettaCalcoloAlunnoComponent }                            from '../retta-calcolo-alunno/retta-calcolo-alunno.component';
import { RettaannoEditComponent }                                 from '../rettaanno-edit/rettaanno-edit.component';
import { DialogOkComponent }                                      from '../../utilities/dialog-ok/dialog-ok.component';

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
import { CLS_Iscrizione }                                         from 'src/app/_models/CLS_Iscrizione';
import { ScadenzeRetteService } from '../scadenzeRette.service';




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
  anno1!                   : number;
  anno2!                   : number;
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
  retteMese                : any[] = [];
  idToHighlight!           : number;

  //public months=[0,1,2,3,4,5,6,7,8,9,10,11,12].map(x=>new Date(2000,x-1,2));
  public mesiArr=           [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild(RettaannoEditComponent) ChildRettaAnno!                    : RettaannoEditComponent;
  @ViewChild(RettaCalcoloAlunnoComponent) ChildRettaCalcoloAlunno!      : RettaCalcoloAlunnoComponent;
//#endregion

//#region ----- Constructor --------------------

  constructor(
    public _dialogRef                                 : MatDialogRef<RettaEditComponent>,
    @Inject(MAT_DIALOG_DATA) public iscrizione        : CLS_Iscrizione,
    private fb                                        : UntypedFormBuilder,
    private svcIscrizioni                             : IscrizioniService,
    private svcAnni                                   : AnniScolasticiService,
    public _dialog                                    : MatDialog,
    private router                                    : Router,
    
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

          //console.log("è cambiato l'anno selezionato", val);
          //se cambia l'anno bisogna ri-acquisire l'iscrizione, sulla base dello stesso alunno ma di un anno differente
          //devo dunque estrarre l'iscrizione sulla base dell'alunnoID attuale e di annoID selezionato.
          //questo pezzo di codice viene richiamato anche in fase di costruzione
          //quindi è l'unico richiamo di loadData
          //se cambiando l'anno non viene trovata una iscrizione per l'alunno selezionato impedisce il cambiamento di anno
          //e reimposta l'anno precedente dando un messaggio


          this.formRetta.controls['selectAnnoScolastico'].valueChanges.subscribe(
            val=> {
              this.anno1 = val.anno1;
              this.anno2 = val.anno2;
              console.log("selectAnnoScolastico", val);
              this.svcIscrizioni.getByAlunnoAndAnno(val.id,this.iscrizione.alunnoID)
              .subscribe(iscrizione=>{
                console.log ("retta-edit - constructor - iscrizione", iscrizione);
                if (iscrizione) {
                  this.iscrizione=iscrizione;
                  //console.log ("ho cambiato this.data, ci ho scritto", this.iscrizione);
                  this.loadData();
                  this.ultimoAnnoValido = val;
                } else {
                  const dialogRef = this._dialog.open(DialogOkComponent, {
                    width: '320px',
                    data: {titolo: "ATTENZIONE!", sottoTitolo: "Non ci sono iscrizioni<br>dell'alunno specificato<br>per l'anno scolastico selezionato"}
                  });
                  dialogRef.afterClosed().subscribe(() => {
                    this.formRetta.controls['selectAnnoScolastico'].setValue(this.ultimoAnnoValido);
                  });
                }
                }
              );
            }
            
          )


  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit() {
    this.obsAnni$ = this.svcAnni.list();
    // console.log ("retta.edit - ngOnInit", this.data);
    this.formRetta.controls['selectAnnoScolastico'].setValue(this.iscrizione.classeSezioneAnno.anno);
  }

  reLoadData() {
    this.svcIscrizioni.get(this.iscrizione.id).subscribe(nuovaIscrizione => {
      console.log ("reload", nuovaIscrizione)
      this.iscrizione = nuovaIscrizione;
      this.loadData();
    });

  }


  loadData() {
    console.log ("***************retta-edit - LOADDATA");


    this.formRetta.controls['nomeCognomeAlunno'].setValue(
      this.iscrizione.alunno.persona.nome + " " + this.iscrizione.alunno.persona.cognome
    );

    function getUltimoGiornoDelMese(mese: number, anno: number): Date {
      // mese: 0 = gennaio, 11 = dicembre
      // Imposta il giorno 0 del mese successivo → equivale all'ultimo giorno del mese corrente
      return new Date(anno, mese + 1, 0);
    }

    this.retteMese = [];
    //inizializzo i 12 retteMese
    for (let i = 0; i <= 11; i++) {
      const anno = i >= 8 ? this.anno1 : this.anno2;
      this.retteMese[i] = {
        iscrizioneID: this.iscrizione.id,
        scadenzaRettaID: 0,
        rettaID: this.iscrizione.retta? this.iscrizione.retta.id : null,  //serve nel caso in cui non esista scadenzaRetta e il compoment retta-mese debba crearla in fase di save
        dtScadenza: getUltimoGiornoDelMese(i, anno), //devo mettere l'ultimo giorno del mese dell'anno giusto
        quotaDefault: 0,
        quotaConcordata: 0,
        totPagamenti: 0,
      };
    }

    console.log ("retta-edit - loadData - this.iscrizione", this.iscrizione);

    const scadenzeRetta = this.iscrizione.retta?._ScadenzeRette;

    scadenzeRetta?.forEach(scadenzaRetta => {
      const data = new Date(scadenzaRetta.dtScadenza);
      const mese = data.getMonth(); 
      // Somma l'importo alla quotaConcordata del mese corrispondente
      this.retteMese[mese].quotaConcordata += scadenzaRetta.importo;
      this.retteMese[mese].scadenzaRettaID = scadenzaRetta.id;
    });

    const pagamentiRette = this.iscrizione.retta?._PagamentiRette;

    this.totPagamentiAnno = 0;
    pagamentiRette?.forEach(pagamentoRetta => {
      const data = new Date(pagamentoRetta.pagamento!.dtPagamento);
      const mese = data.getMonth();
      // Somma l'importo al totPagamenti del mese corretto
      this.retteMese[mese].totPagamenti! += pagamentoRetta.pagamento!.importo;
      this.totPagamentiAnno += pagamentoRetta.pagamento!.importo;

    });


  }


  compareAnni = (a: any, b: any): boolean => {
    return a && b && a.id === b.id;
  }

  onPanelOpened() {
    this.updateDialogSize('500px');
  }

  // Quando il pannello viene chiuso
  onPanelClosed() {
    this.updateDialogSize('324px');
  }

  updateDialogSize(height: string) {
    setTimeout(() => {
      this._dialogRef.updateSize('850px', height); // Ridimensiona il dialog in base al contenuto
    }, 100); // Aggiungi un piccolo ritardo per assicurarti che il layout sia stato applicato
  }

  pagamentiAlunnoAnno(iscrizione: CLS_Iscrizione) {
    this._dialogRef.close();
    console.log("apro pagamenti page con questi parametri", iscrizione.alunno.persona.nome, iscrizione.alunno.persona.cognome, iscrizione.classeSezioneAnno.annoID);
    this.router.navigate(['/pagamenti'], {
      queryParams: {
        nomeRouted: iscrizione.alunno.persona.nome,
        cognomeRouted: iscrizione.alunno.persona.cognome,
        annoIDRouted: iscrizione.classeSezioneAnno.annoID
      }
    });
  }

//#endregion

//#region ----- Interazioni Varie Interfaccia --




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
