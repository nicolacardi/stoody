//#region ----- IMPORTS ------------------------

import { AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild }         from '@angular/core';
import { MatDialog }                            from '@angular/material/dialog';
import { MatTabGroup }                          from '@angular/material/tabs';
import { ActivatedRoute }                       from '@angular/router';
import { Observable, concatMap, tap }                           from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';


//components
import { ClassiSezioniAnniListComponent }       from '../../classi/classi-sezioni-anni-list/classi-sezioni-anni-list.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { DocentiService }                       from '../docenti.service';
import { DocenzeService }                       from '../../docenze/docenze.service';
import { ClasseAnnoMateriaService }             from '../../classi-anni-materie/classe-anno-materia.service';
import { ClassiSezioniAnniService }             from '../../classi/classi-sezioni-anni.service';

//models
import { ALU_Alunno }                           from 'src/app/_models/ALU_Alunno';
import { User }                                 from 'src/app/_user/Users';
import { CLS_ClasseDocenteMateria }             from 'src/app/_models/CLS_ClasseDocenteMateria';
import { CLS_ClasseSezioneAnno }                from 'src/app/_models/CLS_ClasseSezioneAnno';
import { PER_Docente }                          from 'src/app/_models/PER_Docente';

//#endregion
@Component({
  selector: 'app-docenti-dashboard',
  templateUrl: './docenti-dashboard.component.html',
  styleUrls: ['../docenti.css']
})

export class DocentiDashboardComponent implements OnInit {

//#region ----- Variabili ----------------------

  public classeSezioneAnnoID!:                  number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public classeSezioneAnno!:                    CLS_ClasseSezioneAnno;
  public annoID!:                               number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docenteID!:                            number;   //valore ricevuto (emitted) dal child ClassiSezioniAnniList
  public docente!:                              PER_Docente;
  public tipoVoto!:                             string;
  public iscrizioneID!:                         number;   //valore ricevuto (emitted) dal child IscrizioniClasseList
  public alunno!:                               ALU_Alunno;   //valore ricevuto (emitted) dal child IscrizioniClasseList

  public classeSezioneAnnoIDrouted!:            string;   //valore ricevuto (routed) dal ruoting
  public annoIDrouted!:                         string;   //valore ricevuto (routed) dal ruoting
  isOpen = true;
  
  public currUser!:                             User;
  
  obsMaterie$!:                                 Observable<CLS_ClasseDocenteMateria[]>;
  arrMaterie!:                                  CLS_ClasseDocenteMateria[];
  form! :                                       UntypedFormGroup;
  public materiaID!:                            number;

//#endregion
  
//#region ----- ViewChild Input Output -------
  @ViewChild(ClassiSezioniAnniListComponent) viewClassiSezioniAnni!: ClassiSezioniAnniListComponent; 
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
//#endregion

  constructor(
    private svcDocenti:               DocentiService,
    private svcClassiSezioniAnni:     ClassiSezioniAnniService,
    public _dialog:                   MatDialog,
    private actRoute:                 ActivatedRoute,
    private svcDocenze:               DocenzeService,
    private fb:                       UntypedFormBuilder, 
    private svcClasseAnnoMateria:     ClasseAnnoMateriaService
  ) {
    this.form = this.fb.group( {
      selectClasseDocenteMaterie: 0
    });
  }

//#region ----- LifeCycle Hooks e simili--------



  ngOnInit() {

    this.actRoute.queryParams.subscribe(
      params => {
        this.annoIDrouted = params['annoID'];     
        this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
    });

    //this._navigationService.passPage("docentiDashboard");

    this.currUser = Utility.getCurrentUser();

    if(this.currUser.personaID != null && this.currUser.personaID != 0){
      this.svcDocenti.getByPersona(this.currUser.personaID).subscribe(
        res => {   
          if(res)
            this.docenteID = res.id;
          else
            this.docenteID = 0;
        },
        //err=> console.log("getDocenteBypersonaID- KO:", err)
      )
    }

    this.form.controls['selectClasseDocenteMaterie'].valueChanges.pipe(
      tap(val => this.materiaID = val),
      concatMap(()=> this.svcClasseAnnoMateria.getByMateriaAndClasseSezioneAnno(this.materiaID, this.classeSezioneAnnoID))
    ).subscribe(res => 
    {
      // console.log("docenti-dashboard - ngOnInit - this.materiaID", this.materiaID);
      // console.log("docenti-dashboard - ngOnInit - this.classeSezioneAnnoID", this.classeSezioneAnnoID);
      // console.log("docenti-dashboard - ngOnInit - res", res);
      this.tipoVoto = res.tipoVoto!.descrizione
    }
    );
  }



//#endregion

//#region ----- ricezione emit -------
    //questo valore, emesso dal component ClassiSezioniAnni e qui ricevuto
    //serve per la successiva assegnazione ad una classe...in quanto il modale che va ad aggiungere
    //le classi ha bisogno di conoscere anche l'annoID per fare le proprie verifiche

  annoIdEmitted(annoID: number) {
    this.annoID = annoID;
  }

  classeSezioneAnnoIDEmitted(classeSezioneAnnoID: number) {

    setTimeout(() => { window.dispatchEvent(new Event('resize'));}, 0); //questo forza il resize: senza di questo la tab alunni si vede solo parzialmente all'inizio
    //this.cdr.detectChanges();
    this.tipoVoto = "";
    this.materiaID = 0;
    this.classeSezioneAnnoID = classeSezioneAnnoID;





    if(this.classeSezioneAnnoID >0){
      //per poter mostrare il docente e la classe...
      this.svcClassiSezioniAnni.get(this.classeSezioneAnnoID).subscribe(
        csa => this.classeSezioneAnno = csa
      );

      this.svcDocenti.get(this.docenteID).subscribe(
        doc =>  this.docente = doc
      );

      // Estraggo le materie di questo docente in questa classe e le metto nella combo
      this.svcDocenze.listByClasseSezioneAnnoDocente(classeSezioneAnnoID, this.docenteID).subscribe(
        materie=> {
          
          if(materie != null && materie.length>0){
            this.arrMaterie = materie;
            this.form.controls['selectClasseDocenteMaterie'].setValue(materie[0].materiaID);
          }
        }
      )
    };
  }

  docenteIdEmitted(docenteId: number) {
    this.docenteID = docenteId;
  }

  iscrizioneIDEmitted(iscrizioneID: number) {
    this.iscrizioneID = iscrizioneID;
  }

  alunnoEmitted(alunno: ALU_Alunno) {
    this.alunno = alunno;
  }

//#endregion

//#region ----- Altri metodi ------------------

  selectedTabValue(event: any){
    //senza questo espediente non fa il primo render correttamente

    // if (this.tabGroup.selectedIndex == 1) {
    //   this.viewOrarioDocente.calendarDOM.getApi().render();
    //   this.viewOrarioDocente.loadData()
    // }
    
  }
  
//#endregion
}
