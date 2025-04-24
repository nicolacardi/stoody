import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { concatMap, tap }                       from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';

//services
import { AlunniService }                        from '../../alunni/alunni.service';
import { RetteService }                         from '../rette.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { AnniScolasticiService }                from 'src/app/_components/anni-scolastici/anni-scolastici.service';
import { ParametriService }                     from 'src/app/_components/impostazioni/parametri/parametri.service';

//mdoels
import { ASC_AnnoScolastico }                   from 'src/app/_models/ASC_AnnoScolastico';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { PAG_Retta }                            from 'src/app/_models/PAG_Retta';
import { PAG_ScadenzaRetta } from 'src/app/_models/PAG_ScadenzaRetta';
import { ScadenzeRetteService } from '../scadenzeRette.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-retta-calcolo-alunno',
  templateUrl: './retta-calcolo-alunno.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettaCalcoloAlunnoComponent implements OnInit {

//#region ----- Variabili ----------------------
form! :                             UntypedFormGroup;

  public mesiArr =                    [ 8,    9,    10,   11,   0,   1,    2,    3,    4,    5,    6,    7];
  public placeholderMeseArr=          ["SET","OTT","NOV","DIC","GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO"];

  public QuoteDefault =               "000000000000";
  public QuoteRidotteFratelli : boolean = false;

  public hasFratelloMaggiore  : boolean = false;
  public anno!:                        ASC_AnnoScolastico;


  public strDescrizione!:              string;
  public strDescrizioneClasse!:              string;

//#endregion

//#region ----- ViewChild Input Output -------

  @Input() iscrizione!:         CLS_Iscrizione;

  @ViewChildren('QuoteListElement') QuoteList!: QueryList<any>;
  @Output('ricalcoloRette')
  ricalcoloRetteEmitter = new EventEmitter<string>();
//#endregion
  constructor(
    private svcParametri      : ParametriService,
    private svcAnni           : AnniScolasticiService,
    private svcIscrizioni     : IscrizioniService,
    private svcAlunni         : AlunniService,
    private svcRette          : RetteService,
    private svcScadenzeRette  : ScadenzeRetteService,
    private _snackBar         : MatSnackBar,
    private fb                : UntypedFormBuilder,

    
  ) {
    this.svcParametri.getByParName('QuoteDefault').subscribe(
      x=>{
        this.QuoteDefault = x.parValue
      });
      
    this.svcParametri.getByParName('QuoteRidotteFratelli').subscribe(
      x=> {
        if(x.parValue == "1") this.QuoteRidotteFratelli = true;
      });

      this.form = this.fb.group({
        quotaConcordata:                [null, Validators.required],
      });
   }

  ngOnInit(): void {

    //estraggo anno e iscrizione, utili per quando dovrò procedere con la put
    this.svcAnni.get(this.iscrizione.classeSezioneAnno.annoID).subscribe (anno => this.anno = anno);  
    this.caricaQuotaConcordataDefault();
  }

  caricaQuotaConcordataDefault() {
    this.svcIscrizioni.getByAlunnoAndAnno(this.iscrizione.classeSezioneAnno.annoID, this.iscrizione.alunnoID).pipe (
      tap((iscrizione: CLS_Iscrizione) => this.iscrizione = iscrizione),
      concatMap( (iscrizione: CLS_Iscrizione) => this.svcAlunni.hasFratelloMaggiore(this.iscrizione.classeSezioneAnno.annoID, this.iscrizione.alunnoID).pipe(
        tap ( val =>  {
          this.strDescrizioneClasse= "Di seguito la quota annuale prevista per la classe "+ iscrizione.classeSezioneAnno.classeSezione.classe!.descrizione2;
          if (val && this.QuoteRidotteFratelli) {
            this.strDescrizione = "L'alunno ha almeno un fratello maggiore";
            
            this.form.controls['quotaConcordata'].setValue(iscrizione.classeSezioneAnno.classeSezione.classe!.importo2);
          } else {
            this.strDescrizione = "L'alunno non ha alcun fratello maggiore";
            this.form.controls['quotaConcordata'].setValue(iscrizione.classeSezioneAnno.classeSezione.classe!.importo);
          }
        })
      ))
    ).subscribe();
  }

  getUltimoGiornoDelMese(mese: number, anno: number): Date {
    return new Date(anno, mese + 1, 0);
  }


  inserisciRetteConcordate() {
    const arrCheckMesi = this.QuoteList.toArray();
    const anno1 = this.anno.anno1;
    const anno2 = this.anno.anno2;
    const importoAnno = this.form.controls['quotaConcordata'].value;
  
    const mesiSelezionati = arrCheckMesi.filter(m => m.checked).length;
    const importoMeseBase = Math.floor(importoAnno / mesiSelezionati);
    const resto = importoAnno - (importoMeseBase * mesiSelezionati);
  
    // aggiorna stato iscrizione
    this.svcIscrizioni.updateStato({
      id: this.iscrizione.id,
      codiceStato: 30
    }).subscribe();
  
    const retta: PAG_Retta = {
      id: this.iscrizione.retta?.id ?? 0,
      iscrizioneID: this.iscrizione.id,
      quotaDefault: importoAnno,
      quotaConcordata: importoAnno
    };
  
    const salvaScadenze = (rettaID: number) => {
      let primaQuota = true;
      const richiesteScadenze = [];
  
      for (let i = 0; i < 12; i++) {
        if (!arrCheckMesi[i].checked) continue;
  
        const mese = i <= 3 ? i + 9 : i - 3;
        const annoRetta = i <= 3 ? anno1 : anno2;
        const importoMese = primaQuota ? importoMeseBase + resto : importoMeseBase;
        if (primaQuota) primaQuota = false;
  
        const dtScadenza = this.formatDateToString(this.getUltimoGiornoDelMese(mese-1, annoRetta));



        const scadenza = this.iscrizione.retta?._ScadenzeRette?.[i] ?? null;
  
        const scadenzaRetta: PAG_ScadenzaRetta = {
          id: scadenza?.id ?? 0,
          rettaID,
          importo: importoMese,
          dtScadenza
        };
  
        console.log ("sto per inserire questa:", scadenza);
        const richiesta = scadenza
          ? this.svcScadenzeRette.put(scadenzaRetta)
          : this.svcScadenzeRette.post(scadenzaRetta);
  
        richiesteScadenze.push(richiesta);
      }
  
      forkJoin(richiesteScadenze).subscribe({
        next: () => {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Rette inserite per l\'alunno',
            panelClass: ['green-snackbar']
          });
          this.ricalcoloRetteEmitter.emit();
        },
        error: () => {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Errore durante l\'inserimento delle scadenze',
            panelClass: ['red-snackbar']
          });
        }
      });
    };
  
    if (this.iscrizione.retta) {
      this.svcRette.put(retta).subscribe({
        next: () => salvaScadenze(retta.id),
        error: () => {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Errore durante l\'aggiornamento della retta',
            panelClass: ['red-snackbar']
          });
        }
      });
    } else {
      this.svcRette.post(retta).subscribe({
        next: res => salvaScadenze(res.id),
        error: () => {
          this._snackBar.openFromComponent(SnackbarComponent, {
            data: 'Errore durante l\'inserimento della retta',
            panelClass: ['red-snackbar']
          });
        }
      });
    }
  }
  
  
  

  formatDateToString(date: Date): string {
    // Formato yyyy-MM-dd (compatibile con .NET DateTime)
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    return `${yyyy}-${mm}-${dd}`;
  }

}






