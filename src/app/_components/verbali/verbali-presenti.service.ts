import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VerbaliPresentiService {

  constructor(private http: HttpClient) { }

  deleteByVerbale(verbaleID: any): Observable<any>{
    return this.http.delete(environment.apiBaseUrl+'DOC_VerbalePresenti/DeleteByVerbale/'+verbaleID);   
    //http://213.215.231.4/swappX/api/DOC_VerbalePresenti/DeleteByVerbale/1
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'DOC_VerbalePresenti' , formData);  
  }
}
