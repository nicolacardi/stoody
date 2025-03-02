//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output }     from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }   from '@angular/forms';
import { MatDialog }                            from '@angular/material/dialog';
import { Observable, of }                       from 'rxjs';
import { debounceTime, switchMap, tap }                                  from 'rxjs/operators';

//components
import { FormatoData, Utility }                 from '../../utilities/utility.component';

//services
import { ComuniService }                        from 'src/app/_services/comuni.service';
import { LoadingService }                       from '../../utilities/loading/loading.service';
import { SociService }                          from '../soci.service';

//models
import { PER_Socio, PER_TipoSocio }             from 'src/app/_models/PER_Soci';
import { _UT_Comuni }                           from 'src/app/_models/_UT_Comuni';
import { TipiSocioService }                     from '../tipi-socio.service';
import { User }                                 from 'src/app/_user/Users';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PER_Persona } from 'src/app/_models/PER_Persone';
import { PersoneService } from '../../persone/persone.service';
import { FormCustomValidatorsArray } from '../../utilities/requireMatch/requireMatch';

//#endregion
@Component({
  selector: 'app-socio-form',
  templateUrl: './socio-form.component.html',
  styleUrls: ['../soci.css']
})
export class SocioFormComponent implements OnInit {

//#region ----- Variabili ----------------------

  socio$!:                                      Observable<PER_Socio>;
  obsTipiSocio$!:                               Observable<PER_TipoSocio[]>;
  currSocio!:                                   User;
  persona$!:                                    Observable<PER_Persona>;

  public form! :                                UntypedFormGroup;
  emptyForm :                                   boolean = false;

  filteredPersone$!:                            Observable<PER_Persona[]>;

//#endregion

//#region ----- ViewChild Input Output -------
  @Input() socioID!:                            number;
  @Input() tipoSocioID!:                        number;
  @Input() dove!:                               string;

  @Output('formValid') formValid = new EventEmitter<boolean>();
//#endregion

//#region ----- Constructor --------------------

  constructor(public _dialog:                   MatDialog,
              private fb:                       UntypedFormBuilder, 
              private svcSoci:                  SociService,
              private svcTipiSocio:             TipiSocioService,
              private svcPersone:               PersoneService,
              private _loadingService :         LoadingService  ) { 

    this.form = this.fb.group({
      id:                                       [null],
      tipoSocioID:                              ['', Validators.required],
      personaID:                                [''],
      nome:                                     [{value: '', disabled: true}],
      cognome:                                  [{value: '', disabled: true}],
      dtNascita:                                [{value: '', disabled: true}],
      cf:                                       [{value: '', disabled: true}],
      dtRichiesta:                              [''],
      dtAccettazione:                           [''],
      quota:                                    [''],
      dtDisiscrizione:                          [''],
      dtRestQuota:                              [''],
      ckRinunciaQuota:                          [false],
      nomeCognomePersona:                       [null]
    });

    this.obsTipiSocio$ = this.svcTipiSocio.list();
  }
  
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit() {
    this.loadData();
    this.form.valueChanges.subscribe(
      res=> this.formValid.emit(this.form.valid) //ma serve??? Su procedura-iscrizioni ho fatto diversamente
    )

    this.svcPersone.list().subscribe(persone => {
      this.form.controls['nomeCognomePersona'].setValidators(
        [FormCustomValidatorsArray.valueSelected(persone)]
      );
    })

    this.filteredPersone$ = this.form.controls['nomeCognomePersona'].valueChanges
      .pipe(
        debounceTime(300),
        switchMap(() => this.svcPersone.filterPersoneNoSoci(this.form.value.nomeCognomePersona)),
      );
  }

  loadData(){

    if (this.tipoSocioID) this.form.controls['tipoSocioID'].setValue(this.tipoSocioID);

    if (this.socioID && this.socioID + '' != "0") {
      const obsSocio$: Observable<PER_Socio> = this.svcSoci.get(this.socioID);
      const loadSocio$ = this._loadingService.showLoaderUntilCompleted(obsSocio$);

      this.socio$ = loadSocio$
      .pipe( 
          tap(
            socio => {
              this.form.patchValue(socio)
              this.form.controls['nome'].setValue(socio.persona!.nome);
              this.form.controls['cognome'].setValue(socio.persona!.cognome);
              this.form.controls['dtNascita'].setValue(Utility.formatDate(socio.persona!.dtNascita, FormatoData.dd_mm_yyyy));
              this.form.controls['cf'].setValue(socio.persona!.cf);
            }
          )
      );
    }
    else 
      this.emptyForm = true

  }

  save() :Observable<any>{
    let ctrdtRichiesta = this.form.controls['dtRichiesta'];
    let ctrdtAccettazione = this.form.controls['dtAccettazione'];
    let ctrdtDisiscrizione = this.form.controls['dtDisiscrizione'];
    let ctrdtRestQuota = this.form.controls['dtRestQuota'];

    ctrdtRichiesta.setValue(Utility.formatDate(ctrdtRichiesta.value, FormatoData.yyyy_mm_dd));
    ctrdtAccettazione.setValue(Utility.formatDate(ctrdtAccettazione.value, FormatoData.yyyy_mm_dd));
    ctrdtDisiscrizione.setValue(Utility.formatDate(ctrdtDisiscrizione.value, FormatoData.yyyy_mm_dd));
    ctrdtRestQuota.setValue(Utility.formatDate(ctrdtRestQuota.value, FormatoData.yyyy_mm_dd));

    if (this.socioID == null || this.socioID == 0) 
      return this.svcSoci.post(this.form.value)
    else 
      return this.svcSoci.put(this.form.value)
  }

  delete() :Observable<any>{
    if (this.socioID != null) 
      return this.svcSoci.delete(this.socioID) 
    else return of();
  }

//#endregion

//#region ----- Altri metodi -------
  updateDt(dt: string, control: string){

    //prendo la stringa e ne estraggo i pezzi
    const parts = dt.split('/'); // Split the input string by '/'
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    // creo la nuova data con i valori estratti (assumendo l'ordine day/month/year)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // formatto la data al tipo richiesto dal controllo data ('yyyy-MM-dd')
    let formattedDate = date.toISOString().slice(0, 10);

    //piccolo step per evitare che 1/1/2008 diventi 31/12/2007
    formattedDate = Utility.formatDate(date, FormatoData.yyyy_mm_dd);

    //impostazione della data finale
    this.form.controls[control].setValue(formattedDate);
  }
  
//#endregion

//#region ----- Metodi per ricerca Persona -------


  selected(event: MatAutocompleteSelectedEvent): void {

    //questo metodo arriva da personaForm paro paro
    //come approccio alternativo all'uso di un customformvalidator vorrei fare come in 
    //https://stackblitz.com/edit/mat-autocomplete-force-selection-of-option?file=src%2Fapp%2Fautocomplete-auto-active-first-option-example.ts 
    //sembra infatti molto più "diretto" e "semplice" MA....come lo propone lui su ngAfterViewInit ...NON FUNZIONA CASSO! quindi lo metto qui che non è il massimo

    //***NC 25.12.22 ***/
    this.form.controls['personaID'].setValue(event.option.id);
    const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(event.option.id);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);
      this.persona$ = loadPersona$
      .pipe( 
          tap(
            persona => {
              this.form.controls['personaID'].setValue(persona.id);
              this.form.controls['nome'].setValue(persona.nome);
              this.form.controls['nome'].setValue(persona.cognome);
              this.form.controls['cf'].setValue(persona.cf);
              this.form.controls['dtNascita'].setValue(Utility.formatDate(persona.dtNascita, FormatoData.dd_mm_yyyy));
            }
          )
      );
      this.persona$.subscribe();
  }

//#endregion

}
