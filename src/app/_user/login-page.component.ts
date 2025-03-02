import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./user.css']
})

export class LoginPageComponent implements OnInit {

  routerPage!: string;
  
  constructor()  {
  }

  ngOnInit() {
    this.routerPage = "login";
  }

  // loadRoute() {
  //   console.log("loadRoute");
  //   let str = window.location.href;
  //   let lastUrlSegment= str.split('?')[0].split('/').pop();
  //   this.routerPage =lastUrlSegment!;
  //   console.log ("this.routerPage", window.location.href);
  // }

  reloadRoutesEmitted(route: string) {
    this.routerPage = route;
  }

}
