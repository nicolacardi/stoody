//#region ----- IMPORTS ------------------------
import { Component, ElementRef, OnInit, ViewChild }                    from '@angular/core';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { MatDialog }                            from '@angular/material/dialog';

//components
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';
import { SnackbarComponent }                    from '../../utilities/snackbar/snackbar.component';
import { Utility }                              from '../../utilities/utility.component';

//services
import { ParametriService }                     from 'src/app/_components/impostazioni/parametri/parametri.service';

//models
import { _UT_Parametro }                        from 'src/app/_models/_UT_Parametro';
//#endregion

@Component({
  selector: 'app-imguploads',
  templateUrl: './imguploads.component.html',
  styleUrls: ['./imguploads.css']
})

export class ImgUploadsComponent implements OnInit {

//#region ----- Variabili ----------------------
  logoStoody!:                             _UT_Parametro;
  logoScuolaEmail!:                             _UT_Parametro;
  timbroScuola!:                                _UT_Parametro;
  firmaPreside!:                                _UT_Parametro;

  imgFileLogoStoody!:                           string;
  imgFileLogoScuolaEmail!:                      string;
  imgFileTimbroScuola!:                         string;
  imgFileFirmaPreside!:                         string;

  foto!:                                        string;
//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('logoStoody', {static: false}) logoStoodyDOM!: ElementRef;
  @ViewChild('logoScuolaEmail', {static: false}) logoScuolaEmailDOM!: ElementRef;
  @ViewChild('timbroScuola', {static: false}) timbroScuolaDOM!: ElementRef;
  @ViewChild('firmaPreside', {static: false}) firmaPresideDOM!: ElementRef;

//#endregion

//#region ----- Constructor --------------------
  constructor(public _dialog:                   MatDialog,
              private _snackBar:                MatSnackBar,
              private svcParametri:             ParametriService ) { 

}

//#endregion


  ngOnInit(): void {

    this.svcParametri.getByParName("imgFileLogoStoody").subscribe(
      val=> {
        if(val){
          this.logoStoody = val;
          this.imgFileLogoStoody = val.parValue; 
        }
      }
    );

    this.svcParametri.getByParName("imgFileLogoScuolaEmail").subscribe(
      val=> {
        if(val){
          this.logoScuolaEmail = val;
          this.imgFileLogoScuolaEmail = val.parValue; 
        }
      }
    );

    this.svcParametri.getByParName("imgFileTimbroScuola").subscribe(
      val=> {
        if(val){
          this.timbroScuola = val;
          this.imgFileTimbroScuola = val.parValue; 
        }
      }
    );

    this.svcParametri.getByParName("imgFileFirmaPreside").subscribe(
      val=> {
        if(val){
          this.firmaPreside = val;
          this.imgFileFirmaPreside = val.parValue; 
        }
      }
    );

  }

  onImageChange(e: any, ctrl: string) {

    let imgFileVariable : string;
    let imgDOM: ElementRef;
    switch (ctrl) {
      case 'imgFileLogoStoody':
        imgFileVariable = this.imgFileLogoStoody;
        imgDOM = this.logoStoodyDOM;
        break;

      case 'imgFileLogoScuolaEmail':
        imgFileVariable = this.imgFileLogoScuolaEmail;
        imgDOM = this.logoScuolaEmailDOM;
        break;

      case 'imgFileTimbroScuola':
        imgFileVariable = this.imgFileTimbroScuola;
        imgDOM = this.timbroScuolaDOM;
        break;

      case 'imgFileFirmaPreside':
        imgFileVariable = this.imgFileFirmaPreside;
        imgDOM = this.firmaPresideDOM;
        break;
      default:

        break;
    }

    if (e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if (e.target.files[0].size > 200000) {
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: { titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)" }
        });
        return;
      };

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        imgDOM.nativeElement.src = reader.result;
        this.save(ctrl);

        // così invece la taglierei 200x200
        // imgFileVariable = reader.result as string;
        // await Utility.compressImage(imgFileVariable, 200, 200)
        //   .then(compressed => {
        //     imgDOM.nativeElement.src = compressed;
        //     this.save(ctrl);
        //   });
      };
    }
  }

  save(ctrl: string){

    let formParameter: _UT_Parametro | undefined = undefined;
  
    switch (ctrl) {
      case 'imgFileLogoStoody':
        formParameter = {
          id: this.logoStoody.id,
          parName: ctrl,
          parDescr: "Logo Stoody",
          parValue: this.logoStoodyDOM.nativeElement.src,
          ckSetupPage: false,
          ckTipo: false,
          seq: 0
        };
        break;

      case 'imgFileLogoScuolaEmail':
        formParameter = {
          id: this.logoScuolaEmail.id,
          parName: ctrl,
          parDescr: "Logo della scuola",
          parValue: this.logoScuolaEmailDOM.nativeElement.src,
          ckSetupPage: false,
          ckTipo: false,
          seq: 0
        };
        break;
  
      case 'imgFileTimbroScuola':
        formParameter = {
          id: this.timbroScuola.id,
          parName: ctrl,
          parDescr: "Timbro della scuola",
          parValue: this.timbroScuolaDOM.nativeElement.src,
          ckSetupPage: false,
          ckTipo: false,
          seq: 0
        };
        break;

      case 'imgFileFirmaPreside':
        formParameter = {
          id: this.firmaPreside.id,
          parName: ctrl,
          parDescr: "Firma del Preside",
          parValue: this.firmaPresideDOM.nativeElement.src,
          ckSetupPage: false,
          ckTipo: false,
          seq: 0
        };
        break;
      default:
        // Handle default case if necessary
        break;
    }
  
    if (formParameter) {
      this.svcParametri.put(formParameter).subscribe(() => {
        this._snackBar.openFromComponent(SnackbarComponent, { data: 'parametro salvato', panelClass: ['green-snackbar'] });
      });
    }
    
  }
}