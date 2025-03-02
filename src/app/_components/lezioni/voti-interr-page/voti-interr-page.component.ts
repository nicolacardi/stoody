import { Component, Input, ViewChild } from '@angular/core';
import { VotiInterrListComponent } from '../voti-interr-list/voti-interr-list.component';

@Component({
  selector: 'app-voti-interr-page',
  templateUrl: './voti-interr-page.component.html',
  styleUrls: ['../lezioni.css']
})
export class VotiInterrPageComponent {
//#region ----- ViewChild Input Output ---------
  @Input() classeSezioneAnnoID!:                number;
  @Input() docenteID!:                          number;
  @Input() lezioneID!:                          number;

  @ViewChild(VotiInterrListComponent) votiinterrList!: VotiInterrListComponent; 
//#endregion

//#region ----- Add Edit Drop ------------------
addRecord() {
  this.votiinterrList.addRecord()
}
//#endregion
}
