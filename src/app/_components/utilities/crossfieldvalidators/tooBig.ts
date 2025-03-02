import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { A4V, A4H, A3V, A3H } from "src/environments/environment";

// export const tooWideValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
//     const x = control.get('x');
//     const w = control.get('w');
  
//     return x!.value + w!.value > A4V.width ? { tooWide: true } : null;
//   };

export function tooWideValidator(Obj: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const x = control.get('x');
    const w = control.get('w');
    const width = Obj.width;
  
    return x!.value + w!.value > width ? { tooWide: true } : null;
  };
}


// export const tooHighValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
//   const y = control.get('y');
//   const h = control.get('h');  
//   return y!.value + h!.value > 297 ? { tooHigh: true } : null;
// };

export function tooHighValidator(Obj: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const y = control.get('y');
    const h = control.get('h');
    const height = Obj.height;
  
    return y!.value + h!.value > height ? { tooHigh: true } : null;
  };
}

