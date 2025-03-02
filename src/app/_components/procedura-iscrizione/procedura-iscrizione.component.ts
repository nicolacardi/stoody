//#region ----- IMPORTS ------------------------

import { Component, OnInit, QueryList, ViewChild, ViewChildren }                    from '@angular/core';
import { Observable, concatMap, firstValueFrom, tap }           from 'rxjs';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatStepper }                           from '@angular/material/stepper';
import { ActivatedRoute }                       from '@angular/router';
import { FormatoData, Utility }                 from '../utilities/utility.component';
import { FormControl }                          from '@angular/forms';
//components
import { SnackbarComponent }                    from '../utilities/snackbar/snackbar.component';
import { PersonaFormComponent }                 from '../persone/persona-form/persona-form.component';
import { IscrizioneRisposteComponent }          from './iscrizione-risposte/iscrizione-risposte.component';
import { GenitoreFormComponent }                from '../genitori/genitore-form/genitore-form.component';
import { AlunnoFormComponent }                  from '../alunni/alunno-form/alunno-form.component';
import { AssociazioneComponent }                from './associazione/associazione.component';

//services
import { IscrizioniService }                    from '../iscrizioni/iscrizioni.service';
import { IscrizioneRisposteService }            from './iscrizione-risposte//iscrizione-risposte.service';
import { RetteService }                         from '../pagamenti/rette.service';
import { FilesService }                         from '../pagelle/files.service';

//models
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { ALU_Genitore }                         from 'src/app/_models/ALU_Genitore';
import { ALU_GenitoreAlunno }                   from 'src/app/_models/ALU_GenitoreAlunno';
import { CLS_IscrizioneRisposta }               from 'src/app/_models/CLS_IscrizioneRisposta';
import { RPT_TagDocument }                      from 'src/app/_models/RPT_TagDocument';

//#endregion
@Component({
  selector: 'app-procedura-iscrizione',
  templateUrl: './procedura-iscrizione.component.html',
  styleUrls: ['./procedura-iscrizione.css']
})

export class ProceduraIscrizioneComponent implements OnInit {

//#region ----- Variabili ----------------------

  public obsIscrizione$!:                       Observable<CLS_Iscrizione>;
  public genitoriArr:                           ALU_Genitore[] = [];
  public iscrizione!:                           CLS_Iscrizione;
  //private form! :                               UntypedFormGroup;
  public iscrizioneID!:                         number;
  rettaConcordata!:                             number;
  associazioneSaved = new FormControl(false);
//#endregion

//#region ----- ViewChild Input Output ---------

  @ViewChildren(PersonaFormComponent) PersonaFormComponent!: QueryList<PersonaFormComponent>;
  @ViewChildren(GenitoreFormComponent) GenitoreFormComponent!: QueryList<GenitoreFormComponent>;
  @ViewChild(AlunnoFormComponent) AlunnoFormComponent!: AlunnoFormComponent;

  @ViewChild('formIscrizioneConsensi') ConsensiFormComponent!: IscrizioneRisposteComponent;
  @ViewChild('formIscrizioneDatiEconomici') DatiEconomiciFormComponent!: IscrizioneRisposteComponent;
  @ViewChild('appAssociazione') AssociazioneComponent!: AssociazioneComponent;

  @ViewChild('stepper') stepper!:               MatStepper;
//#endregion

//#region ----- Constructor --------------------

  constructor(
              private svcIscrizioni:            IscrizioniService,
              private svcIscrizioneRisposte:    IscrizioneRisposteService,
              private svcFile:                  FilesService,
              private svcRette:                 RetteService,

              private actRoute:                 ActivatedRoute,
              private _snackBar:                MatSnackBar ) { 

    // this.form = this.fb.group({
    //   id:                         [null],
    //   tipoPersonaID:              [''],
    //   ckAttivo:                   [true],
    // });
  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(): void {
    //estraggo lo user
    // this.currUser = Utility.getCurrentUser();

    //verifico se è un genitore  //TODO va inserito campo ckGenitore
    // if (this.currUser.TipoPersona.ckGenitore) {
    //   this.genitoreBool = true;
    // }
    // this.genitoreBool = true; //per ora lo imposto fisso

    //se è un genitore vado a caricarne i figli
    //ma mi serve il genitoreID e non personaID

    // this.obsFigli$ = this.svcGenitori.getByPersona(this.currUser.personaID)
    // .pipe(
    //   //in base al genitoreID estraggo tutti i figli
    //   concatMap(genitore => this.svcAlunni.listByGenitore(genitore.id))
    // );

    this.actRoute.queryParams.subscribe(
      params => {
        this.iscrizioneID = params['iscrizioneID'];     
    });

    this.loadData()
  }

  loadData() {

    this.svcRette.sumConcordateByIscrizione(this.iscrizioneID).subscribe(rettaConcordata=> {this.rettaConcordata = rettaConcordata;})

    //ottengo dall'iscrizione tutti i dati: dell'alunno e dei genitori
    this.svcIscrizioni.get(this.iscrizioneID).subscribe(
      res => {
        // console.log ("res",res);
        this.iscrizione = res;
        res.alunno._Genitori!.forEach(
           (genitorealunno: ALU_GenitoreAlunno) =>{
             this.genitoriArr.push(genitorealunno.genitore!);                                    
           }
        )
      }
    );
  }
//#endregion

//#region ----- Altri metodi -------------------

  salvaPersona(tipo: string){

    if (tipo == 'genitore') {
      this.PersonaFormComponent.toArray()[this.stepper.selectedIndex-1].save()
      .pipe(
        concatMap (()=> this.GenitoreFormComponent.toArray()[this.stepper.selectedIndex-1].save()) //salva il genitoreForm n-esimo                    
      )
      .subscribe({
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      })
    }

    if (tipo == 'alunno') {
      //this.PersonaFormComponent.toArray()[this.stepper.selectedIndex-1].save()
      this.AlunnoFormComponent.save()
      .pipe(
        concatMap (()=> this.AlunnoFormComponent.save())                  
      )
      .subscribe({
        error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
      })
    }

  }

  async salvaRisposte(contesto: string) {

    //ho spostato in iscrizione-risposte la save...da testare
    if (contesto == 'Consensi')          this.ConsensiFormComponent.save(contesto);
    if (contesto == 'DatiEconomici')    this.DatiEconomiciFormComponent.save(contesto);
    

    return;
    await firstValueFrom(this.svcIscrizioneRisposte.deleteByIscrizioneAndTipo(this.iscrizioneID, contesto));

    let formValues! : any;

    if (contesto == 'Consensi')          formValues = this.ConsensiFormComponent.formRisposte.value;
    if (contesto == 'DatiEconomici')    formValues = this.DatiEconomiciFormComponent.formRisposte.value;

    //devo trasformare questo ogetto in un altro
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
          // console.log (form);
          this.svcIscrizioneRisposte.post(form).subscribe(
            {
              next: res=> {
                // console.log ("inserita domanda", domandaID)
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

  salvaAssociazione() {
    this.AssociazioneComponent.save();
    this.associazioneSaved.setValue(true);
  }

  async downloadModuloIscrizione() {

    this._snackBar.openFromComponent(SnackbarComponent, {data: 'Richiesta download inviata...', panelClass: ['green-snackbar']});

    let nomeFile = "ModuloIscrizione"  + '_' + this.iscrizione.classeSezioneAnno.anno.annoscolastico + "_" + this.iscrizione.alunno.persona.cognome + ' ' + this.iscrizione.alunno.persona.nome + '.docx'

    let tagDocument : RPT_TagDocument = {
      templateName: "ModuloIscrizioni",
      tagFields:
      [
        { tagName: "AnnoScolastico",            tagValue: this.iscrizione.classeSezioneAnno.anno.annoscolastico},
        { tagName: "Anno1",                     tagValue: this.iscrizione.classeSezioneAnno.anno.anno1.toString()},
        { tagName: "Anno2",                     tagValue: this.iscrizione.classeSezioneAnno.anno.anno2.toString()},

        { tagName: "TipoGenitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.tipoGenitore?.descrizione},
        { tagName: "NomeGenitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.nome},
        { tagName: "CognomeGenitore1",          tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.cognome},
        { tagName: "ComuneNascitaGenitore1",    tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.comuneNascita},
        { tagName: "ProvNascitaGenitore1",      tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.provNascita},
        { tagName: "dtNascitaGenitore1",        tagValue: Utility.formatDate(this.iscrizione.alunno._Genitori![0].genitore?.persona.dtNascita, FormatoData.dd_mm_yyyy)},
        { tagName: "PaeseNascitaGenitore1",     tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.nazioneNascita},
        { tagName: "CFGenitore1",               tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.cf},
        { tagName: "IndirizzoGenitore1",        tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.indirizzo},
        { tagName: "CAPGenitore1",              tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.cap},
        { tagName: "ComuneGenitore1",           tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.comune},
        { tagName: "ProvGenitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.prov},
        { tagName: "Tel1Genitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.telefono},
        { tagName: "Tel2Genitore1",             tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.telefono1},
        { tagName: "EmailGenitore1",            tagValue: this.iscrizione.alunno._Genitori![0].genitore?.persona.email},


        { tagName: "TipoGenitore2",             tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.tipoGenitore?.descrizione : ""},
        { tagName: "NomeGenitore2",             tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.nome : ""},
        { tagName: "CognomeGenitore2",          tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.cognome : ""},
        { tagName: "ComuneNascitaGenitore2",    tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.comuneNascita : ""},
        { tagName: "ProvNascitaGenitore2",      tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.provNascita : ""},
        { tagName: "dtNascitaGenitore2",        tagValue: this.iscrizione.alunno._Genitori![1]? Utility.formatDate(this.iscrizione.alunno._Genitori![1].genitore?.persona.dtNascita, FormatoData.dd_mm_yyyy) : ""},
        { tagName: "PaeseNascitaGenitore2",     tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.nazioneNascita : ""},
        { tagName: "CFGenitore2",               tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.cf : ""},
        { tagName: "IndirizzoGenitore2",        tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.indirizzo : ""},
        { tagName: "CAPGenitore2",              tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.cap : ""},
        { tagName: "ComuneGenitore2",           tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.comune : ""},
        { tagName: "ProvGenitore2",             tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.prov : ""},
        { tagName: "Tel1Genitore2",             tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.telefono : ""},
        { tagName: "Tel2Genitore2",             tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.telefono1 : ""},
        { tagName: "EmailGenitore2",            tagValue: this.iscrizione.alunno._Genitori![1]? this.iscrizione.alunno._Genitori![1].genitore?.persona.email : ""},

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
        { tagName: "RettaConcordata",           tagValue: this.rettaConcordata.toString()},


      ],
       tagTables: [
      //   {
      //     tagTableTitle: "Consensi",
      //     tagTableRows:
      //     [
      //       {
      //         tagFields:
      //         [
      //           { tagName: "RigaConsenso", tagValue: "Silvan"},
      //           { tagName: "Cognome", tagValue: " Cangurotto "},
      //         ]
      //       },
      //       {
      //         tagFields: 
      //         [
      //           { tagName: "RigaConsenso", tagValue: "Nicola"},
      //         ]
      //       }
      //     ]
      //   }
       ]

      
    }

    //nel modo che segue inserisco tanti tag quante le risposte a ciascuna domanda con il titolo autUscite1, autUscite2, oppure autFoto1, autFoto2 ecc.
    //aspetto che avvenga prima di procedere
    await firstValueFrom(this.svcIscrizioneRisposte.listByIscrizione(this.iscrizioneID)
    .pipe(
      tap(

      questions=>
        {


          for (let i = 0; i < questions.length; i++) {
            console.log ("processo la domanda:", questions[i].domanda!.domanda);
            console.log ("processo la domanda con titolo", questions[i].domanda!.titolo);
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

    //aggiungo a tagDocument i tag delle domande "DatiEconomici" su CLS_IscrizioneRisposte
    //estraggo le domande e le risposte

    //La seguente modalità crea in automatico una TABELLA con le scelte operate nei consensi sui dati economici
    //in questo caso, quindi, non si fa uso dei tag assegnati a ciascun consenso nel campo "titolo" [strada che mi piace meno]
    this.svcIscrizioneRisposte.listByIscrizioneAndContesto(this.iscrizioneID, "DatiEconomici")
    // .subscribe(val=>console.log("val", val));
    .pipe( 

      tap (questions => { 

        let tagFields;
        const tagTableRows = [];

        for (let i = 0; i < questions.length; i++) {
          let domanda = questions[i].domanda?.domanda.toUpperCase();
          let numOpzioni = questions[i].domanda?.numOpzioni || 0;
  
                              tagFields= [{ tagName: "SINO", tagValue: " " },{ tagName: "RigaConsenso", tagValue: " " }];
                              tagTableRows.push(tagFields); //riga vuota
                              tagFields = [{ tagName: "SINO", tagValue: " " },{ tagName: "RigaConsenso", tagValue: domanda }];
                              tagTableRows.push(tagFields);
          if (numOpzioni > 0) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta1? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo1 }];
                              tagTableRows.push(tagFields);}
          if (numOpzioni > 1) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta2? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo2 }];
                              tagTableRows.push(tagFields);}
          if (numOpzioni > 2) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta3? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo3 }];
                              tagTableRows.push(tagFields);}
          if (numOpzioni > 3) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta4? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo4 }];
                              tagTableRows.push(tagFields);}
          if (numOpzioni > 4) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta5? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo5 }];
                              tagTableRows.push(tagFields);}
          if (numOpzioni > 5) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta6? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo6 }];
                              tagTableRows.push(tagFields);}
          if (numOpzioni > 6) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta7? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo7 }];
                              tagTableRows.push(tagFields);}
          if (numOpzioni > 7) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta8? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo8 }];
                              tagTableRows.push(tagFields);}
          if (numOpzioni > 8) {tagFields = [{ tagName: "SINO", tagValue: questions[i].risposta9? "X": "" }, { tagName: "RigaConsenso", tagValue: questions[i].domanda!.testo9 }];
                              tagTableRows.push(tagFields);}

        }
        //console.log ("tableRows", tagTableRows);
        const tagTable = {
          tagTableTitle: "ConsensiDatiEconomici",
          tagTableRows: tagTableRows.map(tagFields => ({ tagFields })),
        };
        // console.log ("tagTable", tagTable);

        tagDocument.tagTables!.push(tagTable);
        }
      ),
    )
    .subscribe(
        
        () => {
          //console.log ("tagDocument", tagDocument);
          this.svcFile.buildAndGetBase64(tagDocument, nomeFile )
        }
    )
    ;  

    

  }


//#endregion

}
