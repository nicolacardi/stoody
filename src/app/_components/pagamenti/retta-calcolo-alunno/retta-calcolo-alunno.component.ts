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
    private svcParametri:                 ParametriService,
    private svcAnni:                      AnniScolasticiService,
    private svcIscrizioni:                IscrizioniService,
    private svcAlunni:                    AlunniService,
    private svcRette:                     RetteService,
    private _snackBar:                    MatSnackBar, 
    private fb:                           UntypedFormBuilder, 

    
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

  inserisciRetteConcordate(){


    //********************************************************************************************************************************************************
    //ATTENZIONE! DEVO ESSERE SICURO CHE SE C'è UNA RETTA IN UN MESE CI SIA IN TUTTI I 12 MESI ALTRIMENTI LA UPDATE NON FUNZIONA CORRETTAMENTE! ASSICURARSENE!

    //ho creato in ngOnInit l'oggetto anno e  in caricaQuotaConcordataDefault l'oggetto iscrizione, ora vado a usarli

    let annoRetta = 0;
    let importoMese  = 0;

    let importoMeseRound  = 0;
    let restoImportoMese  = 0;

    let mese = 0 ;
    let i = 0;
    let contaMesi = 0;

    let arrCheckMesi = this.QuoteList.toArray();
    for( i=1; i<=12; i++) if (arrCheckMesi[i-1].checked == true) contaMesi++;
  
    let anno1 = this.anno.anno1;
    let anno2 = this.anno.anno2;

    let importoAnno = this.form.controls['quotaConcordata'].value;

    importoMeseRound = Math.floor(importoAnno/contaMesi);
    restoImportoMese = importoAnno - importoMeseRound * contaMesi;  //per applicare il resto alla prima quota devo essere sicuro che le quote vengano passate in ordine, quindi nel service metto una orderby

    let primaQuota =  true;

    //aggiorno lo status inserendo il codice 20
    let formData = {
      id: this.iscrizione.id,
      codiceStato: 30
    }
    this.svcIscrizioni.updateStato(formData).subscribe();

    this.svcRette.getByAlunnoAnno(this.iscrizione.alunnoID, this.iscrizione.classeSezioneAnno.annoID ).subscribe (
      async (retteAnnoAlunno) => {
    
      //se array vuoto, INSERT
      if(!retteAnnoAlunno){

        const d = new Date();
        d.setSeconds(0,0);
        let dateNow = d.toISOString().split('.')[0];

        //loop per i 12 mesi, i primi quattro dell'anno1, gli altri dell'anno2
        for( i=1; i<=12; i++){
          if (i <= 4) {
            mese = i + 8;
            annoRetta = anno1;
          } 
          else {
            mese = i - 4;
            annoRetta = anno2;
          }

          if (arrCheckMesi[i-1].checked == false) 
            importoMese = 0;             
          else {
              if (primaQuota) {
                importoMese = importoMeseRound + restoImportoMese;
                primaQuota = false;
              } 
              else  importoMese = importoMeseRound;
          }

          let rettaMese: PAG_Retta = {
            id : 0,
            iscrizioneID:           this.iscrizione.id,
            // annoRetta:              annoRetta,
            // meseRetta:              mese,
            quotaDefault:           importoMese,
            quotaConcordata:        importoMese,
            
            note:                   '',
            dtIns:                  dateNow,
            dtUpd:                  dateNow,
            userIns:                1,
            userUpd:                1
          };
          this.svcRette.post(rettaMese).subscribe({
            next: res =>   this._snackBar.openFromComponent(SnackbarComponent, {data: 'Rette inserite per l\'alunno', panelClass: ['green-snackbar']}),
            error: err=>  this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore durante l\'inserimento delle rette', panelClass: ['red-snackbar']})
          });
        } 
      } else {

        //problema: dobbiamo attendere le chiamate asincrone (put) che si trovano dentro il ciclo 
        //PRIMA di passare oltre, alla emit: una forEach impedisce di lavorare forzando delle sincronie
        //soluzione la promiseAll oppure un ciclo for of sostituisce la forEach
        //la forEach è inadatta perchè si possano aspettare le funzioni asincrone che essa contiene
        //Se si usa una PromiseAll è necessario attenderla (await) [e quindi tra l'altro dichiarare la funzione "padre" 
        //this.svcRette.listByAlunnoAnno come async]

        //ma quanto sopra NON BASTA: ANCHE le singole chiamate asincrone (put) interne al ciclo devono essere attese e quindi a loro volta
        //trasformate in promise e awaited [il che comporta, nel caso for of, comunque che this.svcRette.listByAlunnoAnno sia async
        //e che, nel caso di PromiseAll questa sia async].
        //Solo se entrambe (promiseAll/for of e chiamate interne)
        //sono awaited allora si attende che tutte siano risolte prima della emit

          //await Promise.all(retteAnnoAlunno.map( async rettaMese=> {  
                    //****DA RIFARE TUTTO */
                    // for (let rettaMese of retteAnnoAlunno) { 
                    //   //mese = rettaMese.meseRetta;  //rettaMese
                    //   if (mese <= 8) 
                    //     i = mese + 3;
                    //   else 
                    //     i = mese - 9;
                      
                    //   if (arrCheckMesi[i].checked == false)
                    //     importoMese = 0;
                    //   else {
                    //     if (primaQuota) {
                    //       importoMese = importoMeseRound + restoImportoMese;
                    //       primaQuota = false;
                    //     } 
                    //     else importoMese = importoMeseRound;
                    //   }
                    //   rettaMese.quotaConcordata = importoMese;
                    //   rettaMese.quotaDefault = importoMese;
                    //   //ecco qui: non una subscribe ma una toPromise poi awaited e "thenned"
                    //   const miaput = this.svcRette.put(rettaMese).toPromise();
                    //   await miaput.then(
                    //     //() => console.log ("put singola")
                    //   );      
                    // };
          //));
          
          this._snackBar.openFromComponent(SnackbarComponent, {data: 'Rette inserite per l\'alunno', panelClass: ['green-snackbar']})
          this.ricalcoloRetteEmitter.emit();
      }
    
    });
      
    //https://advancedweb.hu/how-to-use-async-functions-with-array-foreach-in-javascript/   NON FUNZIONA QUI DA NOI
    //https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404                 SPIEGA PERCHE' NON PASSA PER ALCUNI PEZZI PERO' NON FUNZIONA
    //https://masteringjs.io/tutorials/fundamentals/async-foreach
  }
  


  async testForEachAsync () {

    //ecco il ciclo foreach riscritto per attendere la risoluzione delle chiamate asincrone in esso contenute
    let arr =[410,411,412]
        const promiseall = await Promise.all(arr.map( async id=> {
            const myget = this.svcRette.get(id).toPromise();
            await myget.then (val => console.log(val));
            // await myget.then( val => console.log (val));
          
        }));
  




    // const arr = [1, 2, 3];

    // await Promise.all(arr.map(async (i) => {
    //   await setTimeout(() => {
    //     console.log("a")
    //   }, 10-i);

    //   console.log(i);
    // }));
    
    // console.log("Finished async");

    //3
    //2
    //1
    //Finished async
    //a
    //a
    //a NON FUNZIONA


    // let promise = new Promise ((resolve, reject) => {
    //   setTimeout (() => {
    //     resolve ("done");
    //     console.log ("done");
    // }, 1000)
    // });

    // console.log ("await");
    // let result = await promise;
    // console.log ("dopo await");

    // //done
    // //await
    // //dopo await

    // //FUNZIONA MA SOLO UN CICLO, NON C'E' UN FOR
}

}






