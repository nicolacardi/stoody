//#region ----- IMPORTS ------------------------

import { ApplicationRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { FullCalendarComponent }                from '@fullcalendar/angular';//-->serve per il ViewChild

import dayGridPlugin                            from '@fullcalendar/daygrid'
import listPlugin                               from '@fullcalendar/list'
import timegridPlugin                           from '@fullcalendar/timegrid'
import interactionPlugin                        from '@fullcalendar/interaction'

import { EventResizeDoneArg }                   from '@fullcalendar/interaction';

import itLocale                                 from '@fullcalendar/core/locales/it';
import { Observable}                            from 'rxjs';
import { concatMap, tap }                       from 'rxjs/operators';

import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { LezioneComponent }                     from '../lezione-edit/lezione.component';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { LezioniUtilsComponent }                from '../lezioni-utils/lezioni-utils.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { DownloadRegistroClasseComponent }      from '../download-registro-classe/download-registro-classe.component';
import { DownloadRegistroDocenteComponent }     from '../download-registro-docente/download-registro-docente.component';


//services
import { LezioniService }                       from '../lezioni.service';
import { UserService }                          from 'src/app/_user/user.service';
import { TipiPersonaService }                   from '../../persone/tipi-persona.service';

//models
import { CAL_Lezione }                          from 'src/app/_models/CAL_Lezione';
import { User }                                 from 'src/app/_user/Users';


//#endregion
@Component({
  selector: 'app-lezioni-calendario',
  templateUrl: './lezioni-calendario.component.html',
  styleUrls: ['../lezioni.css'],
  standalone: false
})
export class LezioniCalendarioComponent implements OnInit {

//#region ----- Variabili ----------------------
  private currUser!:                            User;
  almenoUnRuoloEditor = false;
  toggleDocentiMaterie =                        "materie";
  Events: any[] = [];
  
  showWarn:                                     boolean = false;


  calendarOptions: CalendarOptions = {

        plugins: [                              //aggiunto con fullcalendar 6.1.4
           dayGridPlugin,
           interactionPlugin,
           listPlugin,
           timegridPlugin
         ],

    //PROPRIETA' BASE
    initialView:  'timeGridWeek',

    slotMinTime:  '08:00:00',
    slotMaxTime:  '16:00:00',
    height:       500,
    allDaySlot:   false,                      //nasconde la riga degli eventi che durano il giorno intero
    locale:       'it',
    locales:      [itLocale],
    forceEventDuration : true,                //serve per attivare la defaultTimedEventDuration
    defaultTimedEventDuration : "01:00:00",   //indica che di default un evento dura un'ora
    expandRows: true,                         //estende in altezza le righe per adattare alla height il calendario
    hiddenDays: [ 0 ],                        //nasconde la domenica
    
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek mostraDocenti,settings,registro'  //TODO bisogna togliere i settings dalla vista docente
    },  

    views: {
      dayGridMonth: {  //questo modifica TUTTI gli eventi in questa vista
        eventContent: (event: any, element: any) => {
          { 
            // console.log (event.event._def)
            //mostra l'ora
            let timeText = document.createElement('div');
            timeText.className = "fc-event-time";
            timeText.innerHTML = event.timeText;
            //include Info aggiuntive
            let titleText = document.createElement('div');
            titleText.className = "fc-event-title";
            titleText.innerHTML = 
            '<span class="fs30" style="color:'+event.event._def.ui.backgroundColor+'">•</span><b>'
              +event.event._def.title
            //+'</b>'
            let arrayOfDomNodes = [ timeText, titleText];     //prepara il set di Nodes
            return { domNodes: arrayOfDomNodes }
          }
        }
      },

      timeGridDay: {  //questo modifica TUTTI gli eventi in questa vista
        eventContent: (event: any, element: any) => {
          { 
            //mostra l'ora
            let timeText = document.createElement('div');
            timeText.className = "fc-event-time";
            timeText.innerHTML = event.timeText;
            //include Info aggiuntive
            let titleText = document.createElement('div');
            titleText.className = "fc-event-title";
            titleText.innerHTML = '[<span class="fs10">Mat: </span><b>'
                +event.event._def.title +' '
                + '</b>] [<span class="fs10">Doc: </span><b>'
                + event.event._def.extendedProps['classeDocenteMateria'].docente.persona.nome + ' '
                + event.event._def.extendedProps['classeDocenteMateria'].docente.persona.cognome + ' '
                + '</b>] [<span class="fs10">Arg: </span>'
                + (event.event._def.extendedProps['argomento']? event.event._def.extendedProps['argomento']: "") + ' '
                + '] [<span class="fs10">Comp: </span>'
                + (event.event._def.extendedProps['compiti']? event.event._def.extendedProps['compiti']: "") + '] '
            
            //Aggiungo icona firma
            let img = document.createElement('img');
            if (event.event._def.extendedProps['ckFirma'] == true) 
              img.src = 'assets/sign_YES.svg';
            else 
              img.src = 'assets/sign_NO.svg';
            
            img.className = "_iconFirma";
            img.title='Firma della lezione';

            //Aggiungo icona epoca
            let img2 = document.createElement('img');
            if (event.event._def.extendedProps['ckEpoca'] == true) 
              img2.src = './assets/epoca_YES.svg';
            else 
              img2.src = './assets/epoca_NO.svg';
            
            img2.className = "_iconEpoca";
            img2.title='Epoca';

            //Aggiungo icona compito
            let img3 = document.createElement('img');
            if (event.event._def.extendedProps['ckCompito'] == true) 
              img3.src = './assets/compito_YES.svg';
            else 
              img3.src = './assets/compito_NO.svg';
            
            img3.className = "_iconCompito";
            img3.title='Compito in Classe';

            let arrayOfDomNodes = [ timeText, titleText, img2, img, img3];     //prepara il set di Nodes
            return { domNodes: arrayOfDomNodes }
        }
        }
      },
      listWeek: {  //questo modifica TUTTI gli eventi in questa vista
        eventContent: (event: any, element: any) => {
          { 
            //mostra l'ora
            let timeText = document.createElement('div');
            timeText.className = "fc-event-time";
            timeText.innerHTML = event.timeText;
            //include Info aggiuntive
            let titleText = document.createElement('div');
            titleText.className = "fc-event-title";
            titleText.innerHTML = '[<span class="fs10">Mat: </span><b>'
                +event.event._def.title +' '
                + '</b>] [<span class="fs10">Doc: </span><b>'
                + event.event._def.extendedProps['classeDocenteMateria'].docente.persona.nome + ' '
                + event.event._def.extendedProps['classeDocenteMateria'].docente.persona.cognome + ' '
                + '</b>] [<span class="fs10">Arg: </span>'
                + (event.event._def.extendedProps['argomento']? event.event._def.extendedProps['argomento']: "") + ' '
                + '] [<span class="fs10">Comp: </span>'
                + (event.event._def.extendedProps['compiti']? event.event._def.extendedProps['compiti']: "") + '] '
            
            //Aggiungo icona firma
            let img = document.createElement('img');
            if (event.event._def.extendedProps['ckFirma'] == true) 
              img.src = './assets/sign_YES.svg';
            else 
              img.src = './assets/sign_NO.svg';            
            img.className = "_iconFirmaListWeek";
            img.title='Firma della lezione';

            //Aggiungo icona epoca
            let img2 = document.createElement('img');
            if (event.event._def.extendedProps['ckEpoca'] == true) 
              img2.src = './assets/epoca_YES.svg';
            else 
              img2.src = './assets/epoca_NO.svg';
            
            img2.className = "_iconEpocaListWeek";
            img2.title='Epoca';

            //Aggiungo icona compito
            let img3 = document.createElement('img');
            if (event.event._def.extendedProps['ckCompito'] == true) 
              img3.src = './assets/compito_YES.svg';
            else 
              img3.src = './assets/compito_NO.svg';
            
            img3.className = "_iconCompitoListWeek tooltip";
            img3.title='Compito in Classe';

            //let arrayOfDomNodes = [ timeText, titleText];     //prepara il set di Nodes

            let arrayOfDomNodes = [ timeText, titleText, img2, img, img3];     //prepara il set di Nodes
            return { domNodes: arrayOfDomNodes }
        }
        }
      },
    },

    //dayHeaderContent: { html: "<button></button>"},
    

    //AZIONI
    select:       this.addEvento.bind(this),          //quando si crea un evento...
    eventClick:   this.openDetail.bind(this),         //quando si fa click su un evento esistente...
    eventDrop:    this.handleDrop.bind(this),         //quando si rilascia un evento che viene draggato...
    eventResize:  this.handleResize.bind(this),       //quando si fa il resize della durata di un evento...
  };

//#endregion

//#region ----- ViewChild Input Output --------
  @Input() classeSezioneAnnoID!:                number;
  @Input() annoID!:                             number;
  @Input() docenteID!:                          number;
  @Input() dove!:                         string;
  @ViewChild('calendarDOM') calendarDOM!: FullCalendarComponent;
//#endregion

//#region ----- Constructor --------------------

  constructor( private svcLezioni:              LezioniService,
                private svcUser:                UserService,
                private svcTipiPersona:         TipiPersonaService,
                private _loadingService:        LoadingService,
                private _snackBar:              MatSnackBar,
                public _dialog:                 MatDialog, 
                public appRef:                  ApplicationRef ) {

    this.currUser = Utility.getCurrentUser();

  }
//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnChanges() {
    //if (this.classeSezioneAnnoID != undefined  && this.dove != undefined) 
    if ( (this.dove == "orario" && this.classeSezioneAnnoID != undefined) || (this.dove == "orarioDocente"  && this.docenteID != undefined)) 
      this.loadData();
  }

  ngOnInit(){
  }

  loadData () {
    let obsLezioni$: Observable<CAL_Lezione[]>;
    this.showWarn = false;
    if (this.dove == "orario") {
    //if (this.classeSezioneAnnoID) {
      //se c'è un Docente selezionato allora filtro anche per lui
      if (this.docenteID != undefined && this.docenteID > 0) {
        console.log("1");
        obsLezioni$= this.svcLezioni.listByDocenteClasseSezioneAnno(this.docenteID, this.classeSezioneAnnoID);
      } else {
        console.log("2");
        //se non c'è un docente seleziono non filtro anche per lui
        obsLezioni$= this.svcLezioni.listByClasseSezioneAnno(this.classeSezioneAnnoID);
      }
    } else {
      //qui ("orario per Docente") non conta la classe ma solo il docenteID
      if (this.docenteID != undefined && this.docenteID > 0) {
        console.log("3");
        obsLezioni$= this.svcLezioni.listByDocente(this.docenteID); //Order by dtCalendario non sembra funzionare nel WS
      } else {
        this.showWarn = true;
        console.log("4");
        obsLezioni$= this.svcLezioni.listByDocente(0);
      }
    }

    const loadLezioni$ =this._loadingService.showLoaderUntilCompleted(obsLezioni$);
    loadLezioni$.subscribe(
      val =>   {
        console.log("lezioni-calendario - loadData - elenco eventi estratti da CAL_Lezioni", val);
        this.Events = val;
        this.calendarOptions.events = this.Events;
      }
    );

    if (this.dove == "orario") {

      this.calendarOptions.customButtons = {
        mostraDocenti: {
          text: 'Docenti',
          click: this.mostraDocenti.bind(this),
        },
        settings: {
          icon: 'settings-icon',
          hint: 'strumenti',
          click: this.openLezioniUtils.bind(this)
        },
        registro: {
          icon: 'download-registro',
          hint: 'registro di classe',
          click: this.openRegistroDownload.bind(this)
        }
      }  

      this.calendarOptions.editable =             false;             //consente modifiche agli eventi presenti
      this.calendarOptions.selectable =           false;             //consente di creare eventi
      this.calendarOptions.eventStartEditable =   false;             //consente di draggare eventi
      this.calendarOptions.eventDurationEditable =false;             //consente di modificare la lunghezza eventi

      this.currUser.persona?._LstRoles!.forEach(
        role=> {this.svcTipiPersona.getByDescrizione(role).subscribe(
          res=> {
            this.almenoUnRuoloEditor = true;
            //se uno solo dei ruoli ha diritto di editor gli viene concesso
            if (res.ckEditor) {
            this.calendarOptions.editable =             true;             //consente modifiche agli eventi presenti
            this.calendarOptions.selectable =           true;             //consente di creare eventi
            this.calendarOptions.eventStartEditable =   true;             //consente di draggare eventi
            this.calendarOptions.eventDurationEditable =true;             //consente di modificare la lunghezza eventi
          }}
        )}
      );


      if (this.calendarOptions!.customButtons!['mostraDocenti'].text == 'Lezioni') 
        this.setEventiDocenti();
      else 
        this.setEventiLezioni();

    } else {

      this.calendarOptions.customButtons = {
        mostraDocenti: {
          text: 'Classi',
          click: this.mostraDocenti.bind(this),
        },
        settings: {
          icon: 'settings-icon',
          click: this.openLezioniUtils.bind(this)
        },
        registro: {
          icon: 'download-registro',
          hint: "registro dell'insegnante",
          click: this.openRegistroDocenteDownload.bind(this)
        }
      }  

      this.calendarOptions.editable =             true;             //consente modifiche agli eventi presenti   :  da gestire sulla base del ruolo
      this.calendarOptions.selectable =           false;            //consente di creare eventi                 :  da gestire sulla base del ruolo
      this.calendarOptions.eventStartEditable =   false;            //consente di draggare eventi               :  da gestire sulla base del ruolo
      this.calendarOptions.eventDurationEditable =false;            //consente di modificare la lunghezza eventi:  da gestire sulla base del ruolo

      if (this.calendarOptions!.customButtons!['mostraDocenti'].text == 'Lezioni')
        this.setEventiClassi();
      else 
        this.setEventiLezioni();
      
    }
  }

  setEventiLezioni() {
    
    this.calendarOptions.eventContent = (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
      { 
        //mostra l'ora
        let timeText = document.createElement('div');
        timeText.className = "fc-event-time";
        timeText.innerHTML = arg.timeText;
        //include Info aggiuntive
        let titleText = document.createElement('div');
        titleText.className = "fc-event-title";
        titleText.innerHTML = arg.event['title'];

        //Aggiungo icona firma
        let img = document.createElement('img');
        if (arg.event.extendedProps['ckFirma'] == true) 
          img.src = './assets/sign_YES.svg';
        else 
          img.src = './assets/sign_NO.svg';

        img.className = "_iconFirma";

        img.title='Firma della Lezione';
        // img.addEventListener("click", (e: Event) => {
        //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
        //   this.anotherMethod();                                   //collega il metodo all'immagine
        // })

        //Aggiungo icona epoca
        let img2 = document.createElement('img');
        if (arg.event.extendedProps['ckEpoca'] == true) 
          img2.src = './assets/epoca_YES.svg';
        else 
          img2.src = './assets/epoca_NO.svg';
        
        img2.className = "_iconEpoca";
        img2.addEventListener("click", (e: Event) => {
          e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
          this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
        })
        img2.title='Epoca';

        //Aggiungo icona compito
        let img3 = document.createElement('img');
        if (arg.event._def.extendedProps['ckCompito'] == true) 
          img3.src = './assets/compito_YES.svg';
        else 
          img3.src = './assets/compito_NO.svg';
        
        img3.className = "_iconCompito";
        img3.title='Compito in Classe';

        let arrayOfDomNodes = [ timeText, titleText, img, img2, img3];     //prepara il set di Nodes
        return { domNodes: arrayOfDomNodes }
    }
  }

  setEventiDocenti() {
    this.calendarOptions.eventContent =         
    (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
    { 
      //mostra l'ora
      let timeText = document.createElement('div');
        timeText.className = "fc-event-time";
        timeText.innerHTML = arg.timeText;
      //include Info aggiuntive
      let docenteText = document.createElement('i');
        docenteText.className = "fc-event-title";
        docenteText.innerHTML = arg.event.extendedProps['classeDocenteMateria'].docente.persona.nome +  " " + arg.event.extendedProps['classeDocenteMateria'].docente.persona.cognome;
      //Aggiungo icona firma
      let img = document.createElement('img');
      if (arg.event.extendedProps['ckFirma'] == true) 
        img.src = './assets/sign_YES.svg';
      else 
        img.src = './assets/sign_NO.svg';
      
      img.className = "_iconFirma";
      img.title='Firma della Lezione';
      // img.addEventListener("click", (e: Event) => {
      //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
      //   this.anotherMethod();                                   //collega il metodo all'immagine
      // })

      //Aggiungo icona epoca
      let img2 = document.createElement('img');
      if (arg.event.extendedProps['ckEpoca'] == true) 
        img2.src = './assets/epoca_YES.svg';
      else 
        img2.src = './assets/epoca_NO.svg';
      
      img2.className = "_iconEpoca";
      img2.addEventListener("click", (e: Event) => {
        e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
        this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
      })
      img2.title='Epoca';
    //Aggiungo icona compito
    let img3 = document.createElement('img');
    if (arg.event._def.extendedProps['ckCompito'] == true) 
      img3.src = './assets/compito_YES.svg';
    else 
      img3.src = './assets/compito_NO.svg';
    
    img3.className = "_iconCompito";
    img3.title='Compito in Classe';
      let arrayOfDomNodes = [ timeText, docenteText, img, img2, img3 ];     //prepara il set di Nodes
      return { domNodes: arrayOfDomNodes }
    }
  }


  setEventiClassi() {
    this.calendarOptions.eventContent =         
    (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
    { 
      //mostra l'ora
      let timeText = document.createElement('div');
        timeText.className = "fc-event-time";
        timeText.innerHTML = arg.timeText;
      //include Info aggiuntive
      let classeText = document.createElement('div');
        classeText.className = "fc-event-title";
        classeText.innerHTML =  
            arg.event.extendedProps['classeSezioneAnno'].classeSezione.classe.descrizioneBreve + ' ' + 
            arg.event.extendedProps['classeSezioneAnno'].classeSezione.sezione;
      //Aggiungo icona firma
      let img = document.createElement('img');
      if (arg.event.extendedProps['ckFirma'] == true) 
        img.src = './assets/sign_YES.svg';
      else 
        img.src = './assets/sign_NO.svg';
      
      img.className = "_iconFirma";
      img.title='Firma della Lezione';
      // img.addEventListener("click", (e: Event) => {
      //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
      //   this.anotherMethod();                                   //collega il metodo all'immagine
      // })

      //Aggiungo icona epoca
      let img2 = document.createElement('img');
      if (arg.event.extendedProps['ckEpoca'] == true) 
        img2.src = './assets/epoca_YES.svg';
      else 
        img2.src = './assets/epoca_NO.svg';
      
      img2.className = "_iconEpoca";
      img2.addEventListener("click", (e: Event) => {
        e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
        this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
      })
      img2.title='Epoca';

          //Aggiungo icona compito
    let img3 = document.createElement('img');
    if (arg.event._def.extendedProps['ckCompito'] == true) 
      img3.src = './assets/compito_YES.svg';
    else 
      img3.src = './assets/compito_NO.svg';
    
    img3.className = "_iconCompito";
    img3.title='Compito in Classe';
      let arrayOfDomNodes = [ timeText, classeText, img, img2, img3 ];     //prepara il set di Nodes
      return { domNodes: arrayOfDomNodes }
    }
  }

//#endregion

//#region ----- Add Edit Resize Drop -----------

  openDetail(clickInfo: EventClickArg) {

      const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '900px',
        height: '600px',
        data: {
          lezioneID: clickInfo.event.id,
          start: clickInfo.event.start,
          end: clickInfo.event.end,
          dtCalendario: clickInfo.event.extendedProps['dtCalendario'],
          h_Ini: clickInfo.event.extendedProps['h_Ini'],
          h_End: clickInfo.event.extendedProps['h_End'],
          classeSezioneAnnoID: clickInfo.event.extendedProps['classeDocenteMateria'].classeSezioneAnnoID,
          dove: this.dove,
          docenteID: this.docenteID
        }
      };
      //solo il docente della lezione può aprire oppure lo può fare un docente con privilegi/segreteria/amministrazione scuola
      //serve il ruolo dell'utente corrente

      //if (this.svcUser.currentUser.ruoloID>=7) {

      if (this.almenoUnRuoloEditor || (this.dove == "orarioDocente")) {
        const dialogRef = this._dialog.open(LezioneComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(  () => this.loadData() );
      }
    
  }

  addEvento(selectInfo: DateSelectArg) {

    //INSERIMENTO NUOVO EVENTO
    let dtStart: Date;
    let dtEnd: Date;
    dtStart = selectInfo.start;
    dtEnd = selectInfo.end;

    //https://stackoverflow.com/questions/12413243/javascript-date-format-like-iso-but-local
    //console.log("toLocaleString(sv)", dtStart.toLocaleString('sv').replace(' ', 'T'));
    
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '900px',
      height: '600px',
      data: {
        lezioneID: 0,
        start: dtStart.toLocaleString('sv').replace(' ', 'T'),
        end: dtEnd.toLocaleString('sv').replace(' ', 'T'),
        dtCalendario: dtStart.toLocaleString('sv').replace(' ', 'T').substring(0,10),
        h_Ini: dtStart.toLocaleString('sv').replace(' ', 'T').substring(11,19),
        h_End: dtEnd.toLocaleString('sv').replace(' ', 'T').substring(11,19),
        classeSezioneAnnoID: this.classeSezioneAnnoID,
        dove: this.dove,
        docenteID: this.docenteID

      }
    };
    const dialogRef = this._dialog.open(LezioneComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => this.loadData() );

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); 
  }

  
  handleResize (resizeInfo: EventResizeDoneArg) {

    //let dt : Date | null   = resizeInfo.event.start;
    let dtCalendario =Utility.formatDate(resizeInfo.event.start, FormatoData.yyyy_mm_dd);
    let strH_INI =Utility.formatHour(resizeInfo.event.start);
    let strH_END =Utility.formatHour(resizeInfo.event.end);
    let form: CAL_Lezione;

    this.svcLezioni.listByDocenteAndOraOverlap (parseInt(resizeInfo.event.id), resizeInfo.event.extendedProps['docenteID'], dtCalendario, strH_INI, strH_END)
    .subscribe(
      (val : CAL_Lezione[])=> {
        if (val.length > 0) {
          let strMsg = "il Maestro " + val[0].classeDocenteMateria.docente!.persona!.nome + " " + val[0].classeDocenteMateria.docente!.persona!.cognome + " \n è già impegnato in questo slot in ";
          val.forEach (x =>
            { strMsg = strMsg + "\n - " + x.classeDocenteMateria.classeSezioneAnno!.classeSezione.classe!.descrizione2 + ' ' + x.classeDocenteMateria.classeSezioneAnno!.classeSezione.sezione;}
          )
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: strMsg}
          });
          resizeInfo.revert();
        }
        else {
          this.svcLezioni.get(resizeInfo.event.id)
          .pipe ( tap ( val  =>  {
              form = val;
              let dtISOLocaleEnd = resizeInfo.event.end!.toLocaleString('sv').replace(' ', 'T');
              form.h_End = dtISOLocaleEnd.substring(11,19);
            }),
            concatMap(() => this.svcLezioni.put(form))
          ).subscribe({
            next: res=>{
              //this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
          });
        }
      }
    )
  }

  handleDrop (dropInfo: EventDropArg) {
    
    //let dt : Date | null   = dropInfo.event.start;
    let dtCalendario =Utility.formatDate(dropInfo.event.start, FormatoData.yyyy_mm_dd);
    let strH_INI =Utility.formatHour(dropInfo.event.start);
    let strH_END =Utility.formatHour(dropInfo.event.end);

    let form: CAL_Lezione;
    this.svcLezioni.listByDocenteAndOraOverlap (parseInt(dropInfo.event.id), dropInfo.event.extendedProps['classeDocenteMateria'].docenteID, dtCalendario, strH_INI, strH_END)
    .subscribe(

      (val: CAL_Lezione[]) => {
        if (val.length > 0) {
          let strMsg = "il Maestro " + val[0].classeDocenteMateria.docente!.persona!.nome + " " + val[0].classeDocenteMateria.docente!.persona!.cognome + " \n è già impegnato in questo slot in ";
          val.forEach (x =>
            {strMsg = strMsg + "\n - " + x.classeDocenteMateria.classeSezioneAnno!.classeSezione.classe!.descrizione2 + ' ' + x.classeDocenteMateria.classeSezioneAnno!.classeSezione.sezione;}
          )
          this._dialog.open(DialogOkComponent, {
            width: '320px',
            data: {titolo: "ATTENZIONE!", sottoTitolo: strMsg}
          });
          dropInfo.revert();
        }
        else {
          this.svcLezioni.get(dropInfo.event.id).pipe (
            tap ( val   =>  {
              form = val;
              form.dtCalendario = dtCalendario;
              form.h_Ini = strH_INI;
              form.h_End = strH_END;
            }),
            concatMap(() => this.svcLezioni.put(form))
          ).subscribe({
            next: res=>{
              //this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
            },
            error: err=>{
              this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
            }
          });  
        }
      }
    )
  }
//#endregion

//#region ----- Altri metodi -------------------

  openLezioniUtils () {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '650px',
      height: '425px',
      data:  {
        start: this.calendarDOM.getApi().getDate(),
        classeSezioneAnnoID: this.classeSezioneAnnoID
      }
    };
    const dialogRef = this._dialog.open(LezioniUtilsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() =>  this.loadData());
  }

  openRegistroDownload () {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '650px',
      height: '425px',
      data:  {
        start: this.calendarDOM.getApi().getDate(),
        classeSezioneAnnoID: this.classeSezioneAnnoID,
        annoID: this.annoID

      }
    };
    const dialogRef = this._dialog.open(DownloadRegistroClasseComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() =>  this.loadData());
  }

  openRegistroDocenteDownload () {
    const dialogConfig : MatDialogConfig = {
      panelClass: 'add-DetailDialog',
      width: '650px',
      height: '425px',
      data:  {
        start: this.calendarDOM.getApi().getDate(),
        classeSezioneAnnoID: this.classeSezioneAnnoID,
        annoID: this.annoID

      }
    };
    const dialogRef = this._dialog.open(DownloadRegistroDocenteComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() =>  this.loadData());
  }



  mostraDocenti () {

    if (this.dove == 'orario') {
      if (this.calendarOptions!.customButtons!['mostraDocenti'].text == 'Docenti') {
        this.calendarOptions!.customButtons!['mostraDocenti'].text = 'Lezioni'
        this.setEventiDocenti();
      } 
      else {
        this.calendarOptions!.customButtons!['mostraDocenti'].text = 'Docenti'
        this.setEventiLezioni();
      } 
    } else {
      if (this.calendarOptions!.customButtons!['mostraDocenti'].text == 'Classi') {
        this.calendarOptions!.customButtons!['mostraDocenti'].text = 'Lezioni'
        this.setEventiClassi();
      } 
      else {
        this.calendarOptions!.customButtons!['mostraDocenti'].text = 'Classi'
        this.setEventiLezioni();
      } 
    }
  }

  toggleEpoca(lezioneID: number) {
    if (this.dove == 'orario')
    this.svcLezioni.toggleEpoca(lezioneID).subscribe(() => this.loadData());
  }



//#endregion
}



//#region ***********TENTATIVI E TEST su calendarOptions

    // eventContent: function (event: any, element: any) {
    //   let eventWrapper = document.createElement('div');
    //   eventWrapper.addEventListener("click",function(event){ return this })
    //   //eventWrapper.innerText = 'test dayGridWeek';
    //   var arrayOfDomNodes = [eventWrapper];
    //   return { domNodes: arrayOfDomNodes };
    // },

    //******************* */

      //   eventDidMount: function(event) {
      //     event.el.prepend("<button>Add</button>");
      //     //$(event.el).closest('td[role="gridcell"]').find('.fc-daygrid-day-top').prepend('<button class="button button-secondary button-small">Add</button>');
      //     //$(event.el).closest('td[role="gridcell"]').find('.fc-daygrid-day-top').append('<button class="button button-secondary button-small">Add</button>');

      // },
  ///******************** */
    // eventContent: { html: "<button class='ilMioButton'>mybutton</button>" },
  //***/
    // eventDidMount: function (el) {
    //   let buttons = el.el.querySelectorAll(".ilMioButton");
    //   console.log (buttons);
    //         buttons.forEach( (btn) =>{
    //         btn.addEventListener("click", (e) => {
    //           console.log ('cucu');
    //           //this.deleteEvent()
    //         });
    //       })
    // },

  //********************* */

    //così lancio una funzione su click dell'evento. Potrei ad es. poi identificare se si tratta di un click sull'evento
    //o sul button
    // eventClick: function (info) {
    //   showdata(info.event.id);
    // }
  //********************* */
    //   eventClick: function(event: any, element: any) {
    //     element.html(event.title + '<span class="removeEvent glyphicon glyphicon-trash pull-right" id="Delete"></span>');
    //  }
  //********************* */
    // viewDidMount: function (info) {
    // let buttons = document.querySelectorAll(".ilMioButton");
    // buttons.forEach( (btn) =>{
    //   btn.addEventListener("click", (e) => {
    //     console.log ('cucu');
    //     this.deleteEvent()
    //   });
    // })
    // }

  //********************* */
    // eventClick: function(calEvent:any) { let tg = calEvent.jsEvent.target.id; //così si identifica su cosa si fa click

  //********************* */
    // views: {
    //   timeGridWeek: {  //questo modifica TUTTI gli eventi in questa vista
    //     eventContent: function (event: any, element: any) {
    //       let eventWrapper = document.createElement('div');
    //       eventWrapper.addEventListener("click",function(event){ (x: any) => x.bind.deleteEvent() })
    //       eventWrapper.innerText = 'test dayGridWeek';
    //       var arrayOfDomNodes = [eventWrapper];
    //       return { domNodes: arrayOfDomNodes };
    //     }
    //   },
    // },
//#endregion