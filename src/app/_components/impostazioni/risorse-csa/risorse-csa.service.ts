//#region ----- IMPORTS ------------------------

import { Injectable }                           from '@angular/core';
import { HttpClient }                           from '@angular/common/http';
import { Observable }                           from 'rxjs';
import { environment }                          from 'src/environments/environment';

//components

//services

//classes
import { CLS_RisorsaCSA }                       from 'src/app/_models/CLS_RisorsaCSA';


//#endregion

@Injectable({
  providedIn: 'root'
})
export class RisorseCSAService {

  constructor(private http: HttpClient) { }
  
  get(risorsaCSAID: any): Observable<CLS_RisorsaCSA>{
    return this.http.get<CLS_RisorsaCSA>(environment.apiBaseUrl+'CLS_RisorseCSA/'+risorsaCSAID);
    //http://213.215.231.4/swappX/api/CLS_RisorseCSA/2
  }

  getByTipoDocCSA(tipoDocumentoID: number, classeSezioneAnnoID: number): Observable<CLS_RisorsaCSA>{
    return this.http.get<CLS_RisorsaCSA>(environment.apiBaseUrl+'CLS_RisorseCSA/getByTipoDocCSA/'+tipoDocumentoID+'/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_RisorseCSA/getByTipoDocCSA/2/16
  }

  listByCSA(classeSezioneAnnoID: number): Observable<CLS_RisorsaCSA[]>{
    return this.http.get<CLS_RisorsaCSA[]>(environment.apiBaseUrl+'CLS_RisorseCSA/ListByCSA/'+classeSezioneAnnoID);
    //http://213.215.231.4/swappX/api/CLS_RisorseCSA/ListByCSA/16
  }

  list(): Observable<CLS_RisorsaCSA[]>{
    return this.http.get<CLS_RisorsaCSA[]>(environment.apiBaseUrl+'CLS_RisorseCSA');
    //http://213.215.231.4/swappX/api/CLS_RisorseCSA
  }

  put(par: CLS_RisorsaCSA): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CLS_RisorseCSA/' + par.id , par);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + 'CLS_RisorseCSA' , formData);  
  }

  delete(risorsaCSAID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_RisorseCSA/' + risorsaCSAID);    
  }

  deleteByTipoDocCSA(tipoDocumentoID: number, classeSezioneAnnoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CLS_RisorseCSA/DeleteByTipoDocCSA/'+tipoDocumentoID+'/'+classeSezioneAnnoID);
  }



}
