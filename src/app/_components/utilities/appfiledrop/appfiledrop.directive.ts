import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appFileDrop]'
})
export class FileDropDirective {
  @Output() fileDropped = new EventEmitter<FileList>();

  @HostBinding('class.file-over') fileOver: boolean = false;

  @HostListener('dragover', ['$event']) onDragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        //console.log(files.length, files);
      this.fileDropped.emit(files);
    }
  }
}