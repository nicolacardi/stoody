import { Component, Input, ViewChild }          from '@angular/core';

//components
import { CompitiListComponent }                 from '../compiti-list/compiti-list.component';

@Component({
  selector: 'app-compiti-page',
  templateUrl: './compiti-page.component.html',
  styleUrls: ['../lezioni.css']
})
export class CompitiPageComponent {

//#region ----- ViewChild Input Output ---------
  @Input() classeSezioneAnnoID!:                number;
  @Input() docenteID!:                          number;
  @ViewChild(CompitiListComponent) compitiList!: CompitiListComponent; 
//#endregion

//#region ----- Add Edit Drop ------------------
  addRecord() {
    this.compitiList.addRecord()
  }
//#endregion
}
