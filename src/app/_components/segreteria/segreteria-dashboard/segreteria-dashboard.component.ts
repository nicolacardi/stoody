//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog }                            from '@angular/material/dialog';
import { ActivatedRoute }                       from '@angular/router';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { firstValueFrom, map, tap }             from 'rxjs';

//components
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent }                 from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { IscrizioniClasseListComponent }        from '../../iscrizioni/iscrizioni-classe-list/iscrizioni-classe-list.component';

//services
import { NavigationService }                    from '../../utilities/navigation/navigation.service';
import { IscrizioniService }                    from '../../iscrizioni/iscrizioni.service';
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';
import { FilesService }                         from '../../pagelle/files.service';
import { PagellaVotiService }                   from '../../pagelle/pagella-voti.service';
import { PagelleService }                       from '../../pagelle/pagelle.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';
import { DOC_Pagella }                          from 'src/app/_models/DOC_Pagella';
import { DOC_File }                             from 'src/app/_models/DOC_File';
import { CLS_Iscrizione }                       from 'src/app/_models/CLS_Iscrizione';
import { DOC_PagellaVoto }                      from 'src/app/_models/DOC_PagellaVoto';
import { RPT_TagDocument }                      from 'src/app/_models/RPT_TagDocument';
import { DOC_CertCompetenze } from 'src/app/_models/DOC_CertCompetenze';
import { CertCompetenzeService } from '../../procedura-iscrizione/iscrizione-risposte/certcompetenze.service';
import { ConsOrientativiService } from '../../procedura-iscrizione/iscrizione-risposte/consorientativi.service';
import { IscrizioneRisposteService } from '../../procedura-iscrizione/iscrizione-risposte/iscrizione-risposte.service';
import { DOC_ConsOrientativo } from 'src/app/_models/DOC_ConsOrientativo';
import { RisorseCSAService } from '../../impostazioni/risorse-csa/risorse-csa.service';



//#endregion

@Component({
  selector: 'app-segreteria-dashboard',
  templateUrl: './segreteria-dashboard.component.html',
  styleUrls: ['../segreteria.css']
})

export class SegreteriaDashboardComponent implements OnInit {

//#region ----- Variabili ----------------------

  public classeSezioneAnnoID!:                  number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public classeSezioneAnno!:                    CLS_ClasseSezioneAnno;

  public annoID!:                               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docenteID!:                            number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public alunno!:                               ALU_Alunno;   //valore ricevuto (emitted) dal child IscrizioniClasseList

  public classeSezioneAnnoIDrouted!:            string;   //valore ricevuto (routed) dal routing
  public annoIDrouted!:                         string;   //valore ricevuto (routed) dal routing

  public objPagella!:                           DOC_Pagella;
//#endregion

//#region ----- ViewChild Input Output -------

//@ViewChild(AlunniListComponent) alunniListComponent!: AlunniListComponent; 
  @ViewChild(IscrizioniClasseListComponent) viewListIscrizioni!: IscrizioniClasseListComponent; 
//#endregion

  constructor(
              private svcPagelle:               PagelleService,
              private svcCertCompetenze:        CertCompetenzeService,
              private svcConsOrientativi:       ConsOrientativiService,
              private svcIscrizioneRisposte:    IscrizioneRisposteService,
              private svcRisorseCSA:            RisorseCSAService,
              private svcPagellaVoti:           PagellaVotiService,
              private svcFiles:                 FilesService,
              private svcClassiSezioniAnni:     ClassiSezioniAnniService,
              private _navigationService:       NavigationService,
              public _dialog:                   MatDialog,
              private actRoute:                 ActivatedRoute,      
              private _snackBar:                MatSnackBar ) {
    
  }

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {

    //annoID e classeSezioneAnnoID sono due queryParams che arrivano a coordinatore-dashboard ad es. quando si naviga da ClassiSezioniAnniSummary con right click
    //ora vanno passati al Child ClassiSezioniAnniList perchè quello deve settarsi su questo anno e su questa classe
    //l'annoID ClassiSezioniAnniList lo prende dalla select che a sua volta lo prende dal local storage (anno di default)
    //bisogna fare in modo che annoID in arrivo da home component "vinca" rispetto all'annoID impostato per default
    this.actRoute.queryParams.subscribe(
      params => {
        this.annoIDrouted = params['annoID'];     
        this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });

    this._navigationService.passPage("coordinatoreDashboard");  //A cosa serve??
  }
//#endregion

//#region ----- ricezione emit -------
  annoIdEmitted(annoID: number) {
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'annoID per fare le proprie verifiche
    this.annoID = annoID;
  }

  classeSezioneAnnoIDEmitted(classeSezioneAnnoID: number) {
    this.classeSezioneAnnoID = classeSezioneAnnoID;
    if(this.classeSezioneAnnoID >0){
      //per poter mostrare il docente e la classe...
      this.svcClassiSezioniAnni.get(this.classeSezioneAnnoID).subscribe(
        csa => this.classeSezioneAnno = csa 
      );
    } 
  }

  alunnoEmitted(alunno: ALU_Alunno) {
    this.alunno = alunno;
  }

  pubblicaEmitted(obj: any) {
    //devo estrarre il periodo e il tipo di documento

    let documento = obj.documento;

    switch(documento) {
      case 'pagella':
        this.pubblicaPagella(obj.periodo);
      break;
      case 'certCompetenze':
        this.pubblicaQuestionario('CertificazioneCompetenze');
      break;
      case 'consOrientativo':
        this.pubblicaQuestionario('ConsiglioOrientativo');
      break;
    }
  }

  async pubblicaPagella(periodo: number) {
    
    let finalMsg = "";
    let iscrizione: CLS_Iscrizione;
    let annoID!: number;
    let classeID!: number;
    let classeSezioneAnnoID!: number
    let alunno!: ALU_Alunno;
    let lstPagellaVoti!: DOC_PagellaVoto[];
    let pagella!: DOC_Pagella;
    let template!: string;

    for (let i=0; i < this.viewListIscrizioni.getChecked().length ; i++){ 
      iscrizione =  this.viewListIscrizioni.getChecked()[i];
      annoID = iscrizione!.classeSezioneAnno.annoID;
      classeID = iscrizione!.classeSezioneAnno.classeSezione.classeID;
      classeSezioneAnnoID = iscrizione!.classeSezioneAnnoID;
      alunno = iscrizione!.alunno;

      //1. VERIFICA SE LA PAGELLA ESISTE
      await firstValueFrom(this.svcPagelle.listByIscrizione(iscrizione.id)
        .pipe(
          map(pag=>pag.filter(pag=>(pag.periodo == periodo))),
          tap(pag=> pagella = pag[0])
        ));

      if (pagella == undefined) {
        finalMsg += "Pagella dell'alunno: "+iscrizione.alunno.persona.nome+" "+ iscrizione.alunno.persona.cognome+ " : LA PAGELLA NON ESISTE, NON E' MAI STATO INSERITO ALCUN VOTO"
        console.log("Report: ", finalMsg);
        return;
      }

      //2. VERIFICA SE IL FILE E' GIA' STATO SALVATO
      let filePagellaEsistente = false;
      await firstValueFrom(this.svcFiles.getByDocAndTipo(pagella.id!, "Pagella").pipe(tap(res => {if (res) filePagellaEsistente= true})));
      if (filePagellaEsistente) {
        finalMsg += "Pagella dell'alunno: "+iscrizione.alunno.persona.nome+" "+ iscrizione.alunno.persona.cognome+ " : IL FILE DELLA PAGELLA ESISTE GIA' in DOC_FILES"
        console.log("Report: ", finalMsg);
        return;
      }

      //3. ESTRAZIONE VOTI
      await firstValueFrom(this.svcPagellaVoti.listByCSAPagella(classeSezioneAnnoID, pagella.id!).pipe(tap(res=> lstPagellaVoti = res)));

      //serve estrarre il template
      //3.5. ESTRAZIONE TEMPLATE
      await firstValueFrom(this.svcRisorseCSA.getByTipoDocCSA(1, iscrizione.classeSezioneAnnoID)
      .pipe(
        tap(res=> {
          if (res) template= res.risorsa!.nomeFile
          })
        )
      );

      if (template== null || template == undefined || template == '') {
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Non sembra disponibile un template per questa classe"}
        });
        return;
      }
      
      //4. PRODUZIONE PAGELLA
      let file : DOC_File = {
        tipoDoc : "Pagella",
        docID : pagella.id!,
        TagDocument : this.svcFiles.openXMLPreparaPagella(template, iscrizione, lstPagellaVoti, pagella),
        tipoFile: "docX"
      };

      //5. SALVATAGGIO FILE BASE64 E CAMBIO STATO
      await firstValueFrom(this.svcFiles.post(file));
      await firstValueFrom(this.svcPagelle.pubblica(pagella.id!));

      this.viewListIscrizioni.selection.toggle(iscrizione);
      this.viewListIscrizioni.loadData();
    }; 
  }

  async pubblicaQuestionario(contesto: string) {
    //questa routine funziona per CertCompetenze e per ConsOrientativo, va quindi adattata ad un uso promiscup

    let finalMsg = "";
    let alunno!: ALU_Alunno;

    let iscrizione: CLS_Iscrizione;
    for (let i=0; i < this.viewListIscrizioni.getChecked().length ; i++){ 
      iscrizione =  this.viewListIscrizioni.getChecked()[i];
      alunno = iscrizione!.alunno;
      let docID! : number;
      let svcDOC : any; //varrà svcCertCompetenze o svcConsOrientativo

      switch (contesto) {
        case "CertificazioneCompetenze" :
          docID = iscrizione.certCompetenze? iscrizione.certCompetenze.id!: 0;
          svcDOC = this.svcCertCompetenze;
        break;
        case "ConsiglioOrientativo":
          docID = iscrizione.consOrientativo? iscrizione.consOrientativo.id!: 0;
          svcDOC = this.svcConsOrientativi;
        break;
      }

      //1. VERIFICA SE IL DOCUMENTO ESISTE
      if (docID ==0) {
        finalMsg += contesto+" dell'alunno: "+alunno.persona.nome+" "+ alunno.persona.cognome+ " : IL DOC: "+contesto+" NON ESISTE, NON E' MAI STATA SALVATO"
        console.log("DEBUG", finalMsg);
        return;
      }

      //2. VERIFICA SE IL FILE E' GIA' STATO SALVATO
      let fileEsistente = false;
      await firstValueFrom(this.svcFiles.getByDocAndTipo(docID, contesto).pipe(tap(res => {if (res) fileEsistente= true})));
      if (fileEsistente) {
        finalMsg += "Documento dell'alunno: "+alunno.persona.nome+" "+ alunno.persona.cognome+ " : IL FILE ESISTE GIA' in DOC_FILES"
        console.log("DEBUG", finalMsg);
        return;
      }

      //3. PRODUZIONE DOCUMENTO
      let file : DOC_File = {
        tipoDoc : contesto,
        docID : docID,
        TagDocument : await this.svcFiles.openXMLPreparaDocumento(iscrizione, contesto),
        tipoFile: "docX"
      };
      
      //5. SALVATAGGIO FILE BASE64 E CAMBIO STATO
      await firstValueFrom(this.svcFiles.post(file));
      await firstValueFrom(svcDOC.pubblica(docID));

      //a questo punto tolgo la selezione
      this.viewListIscrizioni.selection.toggle(iscrizione);
      this.viewListIscrizioni.loadData();
      
    }; 
  }

//#endregion


}