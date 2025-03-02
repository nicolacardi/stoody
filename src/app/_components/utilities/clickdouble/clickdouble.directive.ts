
import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[click.single],[click.double],[mousedown],[mouseup]',
})
export class ClickDoubleDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 300;
  @Output('click.double') doubleClick = new EventEmitter();
  @Output('click.single') singleClick = new EventEmitter();
  @Output('click.mousedown') mouseDown = new EventEmitter();
  @Output('click.mouseup') mouseUp = new EventEmitter();


  private clicksSubject = new Subject<MouseEvent>();
  private subscription!: Subscription;

  constructor() {}
  // https://javascript.plainenglish.io/stop-the-horrible-clash-between-single-and-double-clicks-in-angular-5798ce90fd1a
  ngOnInit() {
    this.subscription = this.clicksSubject.pipe(debounceTime(this.debounceTime)).subscribe(event => {
      if (event.type === 'click') {
        this.singleClick.emit(event);
      }

      if (event.type === 'dblclick') {
        this.doubleClick.emit(event);
      }

      if (event.type === 'mousedown') {
        this.mouseDown.emit(event);
      }

      if (event.type === 'mouseup') {
        this.mouseUp.emit(event);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicksSubject.next(event);
  }
  @HostListener('dblclick', ['$event'])
  doubleClickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicksSubject.next(event);
  }

  @HostListener('mousedown', ['$event'])
  mouseDownEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicksSubject.next(event);
  }

  @HostListener('dblclick', ['$event'])
  mouseUpEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clicksSubject.next(event);
  }
}
