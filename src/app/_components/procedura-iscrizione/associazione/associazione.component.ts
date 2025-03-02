//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output }                            from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ALU_Genitore, ALU_GenitoreExtended } from 'src/app/_models/ALU_Genitore';
import { CLS_Iscrizione } from 'src/app/_models/CLS_Iscrizione';
import { SociService } from './soci.service';
import { concatMap } from 'rxjs';

//components

//services

//models

//#endregion



@Component({
  selector: 'app-associazione',
  templateUrl: './associazione.component.html',
  styleUrls: ['../procedura-iscrizione.css']
})
export class AssociazioneComponent implements OnInit{

  matDataSource = new MatTableDataSource<ALU_GenitoreExtended>();
  nsoci= 0;
  displayedColumns: string[] = [
    "nome", 
    "cognome", 
    "ckSocio"
  ];

  genitori: ALU_GenitoreExtended[] = [];
//#region ----- ViewChild Input Output -------
  @Input() iscrizione!:                         CLS_Iscrizione;
//#endregion

  constructor(private svcSoci:                  SociService,)   { 

  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    this.genitori = [];
    let _Genitori = this.iscrizione.alunno._Genitori;
    for (let i = 0; i < _Genitori!.length; i++) {
      const genitoreWithCheck: ALU_GenitoreExtended = {
        ..._Genitori![i].genitore!,
        isChecked: false // Inizializza la proprietà isChecked a false
      };
      this.genitori.push(genitoreWithCheck);
    }


    for (let i =0; i< this.genitori.length; i++) {
      this.svcSoci.getByPersona(this.genitori[i].personaID)
        .subscribe(
          (socio: any) => {
            this.genitori[i].persona.socio = socio;
            //ho aggiunto una proprietà ischecked e usato l'interface ALU_GenitoriExtended
            if (socio) {this.nsoci++; this.genitori[i].isChecked = true;}
          }
        )
    }
    this.matDataSource.data = this.genitori;

  }

  ckSocioChange(ck: boolean, personaID: number) {
    const genitore = this.genitori.find(g => g.persona.id === personaID);
    if (genitore) {
      genitore.isChecked = ck;
      if (ck) this.nsoci++;
      else this.nsoci--;
    }


  }

  save() {
    for (let i =0; i< this.genitori.length; i++) {
      this.svcSoci.getByPersona(this.genitori[i].personaID)
      .subscribe(
        () => {

          // console.log ("associazione - save personaID", this.genitori[i].persona.id);
          // console.log ("in db c'è:", this.genitori[i].persona.socio);
          // console.log ("in html c'è:", this.genitori[i].isChecked);

          //solo nel caso seguente devo inserire un nuovo record con una richiesta di associazione
          if (!this.genitori[i].persona.socio && this.genitori[i].isChecked) {
            let dtRichiesta = new Date();

            let formSocio= {
              personaID: this.genitori[i].personaID,
              tipoSocioID: 1,
              dtRichiesta: dtRichiesta.toISOString()
            }
            this.svcSoci.post(formSocio)
            .subscribe(
              ()=>this.loadData() //se una volta salvato si vuole che il check box sia bloccato...
            );
            

          }

        }
      )
    }
  }


}
