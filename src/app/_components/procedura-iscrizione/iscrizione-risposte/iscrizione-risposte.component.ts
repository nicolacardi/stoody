//#region ----- IMPORTS ------------------------
import { Component, Input, OnInit }             from '@angular/core';
import { DomandeService }                       from '../../impostazioni/domande/domande.service';
import { MatDialog }                            from '@angular/material/dialog';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatTableDataSource }                   from '@angular/material/table';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//services
import { RisorseService }                       from '../../impostazioni/risorse/risorse.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { RetteService }                         from '../../pagamenti/rette.service';
import { FilesService }                         from '../../pagelle/files.service';
import { ConsOrientativiService }               from './consorientativi.service';
import { CertCompetenzeService }                from './certcompetenze.service';

//models
import { _UT_Domanda }                          from 'src/app/_models/_UT_Domanda';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { IscrizioneRisposteService }            from './iscrizione-risposte.service';
import { CLS_IscrizioneRisposta }               from 'src/app/_models/CLS_IscrizioneRisposta';
import { RPT_TagDocument }                      from 'src/app/_models/RPT_TagDocument';
import { DOC_CertCompetenze } from 'src/app/_models/DOC_CertCompetenze';
import { DOC_ConsOrientativo } from 'src/app/_models/DOC_ConsOrientativo';



//#endregion
@Component({
  selector: 'app-iscrizione-risposte',
  templateUrl: './iscrizione-risposte.component.html',
  styleUrls: ['../procedura-iscrizione.css']
})
export class IscrizioneRisposteComponent implements OnInit  {

//#region ----- Variabili ----------------------
  chiuso= false;
  docEsistente = false;
  certCompetenze:                               DOC_CertCompetenze = {iscrizioneID : 0};
  consOrientativo:                              DOC_ConsOrientativo= {iscrizioneID : 0};
  iscrizione!:                                  CLS_Iscrizione;
  rettaConcordata!:                             number;
  obsDomande$!:                                 Observable<_UT_Domanda[]>;
  formRisposte! :                               UntypedFormGroup;
  questions: any[] = []; // Assuming questions is an array of question objects

  matDataSource = new MatTableDataSource<_UT_Domanda>();
  
  displayedColumns: string[] = [
    "domanda",
    "opzioni",
    "allegato"
  ];

  
//#endregion

//#region ----- ViewChild Input Output -------
  @Input() iscrizioneID!:                       number;
  @Input() contesto!:                           string;
//#endregion

//#region ----- Constructor --------------------
  
constructor(private svcDomande:                 DomandeService,
            private fb:                         UntypedFormBuilder, 
            private svcRisorse:                 RisorseService,
            private svcIscrizioni:              IscrizioniService,
            private svcFile:                    FilesService,

            private svcIscrizioneRisposte:      IscrizioneRisposteService,
            private svcConsOrientativi:         ConsOrientativiService,
            private svcCertCompetenze:          CertCompetenzeService,

            private svcRette:                   RetteService,

            private _loadingService:            LoadingService,
            public _dialog:                     MatDialog,
            private _snackBar:                  MatSnackBar,
            ) {

    this.formRisposte = this.fb.group({})
            }
//#endregion


  ngOnChanges() {
    if (this.iscrizioneID && this.contesto)
      //console.log ("iscrizione-risposte - ngOnChanges - iscrizioneID", this.iscrizioneID) 
      this.loadData();
  }


//#region ----- LifeCycle Hooks e simili-------
  ngOnInit(): void {
  }

  loadData() {
    if (this.iscrizioneID && this.contesto && this.iscrizioneID !=0) {
      //console.log ("loadData iscrizioneID", this.iscrizioneID);

      switch (this.contesto) {
        case 'CertificazioneCompetenze':
          this.svcCertCompetenze.listByIscrizione(this.iscrizioneID).subscribe(res => {
            //console.log ("iscrizione-risposte - loadData - cert Competenze estratta", res, this.iscrizioneID);
            if (res.length !=0) {
              // console.log("metto docesistente a true");
              this.docEsistente = true;
              this.certCompetenze = res[0]
              if (this.certCompetenze.statoID! >1) {this.chiuso = true} else {this.chiuso = false}
            } else {
              this.certCompetenze = {iscrizioneID : this.iscrizioneID};
              // console.log("metto docesistente a false");
              this.docEsistente = false;
            }
          });
          
          break;
        case 'ConsiglioOrientativo':
          this.svcConsOrientativi.listByIscrizione(this.iscrizioneID).subscribe(res => {
            if (res.length !=0) {
              this.docEsistente = true;
              this.consOrientativo = res[0]
              if (this.consOrientativo.statoID! >1) {this.chiuso = true} 
            } else {
              this.consOrientativo = {iscrizioneID : this.iscrizioneID};
              this.docEsistente = false;
            }
          });
          break;
      }

      if (this.iscrizioneID ==0) {
        //console.log("iscrizione-risposte - loadData - reset formRisposte")
        this.formRisposte.reset(); //non sembra funzionare
      }


      // console.log("iscrizione-risposte - loadData");
      this.svcIscrizioni.get(this.iscrizioneID).subscribe(iscrizione=> {this.iscrizione = iscrizione;})
      this.svcRette.sumConcordateByIscrizione(this.iscrizioneID).subscribe(rettaConcordata=> {this.rettaConcordata = rettaConcordata;})
      // console.log("iscrizione-risposte - contesto", this.contesto, this.iscrizioneID);

      //this.obsDomande$ = this.svcDomande.list()

      this.obsDomande$ = this.svcDomande.listByContestoEIscrizioneConRisposta(this.contesto, this.iscrizioneID)
      //.pipe( 
        //map(res=> res.filter((x) => x.contesto == this.contesto)), //carico domande x consensi o dati economici a seconda del valore in input-spostato nel WS
        //tap(val=> console.log(val))
      //)
      ;  
      const loadDomande$ =this._loadingService.showLoaderUntilCompleted(this.obsDomande$);

      loadDomande$.subscribe(
        questions =>   {

          this.matDataSource.data = questions;
          //devo aggiungere al form un controllo x ogni domanda (di due tipi diversi)
          //in modo che il pulsante di "Salva e continua" si disabiliti se uno non risponde a tutto
          //element.id è l'id della domanda cioè di _UT_Domande
          this.questions = questions;
          this.formRisposte.reset();
            this.questions.forEach((element) => {
              // console.log ("iscrizione-risposte - loadData - element", element);
              if (element.tipo == 'Scelta Singola') {
                if (element.numOpzioni >1) {
                  this.formRisposte.addControl(element.id, this.fb.control('', Validators.required));

                  if (element.risposta != null) {
                    if (element.risposta.risposta1) this.formRisposte.controls[element.id].setValue('1') 
                    if (element.risposta.risposta2) this.formRisposte.controls[element.id].setValue('2') 
                    if (element.risposta.risposta3) this.formRisposte.controls[element.id].setValue('3') 
                    if (element.risposta.risposta4) this.formRisposte.controls[element.id].setValue('4') 
                    if (element.risposta.risposta5) this.formRisposte.controls[element.id].setValue('5') 
                    if (element.risposta.risposta6) this.formRisposte.controls[element.id].setValue('6') 
                    if (element.risposta.risposta7) this.formRisposte.controls[element.id].setValue('7') 
                    if (element.risposta.risposta8) this.formRisposte.controls[element.id].setValue('8') 
                    if (element.risposta.risposta9) this.formRisposte.controls[element.id].setValue('9') 
                  } 
                }
                if (element.numOpzioni ==1) {
                  this.formRisposte.addControl(element.id, this.fb.control('', Validators.requiredTrue));
                  if (element.risposta != null) {this.formRisposte.controls[element.id].setValue(element.risposta.risposta1) }
                  
                }

              }

              if (element.tipo == 'Scelta Multipla') { //qui devo aggiungere N Controls......e non uno solo!
                this.formRisposte.addControl(element.id+"_1", this.fb.control(''));
                this.formRisposte.addControl(element.id+"_2", this.fb.control(''));
                this.formRisposte.addControl(element.id+"_3", this.fb.control(''));
                this.formRisposte.addControl(element.id+"_4", this.fb.control(''));
                this.formRisposte.addControl(element.id+"_5", this.fb.control(''));
                this.formRisposte.addControl(element.id+"_6", this.fb.control(''));
                this.formRisposte.addControl(element.id+"_7", this.fb.control(''));
                this.formRisposte.addControl(element.id+"_8", this.fb.control(''));
                this.formRisposte.addControl(element.id+"_9", this.fb.control(''));

                if (element.risposta!= null) {
                  this.formRisposte.controls[element.id+"_1"].setValue(element.risposta.risposta1);
                  this.formRisposte.controls[element.id+"_2"].setValue(element.risposta.risposta2)
                  this.formRisposte.controls[element.id+"_3"].setValue(element.risposta.risposta3)
                  this.formRisposte.controls[element.id+"_4"].setValue(element.risposta.risposta4)
                  this.formRisposte.controls[element.id+"_5"].setValue(element.risposta.risposta5)
                  this.formRisposte.controls[element.id+"_6"].setValue(element.risposta.risposta6)
                  this.formRisposte.controls[element.id+"_7"].setValue(element.risposta.risposta7)
                  this.formRisposte.controls[element.id+"_8"].setValue(element.risposta.risposta8)
                  this.formRisposte.controls[element.id+"_9"].setValue(element.risposta.risposta9)
                }         
              }
              if (element.tipo == 'Risposta Libera') {
                this.formRisposte.addControl(element.id+"_RL", this.fb.control('', Validators.required));
                if (element.risposta!= null) {
                  this.formRisposte.controls[element.id+"_RL"].setValue(element.risposta.rispostaLibera);
                }    
              }
            })
        });

    }
  }
//#endregion


//#region ----- Altri metodi -------------------

  chiudiDocumento() {
    switch (this.contesto) {
      case 'CertificazioneCompetenze':
        this.certCompetenze.statoID = 2;
        this.svcCertCompetenze.put(this.certCompetenze).subscribe(() => this.loadData());

        break;
      case 'ConsiglioOrientativo':
        this.consOrientativo.statoID = 2;
        this.svcConsOrientativi.put(this.consOrientativo).subscribe(() => this.loadData());
        break;
    }
  }

  apriDocumento() {
    switch (this.contesto) {
      case 'CertificazioneCompetenze':
        this.certCompetenze.statoID = 1;
        this.svcCertCompetenze.put(this.certCompetenze).subscribe(() => this.loadData());
        this.loadData();
        break;
      case 'ConsiglioOrientativo':
        this.consOrientativo.statoID = 1;
        this.svcConsOrientativi.put(this.consOrientativo).subscribe(() => this.loadData());
        break;
    }
  }
  
  downloadAllegato(risorsaID:number){
    if (risorsaID == null) return;
    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Richiesta download inviata...', panelClass: ['green-snackbar']});
    this.svcRisorse.get(risorsaID).subscribe(
      res=> {
        const pdfData = res.fileBase64.split(',')[1]; // estrae la stringa base64 dalla virgola in avanti
        const source = `data:application/pdf;base64,${pdfData}`;
        const link = document.createElement("a");
        link.href = source;
        link.download = `${res.nomeFile}.pdf`
        link.click();
      }
    )
  }

  async save(contesto: string) {
    //questa funzione eesegue la save del modulo di cert competenze e cons orientativo
    //usa contesto e l'iscrizione per stabilire come salvare le risposte. Infatti Iscrizione è chiave di CLS_IscrizioenRisposte. 
    //Contesto serve solo per scegliere il template giusto

    //Ma qui dovrebbe ANCHE andare a salvare nella tabella
    //DOC_CertCompetenze O DOC_ConsOrientativi a seconda e dovrebbe anche farlo con POST o PUT a seconda
    //in base a contesto opero sull'uno o sull'altro


    //console.log("iscrizione-risposte - save - contesto:", contesto);
    //console.log("iscrizione-risposte - save - iscrizioneID:", this.iscrizioneID);
    //console.log("iscrizione-risposte - save - iscrizioneID:", this.certCompetenze);

    switch (contesto) {
      case 'CertificazioneCompetenze':
        let certCompetenzePOST : DOC_CertCompetenze = {iscrizioneID : this.iscrizioneID, statoID: 1};
        //console.log("iscrizione-risposte - save - contesto: certCompetenze", this.certCompetenze);
        if (this.certCompetenze.id)   this.svcCertCompetenze.put(this.certCompetenze).subscribe(); //di fatto aggiorna dtUpd e userUpd nel WS
        else                          this.svcCertCompetenze.post(certCompetenzePOST).subscribe();
        break;
      case 'ConsiglioOrientativo':
        let consOrientativoPOST : DOC_ConsOrientativo = {iscrizioneID : this.iscrizioneID, statoID: 1};
        if (this.consOrientativo.id)  this.svcConsOrientativi.put(this.consOrientativo).subscribe(); //di fatto aggiorna dtUpd e userUpd nel WS
        else                          this.svcConsOrientativi.post(consOrientativoPOST).subscribe();
        break;
    }

    //che sia il caso di creare un component contenitore di iscrizione risposte nel quale mettere i pulsanti di save download e blocco?
    //quelli non sarebbero propriamente di iscrizione risposte...o meglio non lo sarebbero download e blocco

    //cancello prima il record di iscrizione risposte che ha iscrizione e 
    await firstValueFrom(this.svcIscrizioneRisposte.deleteByIscrizioneAndContesto(this.iscrizioneID, contesto));


    let formValues! : any;
    formValues = this.formRisposte.value;
    // console.log("iscrizione-risposte - save - formValues", formValues);
    //devo trasformare questo oggetto in un altro
    //ad esempio da
    // const formValues = {
    //   3: true,
    //   8: '3',
    //   11: true,
    //   13: true,
    //   14: 2,
    //   15: true,
    //   16: 3,
    //   17: 4,
    //   18: 5
    //   28_1: '',
    //   28_2: true,
    //   28_3: true,
    //   28_4: ''
    //...
    // }; 
    //deve diventare

    // domandaID risposta1 risposta2 risposta3 risposta4 risposta5 risposta6 risposta7 risposta8 risposta9
    // 3 true false false false false false false false
    // 8 false false true false false false false false
    // 11 true false false false false false false false
    // 13 true false false false false false false false
    // 14 false true false false false false false false
    // 15 true false false false false false false false
    // 16 false false true false false false false false
    // 28 false true true false false false false false



    //seve un ciclo diverso per i casi in cui la key contiene _ 


    for (const key in formValues) {
      // console.log("***************************");

      // console.log("key",key);
      if (formValues.hasOwnProperty(key)) {
        const value = formValues[key]
        // console.log("value",value);
        const domandaID = parseInt(key);
        // console.log("domandaID",domandaID);
        const parts = key.split('_');

        let rispostaLibera= '';
        let risposta1: any;
        let risposta2: any;
        let risposta3: any;
        let risposta4: any;
        let risposta5: any;
        let risposta6: any;
        let risposta7: any;
        let risposta8: any;
        let risposta9: any;

        let proceedToSave = false;
        //Ci sono tre casi
        //1 la key è singola del tipo xx_RL (domanda a Risposta Libera)
        //2 la key è multipla del tipo xx_1 xx_2 xx_3....xx_6 (domanda a risposta multipla)
        //3 la key è singola del tipo xx (domanda a Risposta Unica/optiongroup)

        if (key.indexOf('_RL')!== -1) {         //Risposta Libera
          proceedToSave = true;
          rispostaLibera = formValues[key];
          risposta1 = false
          risposta2 = false;
          risposta3 = false;
          risposta4 = false;
          risposta5 = false;
          risposta6 = false;
          risposta7 = false;
          risposta8 = false;
          risposta9 = false;
        } else if (key.indexOf('_1')!== -1) {   //Risposta Multipla (ci sono 6 keys)
          proceedToSave = true;
          risposta1 = formValues[key] === true ? true : false;
          risposta2 = formValues[parts[0]+"_2"] === true ? true : false;
          risposta3 = formValues[parts[0]+"_3"] === true ? true : false;
          risposta4 = formValues[parts[0]+"_4"] === true ? true : false;
          risposta5 = formValues[parts[0]+"_5"] === true ? true : false;
          risposta6 = formValues[parts[0]+"_6"] === true ? true : false;
          risposta7 = formValues[parts[0]+"_7"] === true ? true : false;
          risposta8 = formValues[parts[0]+"_8"] === true ? true : false;
          risposta9 = formValues[parts[0]+"_9"] === true ? true : false;
        } else if (parts.length <2) {           //Risposta Singola (c'è una sola risposta true, le altre vanno poste a false)
          proceedToSave = true;
          //Se non c'è _ nella chiave allora significa che la risposta data è UNA SOLA, le altre vanno impostate a false a prescindere
          risposta1 = value === true || parseInt(value) === 1 ? true : false;
          risposta2 = parseInt(value) === 2 ? true : false;
          risposta3 = parseInt(value) === 3 ? true : false;
          risposta4 = parseInt(value) === 4 ? true : false;
          risposta5 = parseInt(value) === 5 ? true : false;
          risposta6 = parseInt(value) === 6 ? true : false;
          risposta7 = parseInt(value) === 7 ? true : false;
          risposta8 = parseInt(value) === 8 ? true : false;
          risposta9 = parseInt(value) === 9 ? true : false;
        }
        // console.log("proceedtoSave", proceedToSave);
        if (proceedToSave) {
          let form: CLS_IscrizioneRisposta;
          form  = {
            iscrizioneID: this.iscrizioneID,
            domandaID: domandaID,
            // tipo: contesto,
            rispostaLibera: rispostaLibera,
            risposta1: risposta1,
            risposta2: risposta2,
            risposta3: risposta3,
            risposta4: risposta4,
            risposta5: risposta5,
            risposta6: risposta6,
            risposta7: risposta7,
            risposta8: risposta8,
            risposta9: risposta9,
          };
          // console.log ("iscrizione-risposte - save - form to post", form);
          this.svcIscrizioneRisposte.post(form).subscribe( //SEMBRA FUNZIONARE MA questa è una POST...E QUANDO DEVE FARE UNA PUT??????**************************
            {
              next: res=> {
                // console.log ("inserita domanda", domandaID)
                this.loadData();
              },
              error: err=> {
                // console.log ("errore nell'inserimento", domandaID)
              }
            }
          )
        }
      }
    }
  }
 
  async downloadPreviewDocumento(contesto: string) {

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Richiesta download inviata...', panelClass: ['green-snackbar']});

    let nomeFile = contesto  + '_' + this.iscrizione.classeSezioneAnno.anno.annoscolastico + "_" + this.iscrizione.alunno.persona.cognome + ' ' + this.iscrizione.alunno.persona.nome + '.docx'

    console.log (nomeFile);
  
    let tagDocument : RPT_TagDocument = {
      templateName: contesto,
      tagFields:
      [
        { tagName: "AnnoScolastico",            tagValue: this.iscrizione.classeSezioneAnno.anno.annoscolastico},
        { tagName: "Anno1",                     tagValue: this.iscrizione.classeSezioneAnno.anno.anno1.toString()},
        { tagName: "Anno2",                     tagValue: this.iscrizione.classeSezioneAnno.anno.anno2.toString()},

        { tagName: "ilFigliolaFiglia",          tagValue: this.iscrizione.alunno.persona.genere == "M"? "il figlio": "la figlia"},

        { tagName: "NomeAlunno",                tagValue: this.iscrizione.alunno.persona.nome},
        { tagName: "CognomeAlunno",             tagValue: this.iscrizione.alunno.persona.cognome},
        { tagName: "ComuneNascitaAlunno",       tagValue: this.iscrizione.alunno.persona.comuneNascita},
        { tagName: "ProvNascitaAlunno",         tagValue: this.iscrizione.alunno.persona.provNascita},
        { tagName: "dtNascitaAlunno",           tagValue: Utility.formatDate(this.iscrizione.alunno.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { tagName: "PaeseNascitaAlunno",        tagValue: this.iscrizione.alunno.persona.nazioneNascita},
        { tagName: "CFAlunno",                  tagValue: this.iscrizione.alunno.persona.cf},
        { tagName: "IndirizzoAlunno",           tagValue: this.iscrizione.alunno.persona.indirizzo},
        { tagName: "CAPAlunno",                 tagValue: this.iscrizione.alunno.persona.cap},
        { tagName: "ComuneAlunno",              tagValue: this.iscrizione.alunno.persona.comune},
        { tagName: "ProvAlunno",                tagValue: this.iscrizione.alunno.persona.prov},
        { tagName: "TelAlunno",                 tagValue: this.iscrizione.alunno.persona.telefono},
        { tagName: "EmailAlunno",               tagValue: this.iscrizione.alunno.persona.email},
        { tagName: "ckDisabile",                tagValue: this.iscrizione.alunno.ckDisabile? "[SI]": "[NO]"},
        { tagName: "ckDSA",                     tagValue: this.iscrizione.alunno.ckDSA? "[SI]": "[NO]"},

        { tagName: "DescrizioneClasse",         tagValue: this.iscrizione.classeSezioneAnno.classeSezione.classe?.descrizione2},


      ],
       tagTables: []

      
    }


    //nel modo che segue inserisco tanti tag quante le risposte a ciascuna domanda con il titolo autUscite1, autUscite2, oppure autFoto1, autFoto2 ecc.
    //aspetto che avvenga prima di procedere
    await firstValueFrom(this.svcIscrizioneRisposte.listByIscrizione(this.iscrizioneID)
    .pipe(
      tap(
      questions=>
        {
          for (let i = 0; i < questions.length; i++) {
            // console.log ("processo la domanda:", questions[i].domanda!.domanda);
            // console.log ("processo la domanda con titolo", questions[i].domanda!.titolo);
            let numOpzioni = questions[i].domanda?.numOpzioni || 0;
            if (questions[i].domanda!.tipo=="Scelta Singola") {
              let scelta = ""
              if (questions[i].risposta1) scelta = questions[i].domanda?.testo1!
              if (questions[i].risposta2) scelta = questions[i].domanda?.testo2!
              if (questions[i].risposta3) scelta = questions[i].domanda?.testo3!
              if (questions[i].risposta4) scelta = questions[i].domanda?.testo4!
              if (questions[i].risposta5) scelta = questions[i].domanda?.testo5!
              if (questions[i].risposta6) scelta = questions[i].domanda?.testo6!
              if (questions[i].risposta7) scelta = questions[i].domanda?.testo7!
              if (questions[i].risposta8) scelta = questions[i].domanda?.testo8!
              if (questions[i].risposta9) scelta = questions[i].domanda?.testo9!

              tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo, tagValue: scelta})
            }

            if (questions[i].domanda!.tipo=="Risposta Libera") {
               tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo, tagValue: questions[i].rispostaLibera})
            }


            if (questions[i].domanda!.titolo != null && questions[i].domanda!.titolo != '') {
              if (numOpzioni > 0) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_1", tagValue: questions[i].risposta1? "[X]": "[ ]"})
              if (numOpzioni > 1) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_2", tagValue: questions[i].risposta2? "[X]": "[ ]"})
              if (numOpzioni > 2) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_3", tagValue: questions[i].risposta3? "[X]": "[ ]"})
              if (numOpzioni > 3) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_4", tagValue: questions[i].risposta4? "[X]": "[ ]"})
              if (numOpzioni > 4) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_5", tagValue: questions[i].risposta5? "[X]": "[ ]"})
              if (numOpzioni > 5) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_6", tagValue: questions[i].risposta6? "[X]": "[ ]"})
              if (numOpzioni > 6) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_7", tagValue: questions[i].risposta7? "[X]": "[ ]"})
              if (numOpzioni > 7) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_8", tagValue: questions[i].risposta8? "[X]": "[ ]"})
              if (numOpzioni > 8) tagDocument.tagFields?.push({ tagName: questions[i].domanda!.titolo+"_9", tagValue: questions[i].risposta9? "[X]": "[ ]"})  
            }
          }
          console.log ("tagDocument dopo inserimenti varii", tagDocument)
        }
      )
    ));
    this.svcFile.buildAndGetBase64(tagDocument, nomeFile )
  }

  
//#endregion


}
