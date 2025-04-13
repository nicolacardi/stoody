import { HttpClient }                           from '@angular/common/http';
import { Injectable }                           from '@angular/core';
import { Observable }                           from 'rxjs';
import { CAL_TipoEvento }                     from 'src/app/_models/CAL_TipoEvento';
import { environment }                          from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipiEventoService {

  constructor(private http: HttpClient) { }

  list(): Observable<CAL_TipoEvento[]>{
    return this.http.get<CAL_TipoEvento[]>(environment.apiBaseUrl+'CAL_TipiEvento');
    //http://213.215.231.4/swappX/api/CAL_TipiEvento
  }


  get(tipoeventoID: any): Observable<CAL_TipoEvento>{
    return this.http.get<CAL_TipoEvento>(environment.apiBaseUrl+'CAL_TipiEvento/'+tipoeventoID);
    //http://213.215.231.4/swappX/api/CAL_TipiEvento/3
  }

  put(formData: any): Observable <any>{
    return this.http.put( environment.apiBaseUrl  + 'CAL_TipiEvento/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    console.log ("formData", formData);
    return this.http.post( environment.apiBaseUrl  + 'CAL_TipiEvento' , formData);  
  }

  delete(tipoeventoID: number): Observable <any>{
    return this.http.delete( environment.apiBaseUrl  + 'CAL_TipiEvento/' + tipoeventoID);    
  }

  updateSeq(seqInitial: number, seqFinal: number): Observable <any>{
    //console.log(seqInitial, seqFinal);
    return this.http.put(environment.apiBaseUrl+'CAL_TipiEvento/UpdateSeq/'+seqInitial+'/'+seqFinal, seqInitial);
    //http://213.215.231.4/swappX/api/CAL_TipiEvento/UpdateSeq/1/2
  }

  renumberSeq() {
    const url = `${environment.apiBaseUrl}CAL_TipiEvento/RenumberSeq`;
    return this.http.put(url, null);
  }


}
