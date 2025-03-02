import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CLS_ClasseSezione} from 'src/app/_models/CLS_ClasseSezione';

@Injectable({
  providedIn: 'root'
})

export class ClassiSezioniService {

  constructor(private http: HttpClient) { }

  getByClasseSezione(classeID: number, Sezione: string): Observable<CLS_ClasseSezione> {
    //restituisce l'oggetto ClasseSezione 
    return this.http.get <CLS_ClasseSezione>( environment.apiBaseUrl  + 'CLS_ClassiSezioni/GetByClasseSezione/' + classeID + "/" + Sezione );  
    //http://213.215.231.4/swappX/api/CLS_ClassiSezioni/GetByClasseSezione/6/A
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_ClassiSezioni' , formData);  
  }


}
