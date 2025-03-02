import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
    titolo: string;
    sottoTitolo: string;
    annoID: number;
    classeSezioneAnnoID: number;
    alunnoID: number;
}

@Component({
  selector: 'app-dialog-ok',
  templateUrl: './dialog-ok.component.html',
  styleUrls: ['./dialog-ok.component.css']
})

export class DialogOkComponent   {

  constructor( public dialogRef: MatDialogRef<DialogOkComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }


}
