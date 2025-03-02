import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {
  invokeAppComponentRefreshFoto = new EventEmitter();    
  refreshFotoSubscribeAttiva!: Subscription;    
    
  invokeUserEmit = new EventEmitter();    
  userSubscribeAttiva!: Subscription;    

  constructor() { }    
    
  onAccountSaveProfile() {
    this.invokeAppComponentRefreshFoto.emit();    
  }  

  onLogin(user:any) {
    //console.log("event-emitter - onLogin - passa di qua", user)
    this.invokeUserEmit.emit(user);
  }

  onLogout() {
    //console.log("event-emitter - onLogout - passa di qua")
    this.invokeUserEmit.emit(null);
  }
}
