import { Injectable }               from '@angular/core';
import { HttpClient }               from '@angular/common/http';
import { Observable }               from 'rxjs';
import { environment }              from 'src/environments/environment';

import { PAG_PagamentoRetta }       from 'src/app/_models/PAG_PagamentoRetta';

@Injectable({
  providedIn: 'root'
})

export class PagamentiRetteService {

  constructor(private http: HttpClient) { }

  list(): Observable<PAG_PagamentoRetta[]>{
    return this.http.get<PAG_PagamentoRetta[]>(environment.apiBaseUrl+'PAG_PagamentiRette');
    //http://213.215.231.4/swappX/api/PAG_PagamentiRette
  }

  get(pagamentoRettaID: number): Observable<PAG_PagamentoRetta>{
    return this.http.get<PAG_PagamentoRetta>(environment.apiBaseUrl+'PAG_PagamentiRette/'+pagamentoRettaID);
    //http://213.215.231.4/swappX/api/PAG_PagamentiRette/5
  }


  put(formData: any): Observable <any>{
    return this.http.put(environment.apiBaseUrl  + 'PAG_PagamentiRette/' + formData.id , formData);    
  }

  post(formData: any): Observable <any>{
    formData.id = 0;
    return this.http.post(environment.apiBaseUrl  + 'PAG_PagamentiRette' , formData);  
  }

  delete(pagamentoRettaID: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_PagamentiRette/' + pagamentoRettaID);    
  }

  deleteByPagamento(pagamentoID: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_PagamentiRette/DeleteByPagamento/' + pagamentoID);    
  }

  deleteByRetta(rettaID: number): Observable <any>{
    return this.http.delete(environment.apiBaseUrl  + 'PAG_PagamentiRette/DeleteByRetta/' + rettaID);    
  }

}
