import {Injectable} from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  constructor() {
    super();  
    this.getAndInitTranslations();
  }

  getAndInitTranslations() {
   
      this.itemsPerPageLabel = "elementi per pagina";
      this.nextPageLabel = "Pagina successiva";
      this.previousPageLabel = "Pagina precedente";
      this.lastPageLabel = "Ultima pagina";
      this.firstPageLabel = "Prima pagina";
      this.changes.next();
  }

 override getRangeLabel = (page: number, pageSize: number, length: number) =>  {
    if (length === 0 || pageSize === 0) 
      return `nessun elemento`;
    
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `da ${startIndex + 1} a ${endIndex} su ${length}`;
  }
}