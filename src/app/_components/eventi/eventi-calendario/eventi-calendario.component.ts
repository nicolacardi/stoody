//#region ----- IMPORTS ------------------------

import { ApplicationRef, Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { FullCalendarComponent }                from '@fullcalendar/angular';//-->serve per il ViewChild

import dayGridPlugin                            from '@fullcalendar/daygrid'
import listPlugin                               from '@fullcalendar/list'
import timegridPlugin                           from '@fullcalendar/timegrid'
import interactionPlugin                        from '@fullcalendar/interaction'

import { EventResizeDoneArg }                   from '@fullcalendar/interaction';
import { concatMap, map, tap }                       from 'rxjs/operators';


import itLocale                                 from '@fullcalendar/core/locales/it';
import { Observable }                           from 'rxjs';

import { MatDialog, MatDialogConfig }           from '@angular/material/dialog';
import { MatSnackBar }                          from '@angular/material/snack-bar';

//components
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { FormatoData, Utility }                 from '../../utilities/utility.component';
import { EventoEditComponent }                from '../evento-edit/evento-edit.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { EventiService }                      from '../eventi.service';

//models
import { CAL_Evento }                         from 'src/app/_models/CAL_Evento';
import { User }                                 from 'src/app/_user/Users';

//#endregion
@Component({
  selector: 'app-eventi-calendario',
  templateUrl: './eventi-calendario.component.html',
  styleUrls: ['../eventi.css']
})
export class EventiCalendarioComponent implements OnInit {

//#region ----- Variabili ----------------------
  currUser!:                                    User;

  Events: any[] = [];

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
    slotMaxTime:  '22:00:00',
    height:       600,
    allDaySlot:   false,                      //nasconde la riga degli eventi che durano il giorno intero
    locale:       'it',
    locales:      [itLocale],
    forceEventDuration : true,                //serve per attivare la defaultTimedEventDuration
    defaultTimedEventDuration : "01:00:00",   //indica che di default un evento dura un'ora
    expandRows: true,                         //estende in altezza le righe per adattare alla height il calendario
    //hiddenDays: [ 0 ],                        //nasconde la domenica
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },  

    views: {
      timeGridWeek: { //questo modifica TUTTI gli eventi in questa vista: la vista MESE: 
        //***************** NB SI PUO'TOGLIERE TUTTO QUESTO 'capitolo' TimeGridWeek e funziona lo stesso, ma SENZA Tooltip ****************
        eventContent: (event: any, element: any) => {
          { 
            //mostra l'ora
            let timeText = document.createElement('div');
            timeText.className = "fc-event-time";
            timeText.innerHTML = event.timeText;
            //include Info aggiuntive
            let titleText = document.createElement('div');
            titleText.className = "fc-event-title";
            titleText.innerHTML = 
              event.event._def.title;
            timeText.setAttribute('title', event.event._def.title);
            let arrayOfDomNodes = [ timeText, titleText];     //prepara il set di Nodes

            return { domNodes: arrayOfDomNodes }
          }
        },
      },

      dayGridMonth: {  //questo modifica TUTTI gli eventi in questa vista: la vista MESE
        eventContent: (event: any, element: any) => {
          { 
            //mostra l'ora
            let timeText = document.createElement('div');
            timeText.className = "fc-event-time";
            timeText.innerHTML = event.timeText;
            //include Info aggiuntive
            let titleText = document.createElement('div');
            titleText.className = "fc-event-title";
            titleText.innerHTML = 
            '<span class="fs30" style="color:'+event.event._def.ui.backgroundColor+'">•</span><b>'
              +event.event._def.title+'</b>';

            


            let arrayOfDomNodes = [ timeText, titleText];     //prepara il set di Nodes

            return { domNodes: arrayOfDomNodes }
          }
        },

      },
      timeGridDay: {  //questo modifica TUTTI gli eventi in questa vista, la vista GIORNO
        eventContent: (event: any, element: any) => {
          { 
            //mostra l'ora
            let timeText = document.createElement('div');
            timeText.className = "fc-event-time";
            timeText.innerHTML = event.timeText;
            //include Info aggiuntive
            let titleText = document.createElement('div');
            titleText.className = "fc-event-title";
            titleText.innerHTML = 
            //'[<span class="fs10">Titolo Evento: </span>]<b>'+
                event.event._def.title
            //+'</b>'
            
            

            let arrayOfDomNodes = [ timeText, titleText];     //prepara il set di Nodes
            return { domNodes: arrayOfDomNodes }
        }
        }
      },
      listWeek: {  //questo modifica TUTTI gli eventi in questa vista, la vista AGENDA
        eventContent: (event: any, element: any) => {
          { 
            //mostra l'ora
            let timeText = document.createElement('div');
            timeText.className = "fc-event-time";
            timeText.innerHTML = event.timeText;
            //include Info aggiuntive
            let titleText = document.createElement('div');
            titleText.className = "fc-event-title";
            titleText.innerHTML = 
            //'[<span class="fs10">Titolo Evento: </span>]<b>'+
                event.event._def.title;
            //+'</b>'
            

            //let arrayOfDomNodes = [ timeText, titleText];     //prepara il set di Nodes

            let arrayOfDomNodes = [ timeText, titleText];     //prepara il set di Nodes
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

//#region ----- ViewChild Input Output ---------
  @ViewChild('calendarDOM') calendarDOM!: FullCalendarComponent;
//#endregion

//#region ----- Constructor --------------------

  constructor( 
    private svcEventi:                        EventiService,
    private _loadingService:                    LoadingService,
    private _snackBar:                          MatSnackBar,
    public _dialog:                             MatDialog, 
    public appRef:                              ApplicationRef
  ) {


    this.currUser = Utility.getCurrentUser();
  }
//#endregion

//#region ----- LifeCycle Hooks e simili-------


  ngOnInit(){
    this.loadData();
  }

  loadData () {
    let obsEventi$: Observable<CAL_Evento[]>;
    obsEventi$= this.svcEventi.list()

    .pipe(
      map(eventi => 
        eventi.filter(evento => 
          evento._EventoPersone?.some(sp => sp.personaID === this.currUser.personaID)
        )
      )
    );


    const loadEventi$ =this._loadingService.showLoaderUntilCompleted(obsEventi$);
    loadEventi$.subscribe(
      val =>   {
        console.log ("eventi-calendario - loadData - val", val);
        for (let i = 0; i< val.length; i++) {
          //console.log ("eventi-calendario - loadData - val[i].tipoEvento!.color", val[i].tipoEvento!.color);
          val[i].color = val[i].tipoEvento!.color;
        }


        this.Events = val;
        this.calendarOptions.events = this.Events; //curioso doppio passaggio, ma this.calendarOptions.events = val non funziona
      }
    );

    // Per attivare i custom buttons serve inserirlo nella headerToolbar nell'elenco insieme agli altri 
    //this.calendarOptions.customButtons = {
    //   mostraDocenti: {
    //     text: 'Mostra Docenti',
    //     //click: this.mostraDocenti.bind(this),
    //   },
    //   settings: {
    //     icon: 'settings-icon',
    //     //click: this.openLezioniUtils.bind(this)
    //   }
    // }  

    this.calendarOptions.editable =             true;             //consente modifiche agli eventi presenti   :  da gestire sulla base del ruolo
    this.calendarOptions.selectable =           true;             //consente di creare eventi                 :  da gestire sulla base del ruolo
    this.calendarOptions.eventStartEditable =   true;             //consente di draggare eventi               :  da gestire sulla base del ruolo
    this.calendarOptions.eventDurationEditable =true;             //consente di modificare la lunghezza eventi:  da gestire sulla base del ruolo

    this.setEventiLezioni();

  }

  setEventiLezioni() {
    
    this.calendarOptions.eventContent = (arg: any)  =>
      { 
        //mostra l'ora
        let timeText = document.createElement('div');
        timeText.className = "fc-event-time";
        timeText.innerHTML = arg.timeText;
        //include Info aggiuntive
        let titleText = document.createElement('div');
        titleText.className = "fc-event-title";
        titleText.innerHTML = arg.event['title'];

        // //Aggiungo icona firma
        // let img = document.createElement('img');
        // if (arg.event.extendedProps['ckFirma'] == true) 
        //   img.src = '../../assets/sign_YES.svg';
        // else 
        //   img.src = '../../assets/sign_NO.svg';

        // img.className = "_iconFirma";

        // img.title='Firma della Lezione';
        // // img.addEventListener("click", (e: Event) => {
        // //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
        // //   this.anotherMethod();                                   //collega il metodo all'immagine
        // // })

        // //Aggiungo icona epoca
        // let img2 = document.createElement('img');
        // if (arg.event.extendedProps['ckEpoca'] == true) 
        //   img2.src = '../../assets/epoca_YES.svg';
        // else 
        //   img2.src = '../../assets/epoca_NO.svg';
        
        // img2.className = "_iconEpoca";
        // img2.addEventListener("click", (e: Event) => {
        //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
        //   this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
        // })
        // img2.title='Epoca';

        // //Aggiungo icona compito
        // let img3 = document.createElement('img');
        // if (arg.event._def.extendedProps['ckCompito'] == true) 
        //   img3.src = '../../assets/compito_YES.svg';
        // else 
        //   img3.src = '../../assets/compito_NO.svg';
        
        // img3.className = "_iconCompito";
        // img3.title='Compito in Classe';

        let arrayOfDomNodes = [ timeText, titleText];     //prepara il set di Nodes
        return { domNodes: arrayOfDomNodes }
    }
  }

  // setEventiDocenti() {
  //   this.calendarOptions.eventContent =         
  //   (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
  //   { 
  //     //mostra l'ora
  //     let timeText = document.createElement('div');
  //       timeText.className = "fc-event-time";
  //       timeText.innerHTML = arg.timeText;
  //     //include Info aggiuntive
  //     let docenteText = document.createElement('i');
  //       docenteText.className = "fc-event-title";
  //       docenteText.innerHTML = arg.event.extendedProps['docente'].persona.nome +  " " + arg.event.extendedProps['docente'].persona.cognome;
      
  //       //Aggiungo icona firma
  //     let img = document.createElement('img');
  //     if (arg.event.extendedProps['ckFirma'] == true) 
  //       img.src = '../../assets/sign_YES.svg';
  //     else 
  //       img.src = '../../assets/sign_NO.svg';
      
  //     img.className = "_iconFirma";
  //     img.title='Firma della Lezione';
  //     // img.addEventListener("click", (e: Event) => {
  //     //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
  //     //   this.anotherMethod();                                   //collega il metodo all'immagine
  //     // })

  //     //Aggiungo icona epoca
  //     let img2 = document.createElement('img');
  //     if (arg.event.extendedProps['ckEpoca'] == true) 
  //       img2.src = '../../assets/epoca_YES.svg';
  //     else 
  //       img2.src = '../../assets/epoca_NO.svg';
      
  //     img2.className = "_iconEpoca";
  //     img2.addEventListener("click", (e: Event) => {
  //       e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
  //       this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
  //     })
  //     img2.title='Epoca';
  //   //Aggiungo icona compito
  //   let img3 = document.createElement('img');
  //   if (arg.event._def.extendedProps['ckCompito'] == true) 
  //     img3.src = '../../assets/compito_YES.svg';
  //   else 
  //     img3.src = '../../assets/compito_NO.svg';
    
  //   img3.className = "_iconCompito";
  //   img3.title='Compito in Classe';
  //     let arrayOfDomNodes = [ timeText, docenteText, img, img2, img3 ];     //prepara il set di Nodes
  //     return { domNodes: arrayOfDomNodes }
  //   }
  // }


  // setEventiClassi() {
  //   this.calendarOptions.eventContent =         
  //   (arg: any)  =>//arg è l'oggetto che contiene l'evento con tutte le sue proprietà
  //   { 
  //     //mostra l'ora
  //     let timeText = document.createElement('div');
  //       timeText.className = "fc-event-time";
  //       timeText.innerHTML = arg.timeText;
  //     //include Info aggiuntive
  //     let classeText = document.createElement('div');
  //       classeText.className = "fc-event-title";
  //       classeText.innerHTML =  
  //           arg.event.extendedProps['classeSezioneAnno'].classeSezione.classe.descrizioneBreve + ' ' + 
  //           arg.event.extendedProps['classeSezioneAnno'].classeSezione.sezione;
  //     //Aggiungo icona firma
  //     let img = document.createElement('img');
  //     if (arg.event.extendedProps['ckFirma'] == true) 
  //       img.src = '../../assets/sign_YES.svg';
  //     else 
  //       img.src = '../../assets/sign_NO.svg';
      
  //     img.className = "_iconFirma";
  //     img.title='Firma della Lezione';
  //     // img.addEventListener("click", (e: Event) => {
  //     //   e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
  //     //   this.anotherMethod();                                   //collega il metodo all'immagine
  //     // })

  //     //Aggiungo icona epoca
  //     let img2 = document.createElement('img');
  //     if (arg.event.extendedProps['ckEpoca'] == true) 
  //       img2.src = '../../assets/epoca_YES.svg';
  //     else 
  //       img2.src = '../../assets/epoca_NO.svg';
      
  //     img2.className = "_iconEpoca";
  //     img2.addEventListener("click", (e: Event) => {
  //       e.stopPropagation();                                    //impedisce che scatti anche il click sull'evento
  //       this.toggleEpoca(arg.event.id);                        //collega il metodo all'immagine
  //     })
  //     img2.title='Epoca';

  //         //Aggiungo icona compito
  //   let img3 = document.createElement('img');
  //   if (arg.event._def.extendedProps['ckCompito'] == true) 
  //     img3.src = '../../assets/compito_YES.svg';
  //   else 
  //     img3.src = '../../assets/compito_NO.svg';
    
  //   img3.className = "_iconCompito";
  //   img3.title='Compito in Classe';
  //     let arrayOfDomNodes = [ timeText, classeText, img, img2, img3 ];     //prepara il set di Nodes
  //     return { domNodes: arrayOfDomNodes }
  //   }
  // }

//#endregion

//#region ----- Add & Edit Eventi --------------

  openDetail(clickInfo: EventClickArg) {
    // if (clickInfo.event.extendedProps['tipoEvento'].ckNota) {
    //   this._dialog.open(DialogOkComponent, {
    //     width: '320px',
    //     data: {titolo: "ATTENZIONE!", sottoTitolo: "Le note vanno gestite dalla console Maestro"}
    //   });
    // }  else {
      const dialogConfig : MatDialogConfig = {
        panelClass: 'add-DetailDialog',
        width: '800px',
        height: '700px',
        data: {
          eventoID: clickInfo.event.id,
          start: clickInfo.event.start,
          end: clickInfo.event.end,
          dtCalendario: clickInfo.event.extendedProps['dtCalendario'],
          h_Ini: clickInfo.event.extendedProps['h_Ini'],
          h_End: clickInfo.event.extendedProps['h_End'],
        }
      };


        const dialogRef = this._dialog.open(EventoEditComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(  () => this.loadData() );
    // }
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
      width: '800px',
      height: '700px',
      data: {
        eventoID: 0,
        start: dtStart.toLocaleString('sv').replace(' ', 'T'),
        end: dtEnd.toLocaleString('sv').replace(' ', 'T'),
        dtCalendario: dtStart.toLocaleString('sv').replace(' ', 'T').substring(0,10),
        h_Ini: dtStart.toLocaleString('sv').replace(' ', 'T').substring(11,19),
        h_End: dtEnd.toLocaleString('sv').replace(' ', 'T').substring(11,19),


      }
    };
    const dialogRef = this._dialog.open(EventoEditComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( () => this.loadData() );

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); 
  }

  // openLezioniUtils () {
  //   const dialogConfig : MatDialogConfig = {
  //     panelClass: 'add-DetailDialog',
  //     width: '650px',
  //     height: '425px',
  //     data:  {
  //       start: this.calendarDOM.getApi().getDate(),
  //       classeSezioneAnnoID: this.classeSezioneAnnoID
  //     }
  //   };
  //   const dialogRef = this._dialog.open(LezioniUtilsComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe(() =>  this.loadData());
  // }

  // mostraDocenti () {

  //   if (this.dove == 'orario') {
  //     if (this.calendarOptions!.customButtons!.mostraDocenti.text == 'Mostra Docenti') {
  //       this.calendarOptions!.customButtons!.mostraDocenti.text = "Mostra Lezioni"
  //       this.setEventiDocenti();
  //     } 
  //     else {
  //       this.calendarOptions!.customButtons!.mostraDocenti.text = "Mostra Docenti"
  //       this.setEventiLezioni();
  //     } 
  //   } else {
  //     if (this.calendarOptions!.customButtons!.mostraDocenti.text == 'Mostra Classi') {
  //       this.calendarOptions!.customButtons!.mostraDocenti.text = "Mostra Lezioni"
  //       this.setEventiClassi();
  //     } 
  //     else {
  //       this.calendarOptions!.customButtons!.mostraDocenti.text = "Mostra Classi"
  //       this.setEventiLezioni();
  //     } 
  //   }
  // }

  // toggleEpoca(lezioneID: number) {
  //   if (this.dove == 'orario')
  //   this.svcLezioni.toggleEpoca(lezioneID).subscribe(() => this.loadData());
  // }



    handleResize (resizeInfo: EventResizeDoneArg) {
      if (resizeInfo.event.extendedProps['tipoEvento'].ckNota) {
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Le note vanno gestite dalla console Maestro"}
        });
        resizeInfo.revert();
      }  else {
      //let dt : Date | null   = resizeInfo.event.start;
      // let dtCalendario =Utility.formatDate(resizeInfo.event.start, FormatoData.yyyy_mm_dd);
      // let strH_INI =Utility.formatHour(resizeInfo.event.start);
      // let strH_END =Utility.formatHour(resizeInfo.event.end);
        let form: CAL_Evento;

        this.svcEventi.get(resizeInfo.event.id)
        .pipe ( tap ( val  =>  {
            form = val;
            let dtISOLocaleEnd = resizeInfo.event.end!.toLocaleString('sv').replace(' ', 'T');
            form.h_End = dtISOLocaleEnd.substring(11,19);
          }),
          concatMap(() => this.svcEventi.put(form))
        ).subscribe({
          next: res=>{//this._snackBar.openFromComponent(SnackbarComponent, {data: 'Record salvato', panelClass: ['green-snackbar']});
          },
          error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });
      }

      
    }

  handleDrop (dropInfo: EventDropArg) {
    if (dropInfo.event.extendedProps['tipoEvento'].ckNota) {
      this._dialog.open(DialogOkComponent, {
        width: '320px',
        data: {titolo: "ATTENZIONE!", sottoTitolo: "Le note vanno gestite dalla console Maestro"}
      });
      dropInfo.revert();
    }  else {
      //let dt : Date | null   = dropInfo.event.start;
      let dtCalendario =Utility.formatDate(dropInfo.event.start, FormatoData.yyyy_mm_dd);
      let strH_INI =Utility.formatHour(dropInfo.event.start);
      let strH_END =Utility.formatHour(dropInfo.event.end);

      let form: CAL_Evento;
      this.svcEventi.get(dropInfo.event.id).pipe (
        tap ( val   =>  {
          form = val;
          form.dtCalendario = dtCalendario;
          form.h_Ini = strH_INI;
          form.h_End = strH_END;


        }),
        concatMap(() => this.svcEventi.put(form))
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