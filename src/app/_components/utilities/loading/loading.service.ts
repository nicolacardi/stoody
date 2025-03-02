import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { concatMap, finalize, tap } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
  })
  
export class LoadingService {
    show: boolean =  false;

    private loadingSubject = new BehaviorSubject<boolean>(false)
    loading$: Observable<boolean> = this.loadingSubject.asObservable();

    showLoaderUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
        
        //Questo metodo riceve in input un observable obs$ di qualsiasi natura (...<T>...)
        //ritorna un observable che parte da un observable VUOTO (...of(null))
        //al quale viene AGGANCIATO l'observable obs$ (concatMap)
        //quindi alla fine viene restituito LO STESSO OBSERVABLE
        //ma la differenza è che NEL FRATTEMPO è stato attivato e poi disattivato il loading
        //il component LoadingComponent è stato caricato in app.component come <loading><loading>
        //e' un component VUOTO che contiene SOLO lo spinner che ha un bell'ngIf su loadingService.loading$ | async
        //loading$ è un BehaviorSubject, quindi un servizio stateful nel quale andiamo a scrivere true o false a seconda
        setTimeout(()=>this.loadingOn(), 100);
        //this.loadingOn();
        return of(null) 
            .pipe(
                tap(()=> setTimeout(()=>this.loadingOn(), 100)),
                concatMap(() => obs$), // emette lo stesso identico observable di quello che riceve in input ma ha attivato il loading
                finalize(()=> {
                    setTimeout(()=>this.loadingOff(), 100);
                    //this.loadingOff();
                })
            )
    }
    
    loadingOn() {
        this.loadingSubject.next(true);
    }

    loadingOff() {
        this.loadingSubject.next(false);
    }
}