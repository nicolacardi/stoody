import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
//import * as logoFile from './carlogo.js';
import { DatePipe } from '@angular/common';
import { FormatoData, Utility } from '../utility.component';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  constructor(private datePipe: DatePipe) {
  }

  generateExcel(rptData :any, rptColumnsNames: string[], rptFieldsToKeep: string[], rptTitle: string, rptFileName: string) {

//#region PREPARAZIONE DEI DATI ***************************************************************************
    //creo l'array per l'operazione di flattening
    let flattened : any= [];

    //con la funzione flattenObj schiaccio gli oggetti e li metto in flattened: i campi saranno del tipo alunno.nome
    rptData.forEach ((element: any) =>{
      flattened.push(this.flattenObj(element))}
    )

    //quanto segue prende l'array flattened e NE ESTRAE solo i campi che si trovano descritti in fieldsToKeep (quindi dinamicamente)
    let subsetFromFlattened = flattened.map((item: any) => {
      const returnValue : any = {}
      rptFieldsToKeep.forEach((key: string) => {
        returnValue[key] = item[key]
      })
      return returnValue;
    })

    //Ora trasformo un array di objects in un array di arrays
    let data = subsetFromFlattened.map((obj: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(obj)); 
//#endregion FINE PREPARAZONE DEI DATI ********************************************************************
    
    //creazione workbook e worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Report');


    //aggiunta riga e formattazione
    let titleRow = worksheet.addRow([rptTitle]);
    titleRow.font = { name: 'Titillium Web', family: 4, size: 16, bold: true }
    //riga vuota
    worksheet.addRow([]);
    //timestamp
    worksheet.addRow(['Data del report : ' + this.datePipe.transform(new Date(), 'medium')])
    //riga vuota
    worksheet.addRow([]);

    //intestazioni tabella
    let headerRow = worksheet.addRow(rptColumnsNames);
    
    //stile celle
    headerRow.eachCell((cell:any, number:number) => {
      cell.fill =       {
        // type: 'pattern',
        // pattern: 'solid',
        // fgColor:        { argb: 'FF2273a3' }, //colore dello sfondo (fgColor??)

        type: 'gradient',
        gradient: 'angle',
        degree: 90,
        stops: [
        {position:0, color:{argb:'FF2273a3'}},
        {position:1, color:{argb:'FF0a3c59'}}
        ]


      }
      cell.border =     { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      cell.font =       { name: 'Titillium Web', color: { argb: 'FFFFFFFF' } }
    })
    
    //costruisco un array di widths che contiene tanti elementi quanti fieldsToKeep.length.
    let widthsArr = [0]; //parto da un array che in prima posizione ha uno 0...
    rptColumnsNames.forEach(element => 
      widthsArr.push(element.length)//per ogni elemento del primo elemento di data aggiungo uno 0.
    )

    data.forEach((d: any, index: number) => {

      //se l'ultima parte è T00:00:00 allora si tratta di una data, va riformattata
      for (let colIndex = 0; colIndex < d.length; colIndex++) {
        const element = d[colIndex];
        if (typeof element === 'string' && element.endsWith('T00:00:00')) {
          d[colIndex] = Utility.formatDate(element, FormatoData.dd_mm_yyyy);
        }
      }


      //aggiorno la larghezza (servirà per fare l'autowidth) se trovo elementi più lunghi
      d.forEach((element: any, index: number) =>{
        let lenText = element ? element.length : 0;
        if (lenText > widthsArr[index + 1 ])  widthsArr[index + 1] = lenText; 
      })

      //SCRITTURA DEI DATI
      let row = worksheet.addRow(d);
      row.eachCell((cell:any) => {
        cell.font =       { name: 'Titillium Web'}
      })

      //colorazione alternata delle righe
      // if (index % 2 == 1) {
      //   row.eachCell((cell) => {
      //     cell.fill =       {         
      //       type: 'pattern',
      //       pattern: 'solid',
      //       fgColor:        { argb: 'FFEEEEEE' }
      //     }
      //   })
      // }


      //per "osservare" i valori
      //let qty = row.getCell(5);
      // if (qty.value < 500) {
      //   ...color = 'FF9999'
      // }

      
    });

    //widthsArr[] contiene la lunghezza dei testi della tabella
    for (let i = 1; i < widthsArr.length; i++) {
      //in excel la larghezza impostata in pixels NON E' PROPORZIONALE a quella in punti!
      //la relazione è wpunti = wpixels/6  -5/6 (infatti la lunghezza in pixel nonè mai minore di 5)
      //se uso ncaratteri per impostare la larghezza, questa sarà più stretta per numeri bassi e più alta per numeri alti...non va bene
      //infatti lui moltiplica i caratteri per 6 e ottiene la misura in pixels, ma questa si traduce poi in lunghezze non proporzionali
      //voglio invece impostare la larghezza in maniera proporzionale al numero di caratteri quindi applico la formula inversa...
      worksheet.getColumn(i).width = (widthsArr[i]*6+5)/6;
    }
    
    //settings per la stampa
    const lastColName =this.getExcelColumnName(rptFieldsToKeep.length)
    const lastRowNum = Math.max(data.length + 5, 25); //al minimo 25 righe
    worksheet.pageSetup.printArea = 'A1:'+lastColName+lastRowNum;
    worksheet.pageSetup.printTitlesRow = '1:5';
    worksheet.pageSetup.fitToPage = true;
    worksheet.pageSetup.fitToWidth = 1;
    worksheet.pageSetup.paperSize = 9;
    worksheet.pageSetup.orientation = 'landscape';
    worksheet.headerFooter.oddFooter = "Pag. &P di &N";

    //Generazione del file excel
    workbook.xlsx.writeBuffer().then((data: any) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const d = new Date();
      fs.saveAs(blob, d.toISOString().split('T')[0]+"_"+rptFileName);
    })
  }

  flattenObj (arrToFlatten: any){
    //questa funzione serve per schiacciare un Object
    //e restituire campi del tipo alunno.nome, alunno.cognome invece di alunno {nome:..., cognome:...}
      let result : any = {};
      for (const i in arrToFlatten) {
          //se trova un oggetto allora chiama se stessa ricorsivamente
          if ((typeof arrToFlatten[i]) === 'object' && !Array.isArray(arrToFlatten[i])) {
              const temp = this.flattenObj(arrToFlatten[i]);
              for (const j in temp) {
                  //costruisce la stringa ricorsivamente
                  result[i + '.' + j] = temp[j];
              }
          }
          // altrimenti non gli fa nulla
          else {
              result[i] = arrToFlatten[i];
          }
      }
      return result;
    };

    getExcelColumnName(columnNumber: number)
    {
      let i = 0;
      let i3, i4;
      let text3 = "";
      
      let colArray = [""];
      for (i3 = 0; i3 < 26; i3++) {
        text3 = String.fromCharCode(65 + i3);
        colArray[i] = text3;
        i++;
      }
      for (i3 = 0; i3 < 26; i3++) {
        for (i4 = 0; i4 < 26; i4++) {
          text3 = String.fromCharCode(65 + i3) + String.fromCharCode(65 + i4);
          colArray[i] = text3;
          i++;
        }
      }

      return colArray[columnNumber-1];
      
    } 
  
}