//#region ----- IMPORTS ------------------------

import { Component, OnInit, ViewChild }         from '@angular/core';
import { RetteListComponent }                   from '../rette-list/rette-list.component';
import { NavigationService } from '../../utilities/navigation/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { ClassiSezioniAnniService } from '../../classi/classi-sezioni-anni.service';
//#endregion
@Component({
  selector: 'app-rette',
  templateUrl: './rette-page.component.html',
  styleUrls: ['../pagamenti.css']
})
export class RettePageComponent implements OnInit {

  classeSezioneAnnoIDrouted!:                         number;
  @ViewChild(RetteListComponent) retteList!: RetteListComponent; 


  constructor(
              private actRoute:                 ActivatedRoute,
              private svcClassiSezioniAnni:     ClassiSezioniAnniService
  ) {

  }

  ngOnInit() {


  }

  ngAfterViewInit() {
    this.actRoute.queryParams.subscribe(
      params => { 
        this.classeSezioneAnnoIDrouted = params['classeSezioneAnnoID'];  
        if (!this.classeSezioneAnnoIDrouted) {return;}
        //ora devo passare la classe a RetteList
        this.svcClassiSezioniAnni.get(this.classeSezioneAnnoIDrouted).subscribe( 
          res=> {this.retteList.form.controls['filterControl'].setValue(res.classeSezione.classe!.descrizioneBreve+" "+res.classeSezione.sezione);
          this.retteList.applyFilter(res.classeSezione.classe!.descrizioneBreve+" "+res.classeSezione.sezione);
        });
    });
  }


  calcoloRette() {
    this.retteList.calcoloRette()
  }

  
}
