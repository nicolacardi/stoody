import { AbstractControl, ValidatorFn } from '@angular/forms';


export function RequireMatch(control: AbstractControl) {

    const selection: any = control.value;
    if (typeof selection === 'string') {  
        //in pratica se quello che rimane scritto è una stringa viene lanciato l'errore....forse andrebbe meglio strutturato...
        //ad esempio qui andrebbe detto: se la selezione rientra nell'elenco delle persone....allora accettalo altrimenti no.
        return { incorrect: true };
    }
    return null;
}


export class FormCustomValidatorsArray {
    static valueSelected(myArray: any[]): ValidatorFn {
    //static valueSelected<T>(exists: (value: T) => boolean): ValidatorFn
      return (c: AbstractControl): { [key: string]: boolean } | null => {
        //console.log ("formcustomvalidator myArray", myArray);//my Array è l'array di valori che viene passato al validator, con il quale confrontare ciò che viene digitato (selectboxvalue)

        let typedOrSelectedValue = c.value;  //selectboxValue è ciò che è stato scritto nella casella oppure ciò che viene selezionato ("Andrea Svegliado")
        //console.log ("formcustomvalidator selectboxValue", typedOrSelectedValue);

        let pickedOrNot = myArray.filter(
          //(alias) => (alias.name + " " + alias.cognome) === selectboxValue
          (val) => (val.nome + " " + val.cognome) === typedOrSelectedValue
        );
        //console.log ("pickedOrNot", pickedOrNot);
        if (pickedOrNot.length > 0) {
          // everything's fine. return no error. therefore it's null.
          //console.log("ok");
          return null;
        } else {
          //console.log("error");
          //there's no matching selectboxvalue selected. so return match error.
          return { unmatched: true };
        }
      };
    }
  }

  export class FormCustomValidatorsObservable {
    static valueSelected<T>(exists: (value: T) => boolean): ValidatorFn {
      return (c: AbstractControl): { [key: string]: boolean } | null => {
        //console.log ("formcustomvalidator myArray", myArray);
        let selectboxValue = c.value;
        //console.log ("formcustomvalidator selectboxValue", selectboxValue);
        if (exists(selectboxValue)) {
          // everything's fine. return no error. therefore it's null.
          return null;
        } else {
          //there's no matching selectboxvalue selected. so return match error.
          return { 'match': true };
        }
      };
    }
  }
