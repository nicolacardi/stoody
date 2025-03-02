//#region ----- IMPORTS ------------------------

import { Injectable }                   from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { Observable }                   from 'rxjs';
import { environment }                  from 'src/environments/environment';

//components

//services

//classes
import { _UT_Parametro }                from '../../../_models/_UT_Parametro';

//#endregion

@Injectable({
  providedIn: 'root'
})
export class ParametriService {

  constructor(private http: HttpClient) { }
  
  get(parametroID: any): Observable<_UT_Parametro>{
    return this.http.get<_UT_Parametro>(environment.apiBaseUrl+'_UT_Parametri/'+parametroID);
    //http://213.215.231.4/swappX/api/_UT_Parametri/2
  }

  list(): Observable<_UT_Parametro[]>{
    return this.http.get<_UT_Parametro[]>(environment.apiBaseUrl+'_UT_Parametri');
    //http://213.215.231.4/swappX/api/_UT_Parametri
  }

  listSetupPage(): Observable<_UT_Parametro[]>{
    return this.http.get<_UT_Parametro[]>(environment.apiBaseUrl+'_UT_Parametri/ListSetupPage');
    //http://213.215.231.4/swappX/api/_UT_Parametri/ListSetupPage
  }


  getByParName(parName: string): Observable<_UT_Parametro>{
    return this.http.get<_UT_Parametro>(environment.apiBaseUrl+'_UT_Parametri/GetByParName/'+parName);
    //http://213.215.231.4/swappX/api/_UT_Parametri/GetByParName/AnnoCorrente
  }
 
  put(par: _UT_Parametro): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + '_UT_Parametri/' + par.id , par);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post( environment.apiBaseUrl  + '_UT_Parametri' , formData);  
  }

  delete(parametroID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + '_UT_Parametri/' + parametroID);    
  }

  updateSeq(seqInitial: number, seqFinal: number): Observable <any>{
    return this.http.put(environment.apiBaseUrl+'_UT_Parametri/UpdateSeq/'+seqInitial+'/'+seqFinal, seqInitial);
    //http://213.215.231.4/swappX/api/_UT_Parametri/UpdateSeq/1/2
  }

  renumberSeq() {
    const url = `${environment.apiBaseUrl}_UT_Parametri/RenumberSeq`;
    return this.http.put(url, null);
  }


}
