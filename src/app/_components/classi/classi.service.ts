import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


import { CLS_Classe } from 'src/app/_models/CLS_Classe';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ClassiService {

  constructor(private http: HttpClient) { }

  list(): Observable<CLS_Classe[]> {
    //restituisce tutte le classi di un certo Alunno
    return this.http.get<CLS_Classe[]>( environment.apiBaseUrl  + 'CLS_Classi');  
    //http://213.215.231.4/swappX/api/CLS_Classi
  }



}
