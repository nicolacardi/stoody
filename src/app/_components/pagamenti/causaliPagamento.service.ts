import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { PAG_CausalePagamento } from 'src/app/_models/PAG_CausalePagamento';

@Injectable({
  providedIn: 'root'
})

export class CausaliPagamentoService {

  constructor(private http: HttpClient) { }

  list(): Observable<PAG_CausalePagamento[]>{
    return this.http.get<PAG_CausalePagamento[]>(environment.apiBaseUrl+'PAG_CausaliPagamento');
  }
  
 //************** METODI NON USATI *****************/ 


  // loadByID(idCausalePagamento: any): Observable<PAG_CausalePagamento>{  
  //   return this.http.get<PAG_CausalePagamento>(environment.apiBaseUrl+'PAG_CausaliPagamento/'+idCausalePagamento);
  // }
  
  //filterList(searchstring: string): Observable<PAG_CausalePagamento[]>{

  //   return this.http.get<PAG_CausalePagamento[]>(environment.apiBaseUrl+'PAG_CausaliPagamento')
  //     .pipe (
  //       map(val=> val.filter(val=>val.descrizione.toLowerCase().includes(searchstring))),
  //     );
  // }
}
