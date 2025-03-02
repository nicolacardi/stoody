import { Injectable }                           from '@angular/core';
import { jsPDF }                                from 'jspdf';
import autoTable                                from 'jspdf-autotable';
import html2canvas                              from 'html2canvas';

import '../../../../assets/fonts/TitilliumWeb-Regular-normal.js';
import '../../../../assets/fonts/TitilliumWeb-SemiBold-normal.js';

import { DOC_Pagella }                          from 'src/app/_models/DOC_Pagella.js';
import { DOC_PagellaVoto }                      from 'src/app/_models/DOC_PagellaVoto.js';

import { rptPagella }                           from 'src/app/_reports/rptPagella';


@Injectable({
  providedIn: 'root'
})

export class JspdfService { defaultColor!:          string;
                            defaultFontSize!:       number;
                            defaultFontName!:       string;
                            defaultMaxWidth!:       number;
                            defaultCellLineColor!:  string;
                            defaultLineColor!:      string;
                            defaultFillColor!:      string;
                            defaultLineWidth!:      number;
                            objIndex!:              number;
                            Pagella!:               DOC_Pagella ;  //rptPagella è l'oggetto che carica il file di testo, mentre questo - Pagella - è l'oggetto con i dati della pagella
                            PagellaVoti!:           DOC_PagellaVoto[];  

  constructor() {}

  public downloadPdf (rptData :any, rptColumnsNameArr: any, rptFieldsToKeep: any, rptTitle: string, rptFileName: string)  {
    let doc = this.buildReportPdf (rptData, rptColumnsNameArr, rptFieldsToKeep, rptTitle);
    this.salvaPdf(doc,rptFileName);
  }

  private salvaPdf (doc :jsPDF ,  fileName: string, addDateToName: boolean = true ) {
    if(addDateToName){
      const d = new Date();
      fileName = d.toISOString().split('T')[0]+"_"+ fileName+".pdf";
    }
    doc.save(fileName);
  }

//#region ----- costruisce Report STANDARD -----

  private buildReportPdf (rptData :any, rptColumnsNameArr: any, rptFieldsToKeep: any, rptTitle: string) {

    const doc = new jsPDF('l', 'mm', [297, 210]);
    doc.setFont('TitilliumWeb-Regular', 'normal');
    let width = doc.internal.pageSize.getWidth();
    doc.text(rptTitle, width/2, 15, { align: 'center' });
    
    //costruisco la data per il footer (vedi options di autoTable è oltre)
    let today = new Date();
    let monthpadded = String(today.getMonth()+1).padStart(2, '0');
    let nDate = today.getDate() + '/' + monthpadded + '/' + today.getFullYear();

//#region PREPARAZIONE DEI DATI ***************************************************************************

    //faccio una copia del matDataSource
    //let tmpObjArr = toPrint; //ATTENZIONE: questa crea solo una REFERENCE all'array!
    //let sourceArr = JSON.parse(JSON.stringify(toPrint)); //questo è il modo corretto di creare una copia di un array

    //creo l'array per l'operazione di flattening
    let flattened : any= [];

    //con la funzione flattenObj schiaccio gli oggetti e li metto in flattened: i campi saranno del tipo alunno.nome
    rptData.forEach ((element: any) =>{
      flattened.push(this.flattenObj(element))}
    )
    //console.log ("jspdf.service: arrResult prima di togliere i campi superflui", flattened);

    // //per ogni proprietà nella mappa vado a vedere se sono incluse nell'array di quelle da tenere
    //FUNZIONA MA HA I CAMPI IN DISORDINE!!!! NON RIESCO QUI A GOVERNARE L'ORDINE DEI CAMPI
    // allProperties.forEach((proprieta: string) =>{
    //     //se la proprietà non è inclusa....
    //     if (!fieldsToKeep.includes(proprieta)) {
    //       //vado a toglierla da ArrResult
    //       flattenedToPrint.forEach ( (record: any) => {
    //         delete record[proprieta];}
    //       )
    //     }
    //   }
    // )
    // console.log ("jspdf.service: arrResult dopo aver tolto i campi superflui", flattenedToPrint);

    //il metodo di togliere i campi che non servono lascia l'ordine che decide LUI nei campi...non va bene. serve una procedura che PESCHI i campi che servono

     //https://stackoverflow.com/questions/58637899/create-a-copy-of-an-array-but-with-only-specific-fields FUOCHINO FUOCHINO...
     //https://stackoverflow.com/questions/68768940/typescript-array-map-with-dynamic-keys ECCO LA RISPOSTA!!!

      //quanto segue prende l'array flattened e NE ESTRAE solo i campi che si trovano descritti in fieldsToKeep (quindi dinamicamente)
      let subsetFromFlattened = flattened.map((item: any) => {
        const returnValue : any = {}
        rptFieldsToKeep.forEach((key: string) => {
          returnValue[key] = item[key]
        })
        return returnValue;
      })

    //console.log ("jspdf.service: selectionFromFlattened dopo aver aggiunto i campi fieldsToKeep", subsetFromFlattened);



//#endregion FINE PREPARAZONE DEI DATI ********************************************************************

  //la riga che segue originariamente sarebbe stata: let array = json.map(obj => Object.values(obj)); 
  //e serve a trasformare un array di objects in un array di arrays
  //infatti autotable richiede che il body sia un array di arrays
  let array = subsetFromFlattened.map((obj: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(obj)); 

//#region PASSAGGIO A AUTOTABLE DEI DATI PREPARATI ********************************************************
  autoTable(doc, {
    startY: 20,
    head: rptColumnsNameArr,
    body: array,
    styles: {font: "TitilliumWeb-Regular"},
    willDrawCell: (HookData) => {  
      // if (HookData.section === 'head') { doc.setTextColor(255, 0, 0);} //colora le celle dell'head di rosso
      let cellContent = HookData.cell.raw+"";
      let last9 = cellContent.slice(-9);
      if (last9 == 'T00:00:00') { //in questo modo OSCENO identifico se si tratta di una data
        //console.log ("Hookdata.cell.text[0]", );
        //HookData.cell.text[0] = cellContent.slice(0,10); //non so perchè ma HookData.cell.text è un array!

        var year = cellContent.substring(0,4);
        var month = cellContent.substring(5,7);
        let day = cellContent.substring(8,10);
        HookData.cell.text[0] = day + '/' + month + '/' + year;
        //HookData.cell.text[0] = Utility.formatDate(cellContent, FormatoData.dd_mm_yyyy); //NON FUNZIONANO LE UTILITY QUI, PERCHE' MAI???? TODO

      }

      // if (HookData.cell.raw === null) {
      //   HookData.cell.text[0] = "ccc";
      // }

      // if (HookData.cell.raw == "") {
      //   HookData.cell.text[0] = "ccc";
      // }
    },
    showHead: "everyPage",
    didDrawPage: function (data) {

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40);
      //doc.text(title, data.settings.margin.left, 10);
      
      // Footer
      let str = "Page " + data.pageNumber //+ "/" + data.pageCount;

      doc.setFontSize(9);

      // jsPDF 1.4+ uses getWidth, <1.4 uses .width
      let pageSize = doc.internal.pageSize;
      
      let pageWidth = pageSize.width
        ? pageSize.width
        : pageSize.getWidth();

      let pageHeight = pageSize.height
        ? pageSize.height
        : pageSize.getHeight();

      doc.text(str, data.settings.margin.left, pageHeight - 10);
      doc.text(rptTitle, pageWidth - data.settings.margin.right, pageHeight - 10, { align: 'right' });
      doc.text(nDate, width/2, 200, { align: 'center' });
    }

  })
//#endregion FINE AUTOTABLE ***************************************************************

    //di seguito vari metodi utilizzabili in jspdf
    // doc.text("jspdf funziona + o - come fpdf che io uso, ma ha moltissimi metodi suoi", 10, 10);
    // doc.text("In questo punto scrivo quello che mi pare", 100, 100);
    // doc.text("E anche in questo punto qui", 60, 110);
    // doc.setTextColor(255,0,0);
    // doc.text("E Scrivo anche in rosso", 60, 120);
    // doc.setTextColor(0,255,0);
    // doc.text("E in verde", 60, 130);
    // doc.setFontSize(10);
    // doc.setTextColor(0,0,0);
    // doc.text("ora diminuisco il font", 60, 135);
    // doc.setFontSize(20);
    // doc.text("ora lo aumento", 120, 135);
    // doc.setFontSize(10);
    // doc.setTextColor(0,0,255);
    // doc.setDrawColor(255,0,0);
    // doc.cell(10, 140, 50, 20, "e qui scrivo in una cella quanto testo voglio e lui va a capo", 0, "left");
    // doc.cell(60, 140, 50, 20, "e qui scrivo in una cella adiacente", 0, "left");
    // doc.setTextColor(255,0,0);
    // doc.setDrawColor(0,0,255);

    // doc.setFillColor(0,0,200);
    // doc.cell(110, 140, 70, 20, "alla fine è solo questione di dedicarci del tempo...ma si può fare quasi tutto quello che si vuole", 0, "left");

    //const d = new Date();
    return doc;
    
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
//#endregion
  



//***************************************************************************************************************/
//***************************************************************************************************************/
//*******************TUTTO QUANTO SEGUE UTILIZZAVA JSPD FPER CREARE IL PDF DELLA PAGELLA IN VARI MODI************/
//*******************INOLTRE VENIVA UTILIZZATO DALLA PARTE TEMPLATE, CHE ORA E' STATA INIBITA *******************/
//*******************OGGI E' TUTTO STATO SOSTITUITO DA DOCX: JSPDF VIENE MANTENUTO SOLO PER LE TABELLE STANDARD**/
//***************************************************************************************************************/
//***************************************************************************************************************/
//(si potrebbe anche cancellare tutto ma hai visto mai che un giorno vogliamo riesumare delle parti)*************/

//#region ----- ****************************************************rptFromtemplate -----
  public async rptFromtemplate(rptBase: any) : Promise<jsPDF> {

    let pageW: number = 0;
    let pageH: number = 0;

    //Il primo elemento di rptBase DEVE essere SheetDefault sennò tutto si ferma e viene emesso un documento con un errore
    let sheetDefault = rptBase[0]                      //  rptBase per ora è un oggetto esterno, poi sarà ciò che viene passato negli argomenti
    
  //#region ----- caricamento dei valori di default -----    
    if(sheetDefault.tipo != "SheetDefault"){
      let doc : jsPDF  = new jsPDF('p', 'mm', [297,210]);  
      doc.text("ERRORE: manca il tag [SheetDefault] in rptBase",10, 50);
      return doc;
    }

    pageW= parseInt(sheetDefault.width);
    pageH= parseInt(sheetDefault.heigth);

    this.defaultColor = sheetDefault.defaultColor;
    this.defaultFontSize = sheetDefault.defaultFontSize;
    this.defaultFontName = sheetDefault.defaultFontName;
    this.defaultMaxWidth = sheetDefault.defaultMaxWidth;
    this.defaultFillColor = sheetDefault.defaultFillColor;
    this.defaultLineColor = sheetDefault.defaultLineColor;
    this.defaultCellLineColor = sheetDefault.defaultCellLineColor;
    this.defaultLineWidth = sheetDefault.defaultLineWidth;
    let doc : jsPDF  = new jsPDF(sheetDefault.orientation, 'mm', [pageW , pageH]);
    doc.setFont(sheetDefault.defaultFontName, 'normal');
  //#endregion

    for (let i = 1; i < rptBase.length; i++) {
      let element = rptBase[i];
      // console.log ("jspdf - rptFromtemplate - element",element);
      switch(element.tipo){
        case "SheetDefault":
          break;
        // case "Image":{
        //   const ImageUrl = "./assets/photos/" + element.value;
        //   await this.addImage(doc,ImageUrl, element.X ,element.Y, element.W);
        //   break;
        // }
        case "ImageBase64":{
          await this.addImageBase64(doc, element.value, element.X ,element.Y, element.W, element.H);
          break;
        }
        // case "Text":{
        //   this.addText(doc,this.parseTextValue( element.value),element.X,element.Y,element.fontName,"normal",element.color,element.fontSize, element.align, element.maxWidth );
        //   break;
        // }
        case "TextHtml":{
          
          await this.addTextHtml(doc,element.value,element.X,element.Y,element.W, element.H, "", "normal", "",0, 0, element.backgroundColor );
          break;
        }
        // case "TableStatica":{
        //   this.addTableStatica(doc, element.head, element.headEmptyRow, element.body, element.colWidths, element.cellBorders, element.rowsMerge ,element.colFills, element.fontName, element.X,element.Y,element.W, element.H, "normal",element.color,20, element.lineColor, element.cellLineColor, element.fillColor, element.lineWidth, element.align, element.colSpans);
        //   break;
        // }
        // case "TableDinamica":{
        //   this.addTableDinamica(doc, element.head, element.headEmptyRow, element.body, element.colWidths, element.cellBorders, element.rowsMerge, element.colFills, element.fontName, element.X,element.Y,element.W, element.H, "normal",element.color,20, element.lineColor, element.cellLineColor, element.fillColor, element.lineWidth, element.align, element.colSpans);
        //   break;
        // }
        // case "TableDinamicaPagella":{
        //   this.addTableDinamicaPagella(doc, element);
        //   break;
        // }
        // case "Line":{
        //   this.addLine(doc,element.X1,element.Y1,element.X2,element.Y2, element.color, element.thickness);
        //   break;
        // }
        // case "Rect":{
        //   this.addRect(doc,element.X,element.Y,element.W,element.H, element.color, element.thickness, element.borderRadius);
        //   break;
        // }
        case "Page":{
          doc.addPage()
          break;
        }
        default:{
          this.addText(doc,"[## WRONG TAG ##]",element.X,element.Y,"TitilliumWeb-SemiBold","normal",'#FF0000',24, element.align, element.maxWidth );
          break;
        }
      }
    }
    return doc;
  }
  
  private async addTextHtml(docPDF: jsPDF, text: string, X: number, Y: number, W: number, H: number, fontName: string, fontStyle: string , fontColor:string, fontSize: number, maxWidth: number, backgroundColor: string  ){

    if(fontName == null || fontName == "") fontName = this.defaultFontName;   //da vedere se serve
    if(fontColor == null || fontColor == "") fontColor = this.defaultColor;   //da vedere se serve
    if(fontSize == null || fontSize == 0) fontSize = this.defaultFontSize;    //da vedere se serve
    if(maxWidth == null || maxWidth == 0) maxWidth = this.defaultMaxWidth;    //da vedere se serve
    
    let imgWidth = 0;
    let imgHeight = 0;

    const options = {
      scale: 1,
      dpi: 300,
      useCORS: true,
      backgroundColor: null,
      padding: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5
      }
    };

    const html = text;

    //prendo il div "di servizio"
    const tempElement = document.querySelector('#myDiv') as HTMLElement;
    if (!tempElement) {throw new Error('necessario per sicurezza che esista');}
    //applico al div il testo da convertire
    tempElement!.style.width = (W*10)+"px";
    tempElement!.style.height = (H*10)+"px";

    tempElement!.innerHTML = html;

    
    //ora devo estrarre font-size: --px e sostituirlo con font-size che desidero


    const newFontSize = (fontSize);
    // console.log ("jspdf - addTextHtml - newFontSize", newFontSize);
    // console.log ("jspdf - addTextHtml - tempElement prima di cambio font", tempElement);

        //definisco una funzione ricorsiva qui dentro e poi la chiamo
        
        function updateFontSize(node:any) {
          node.style.fontSize = newFontSize/0.255+'px'; //per tentativi....ma è giusto?????
          //node.style.fontSize = newFontSize/0.265+'px'; //sembra leggermente piccolo
          node.style.lineHeight = '1.2em';

          const children = node.children;
          for (let i = 0; i < children.length; i++) {
            updateFontSize(children[i]); //chiama se stessa per tutti i figli
          }
        }

    updateFontSize(tempElement);
    // console.log ("jspdf - addTextHtml - tempElement dopo cambio font", tempElement);

    // Converto l'HTML a canvas
    const canvas = await html2canvas(tempElement, options);
    //estraggo il png dal canvas
    const imgData = await canvas.toDataURL('image/png')
    
    //attribuisco imgData a img.src
    let img = new Image();
    img.src = imgData;
    
    //estraggo le dimensioni dell'immagine
    const promise =() => new Promise ((resolve,reject) => {
      const imgTmp = new Image();
      imgTmp.src = imgData;
      imgTmp.onload = () => {
        imgWidth = imgTmp.width;
        imgHeight = imgTmp.height;
        resolve("hey");
      };
    })

    await promise();
    // console.log ("jspdf -  addTextHtml - aggiunto blocco in stampa in X Y W H", X, Y, W, H)
    docPDF.setFillColor(backgroundColor);
    docPDF.setDrawColor("222222");
    docPDF.setLineWidth (0.3);
    docPDF.rect(X,Y,W, H);
    docPDF.addImage(img, 'png', X, Y, W, W*imgHeight/imgWidth, undefined, 'FAST'
    );

  }  

  private async addImageBase64(docPDF: jsPDF, imgBase64: string, x: number, y: number,w: number, h: number ) {

    let imgWidth = 0;
    let imgHeight = 0;

    let img = new Image();
    img.src = imgBase64;

    const promise =() => new Promise ((resolve,reject) => {
      const imgTmp = new Image();
      imgTmp.src = imgBase64;
      imgTmp.onload = () => {
        imgWidth = imgTmp.width;
        imgHeight = imgTmp.height;
        resolve("hey");
      };
    })

    //bisogna determinare w e/o h da passare a addImage sulla base di w e h ricevuti e di imgHeight e imgWidth nativi
    //lo stesso per x e y. Il tutto dipende dalla relazione tra w/h e imgWidth/imgHeight
    await promise();
    if (w/h >= imgWidth/imgHeight) {
      //fisso h e calcolo w
      //devo però anche determinare x, y va bene come sta
      x=x+w/2-h/imgHeight*imgWidth/2;
      docPDF.addImage(img, 'png', x, y, h/imgHeight*imgWidth, h, undefined,'FAST');

    } else {
      //fisso w e calcolo h
      //devo però anche determinare y, x va bene come sta
      y=y+h/2-w*imgHeight/imgWidth/2;
      docPDF.addImage(img, 'png', x, y, w, w*imgHeight/imgWidth, undefined,'FAST');
    }
  }

  //questa è la routine BASE che viene chiamata dai report che si appoggiano al file rptPagella.ts
  public async dynamicRptPagella(objPagella: DOC_Pagella, lstPagellaVoti: DOC_PagellaVoto[]) : Promise<jsPDF> {

    
    let pageW: number = 0;
    let pageH: number = 0;

    this.Pagella = objPagella;          //  DOC_Pagella
    this.PagellaVoti = lstPagellaVoti;  //  DOC_PagellaVoto[] contiene i voti da inserire nel report
    //console.log ("jspdf.service.ts - dynamicRptPagella - PagellaVoti", this.PagellaVoti)

    //Il primo elemento di rptPagella DEVE essere SheetDefault
    let element = rptPagella[0]         //  rptPagella è stato valorizzato nelle dichiarazioni in apertura
    
//#region ----- caricamento dei valori di default -----    
    if(element.tipo != "SheetDefault"){
      let doc : jsPDF  = new jsPDF('l', 'mm', [100 , 100]);  
      doc.text("ERRORE: manca il tag [SheetDefault] in rptPagella",10, 50);
      return doc;
    }

    pageW= parseInt(element.width);
    pageH= parseInt(element.heigth);

    this.defaultColor = element.defaultColor;
    this.defaultFontSize = element.defaultFontSize;
    this.defaultFontName = element.defaultFontName;
    this.defaultMaxWidth = element.defaultMaxWidth;
    this.defaultFillColor = element.defaultFillColor;
    this.defaultLineColor = element.defaultLineColor;
    this.defaultCellLineColor = element.defaultCellLineColor;
    this.defaultLineWidth = element.defaultLineWidth;
  
    let doc : jsPDF  = new jsPDF('l', 'mm', [pageW , pageH]);   //A3
    doc.setFont('TitilliumWeb-Regular', 'normal');
//#endregion
    
    //LA PROMISE.ALL NON SI COMPORTA COME SE CHIAMASSE TUTTE LE FUNZIONI IN MANIERA SINCRONA
    //MA SEMPLICEMENTE NON FA PROCEDERE IL CODICE OLTRE PRIMA CHE TUTTE LE SUE PROMISE (AWAITED) SIANO TERMINATE
    //MA QUESTE RESTANO SINGOLARMENTE ASINCRONE, QUINDI FINISCO IN ORDINE "SPARSO"
    //IL CICLO FOR, INVECE, INSIEME CON IL COMANDO AWAIT FUNZIONA IN MANIERA SINCRONA
    
    //await Promise.all( rptPagella.map(async (element: any) => { QUESTA LA PROMISE.ALL FALLACE     


    for (let i = 1; i < rptPagella.length; i++) {


      let element = rptPagella[i];
      switch(element.tipo){
        case "SheetDefault":
          break;
        case "Image":{
          // console.log ("element.tipo Image");

          const ImageUrl = "./assets/photos/" + element.value;
          await this.addImage(doc,ImageUrl, element.X ,element.Y, element.W);
          break;
        }
        case "Text":{
          this.addText(doc,this.parseTextValue( element.value),element.X,element.Y,element.fontName,"normal",element.color,element.fontSize, element.align, element.maxWidth );
          break;
        }
        case "TableStatica":{
          this.addTableStatica(doc, element.head, element.headEmptyRow, element.body, element.colWidths, element.cellBorders, element.rowsMerge ,element.colFills, element.fontName, element.X,element.Y,element.W, element.H, "normal",element.color,20, element.lineColor, element.cellLineColor, element.fillColor, element.lineWidth, element.align, element.colSpans);
          break;
        }
        case "TableDinamica":{
          this.addTableDinamica(doc, element.head, element.headEmptyRow, element.body, element.colWidths, element.cellBorders, element.rowsMerge, element.colFills, element.fontName, element.X,element.Y,element.W, element.H, "normal",element.color,20, element.lineColor, element.cellLineColor, element.fillColor, element.lineWidth, element.align, element.colSpans);
          break;
        }
        case "TableDinamicaPagella":{
          this.addTableDinamicaPagella(doc, element);
          break;
        }
        case "Line":{
          this.addLine(doc,element.X1,element.Y1,element.X2,element.Y2, element.color, element.thickness);
          break;
        }
        case "Rect":{
          this.addRect(doc,element.X,element.Y,element.W,element.H, element.color, element.thickness, element.borderRadius);
          break;
        }
        case "Page":{
          doc.addPage()
          break;
        }
        default:{
          this.addText(doc,"[## WRONG TAG ##]",element.X,element.Y,"TitilliumWeb-SemiBold","normal",'#FF0000',24, element.align, element.maxWidth );
          break;
        }
      }
    }
    return doc;
  }

//#endregion

//#region ----- addTableStatica -----

  private async addTableStatica(docPDF: jsPDF, 
                                head:any, 
                                headEmptyRow: number, 
                                body: any, 
                                colWidths: any, 
                                cellBorders: any, 
                                rowsMerge: any,  
                                colFills: any, 
                                fontName: string, 
                                X: number, 
                                Y: number, 
                                W: number, 
                                H: number, 
                                fontStyle: string , 
                                fontColor:string, 
                                fontSize: number, 
                                lineColor: string, 
                                cellLineColor: string, 
                                fillColor: string, 
                                lineWidth: number, 
                                align: any, 
                                colSpans: any)
{
    
    if(fontName == null || fontName == "")            fontName = this.defaultFontName;
    if(fontColor == null || fontColor == "")          fontColor = this.defaultColor;
    if(fontSize == null || fontSize == 0)             fontSize = this.defaultFontSize;
    if(lineColor == null || lineColor == "")          lineColor = this.defaultLineColor;
    if(cellLineColor == null || cellLineColor == "")  cellLineColor = this.defaultCellLineColor;
    if(fillColor == null || fillColor == "")          fillColor = this.defaultFillColor;
    if(lineWidth == null || lineWidth == 0)           lineWidth = this.defaultLineWidth;

    //docPDF.setFont(fontName, fontStyle); //non sembra funzionare

    docPDF.setTextColor(fontColor);
    docPDF.setDrawColor(lineColor);
    docPDF.setFontSize(fontSize);

    let columnStylesObj= <any>{};
    W = 0;
    for (let i = 0; i < colWidths.length; i++) {
      columnStylesObj[i] = {}
      columnStylesObj[i]["cellWidth"] = colWidths[i];
      W = W + colWidths[i];
    }

    let headObj: { content: any, styles:any  }[][] = [];
    let bodyObj: { content: any, colSpan: any, rowSpan: any, styles:any  }[][] = []; ///in questo modo suggerisce https://stackoverflow.com/questions/73258283/populate-an-array-of-array-of-objects
    let cellLineWidth : number; 
    let cellFill: any;
    let colSpan: any;
    let rowSpan: any;
    let i: number; //serve definirlo fuori dal ciclo for perchè poi serve tenere l'ultimo valore

    //****************   HEADER
    for (i = 0; i < head.length; i++) {         //potrebbero esserci più righe di header
      headObj.push([]);  //va prima inserito un array vuoto altrimenti risponde con un Uncaught in promise
      for (let j = 0; j < head[i].length; j++) {       
        headObj[i].push({ content: head[i][j], styles: {font: fontName, lineColor: cellLineColor} })
      }
    }

    //aggiunta riga vuota dopo l'header
    if (headEmptyRow ==1) {
      headObj.push([]);
      for (let j = 0; j < head[0].length; j++) {
        headObj[i].push({ content: "", styles: {lineWidth: 0, fillColor: false, minCellHeight: 1, cellPadding: 0} })        
      }
    }
    //****************   FINE HEADER

    for (let i = 0; i < body.length; i++) { //ogni riga è body[i]
      bodyObj.push([]);  //va prima inserito un array vuoto altrimenti risponde con un Uncaught in promise
      for (let j = 0; j < body[i].length; j++) {
        
        //estraggo il riempimento
        if (colFills == undefined || colFills == null || colFills[j] == null || colFills[j] == undefined || colFills[j] == 0) cellFill = null;
        else cellFill = this.defaultFillColor.substring(1);
               
        //estraggo lo spessore del bordo cella
        if (cellBorders == undefined || cellBorders == null || cellBorders[j] == null || cellBorders [j] == undefined || cellBorders [j] == 0) cellLineWidth = 0;
        else cellLineWidth = this.defaultLineWidth;

        //estraggo i rowSpans
        if (rowsMerge == undefined || rowsMerge == null || rowsMerge[j] == null || rowsMerge[j] == undefined || rowsMerge[j] ==0 || i != 0) rowSpan = 1;
        else rowSpan = body.length;

        if ((i==0) || (i!=0 && rowsMerge == undefined) || (i!=0 && rowsMerge[j] == 0))
          bodyObj[i].push({ content: body[i][j], colSpan: 1, rowSpan: rowSpan, styles:{font: fontName, lineWidth: cellLineWidth, fillColor: cellFill, lineColor: cellLineColor} })
      }
    }
    // console.log ("headObj", headObj);

    autoTable(docPDF, {
      //startY: Y,
      margin: {top: Y, right: 0, bottom: 0, left: X},
      tableWidth: W,
      //tableLineColor: lineColor,
      //tableLineWidth: lineWidth,  //Attenzione: attivando questa cambia il bordo ESTERNO della tabella
      head: headObj, //Header eventualmente di più linee
      body: bodyObj,

      // **************** ALTRI MODI DI PASSARE I DATI *****************
      // body: [[
      //     { content: "ciao", styles: { halign: 'center', cellWidth: 10 }}, 
      //     { content: "ciao2", rowSpan: 2, styles: { halign: 'center', lineWidth: {top: 10, right: 1, bottom: 5, left: 2} , cellWidth: 200} },
      //     { content: "ciao2", rowSpan: 2, styles: { halign: 'center', lineWidth: 1 , cellWidth: 50} }], 
      //       [{ content: 'nuova riga', styles: { halign: 'center', cellWidth: 10 } }]],

      // body: [
      //   [
      //     {content: data[0][0]},
      //     {content: data[0][1]},
      //     {content: data[0][2]},
      //     {content: data[1][0]},
      //     {content: data[1][1]},
      //     {content: data[1][2]}
      //   ]
      // ],
      
      styles: {      
              //cellWidth: W/ data[0].length,
              halign: align,
              valign: 'middle',
              fillColor: fillColor,
              minCellHeight: H,
      },
      columnStyles: columnStylesObj,
      headStyles: {
        lineWidth: 0.1,
      },
      // didDrawCell: (data) => {
      //   if (data.section === 'head') {
      //     docPDF.text("ciao",10,10);
      //   }
      // },
      willDrawCell: (data) => {

        let cellContent = '';
        for (let i = 0; i < data.cell.text.length; i++) 
          cellContent = cellContent + data.cell.text[i];

        if (data.section === 'body' && cellContent.substring(0,3)== "R90" ) {
          docPDF.setFontSize(16);
          docPDF.text(cellContent.substring(3), data.cell.x + data.cell.width /2 + 2 , data.cell.y + data.cell.height - 5, {angle:90});
          for (let k = 0; k < data.cell.text.length; k++) 
            data.cell.text[k] = '';
         }
      } 
    })
  }
//#endregion

//#region ----- addTableDinamica -------

  private async addTableDinamica(
                docPDF: jsPDF,
                head:any,
                headEmptyRow: number,
                body: any,
                colWidths: any,
                cellBorders: any,
                rowsMerge: any,  
                colFills: any,
                fontName: string,
                X: number,
                Y: number,
                W: number,
                H: number,
                fontStyle: string ,
                fontColor:string,
                fontSize: number,
                lineColor: string,
                cellLineColor: string,
                fillColor: string,
                lineWidth: number,
                align: any,
                colSpans: any) {

    if(fontName == null || fontName == "")            fontName = this.defaultFontName;
    if(fontColor == null || fontColor == "")          fontColor = this.defaultColor;
    if(fontSize == null || fontSize == 0)             fontSize = this.defaultFontSize;
    if(lineColor == null || lineColor == "")          lineColor = this.defaultLineColor;
    if(cellLineColor == null || cellLineColor == "")  cellLineColor = this.defaultCellLineColor;
    if(fillColor == null || fillColor == "")          fillColor = this.defaultFillColor;
    if(lineWidth == null || lineWidth == 0)           lineWidth = this.defaultLineWidth;

    docPDF.setTextColor(fontColor);
    docPDF.setDrawColor(lineColor);
    docPDF.setFontSize(fontSize);

    let columnStylesObj= <any>{};
    W = 0;
    for (let i = 0; i < colWidths.length; i++) {
      columnStylesObj[i] = {}
      columnStylesObj[i]["cellWidth"] = colWidths[i];
      W = W + colWidths[i];
    }

    let headObj: { content: any, styles:any  }[][] = [];
    //let bodyObjD: { content: any } [][] = []///in questo modo suggerisce https://stackoverflow.com/questions/73258283/populate-an-array-of-array-of-objects    //let dataObj= <any>[[{}]]; //così pensavo io...ma non funzionava
    let bodyObj: { content: any, colSpan: any, rowSpan: any, styles:any  }[][] = []; ///in questo modo suggerisce https://stackoverflow.com/questions/73258283/populate-an-array-of-array-of-objects

    let cellLineWidth : number; 
    let cellFill: any;
    let colSpan: any;
    let rowSpan: any;
    let i: number; //serve definirlo fuori dal ciclo for perchè poi serve tenere l'ultimo valore

    //****************   HEADER
    for (i = 0; i < head.length; i++) {
      headObj.push([]);  //va prima inserito un array vuoto altrimenti risponde con un Uncaught in promise
      for (let j = 0; j < head[i].length; j++) {        
        headObj[i].push({ content: head[i][j], styles: {font: fontName, lineColor: cellLineColor} })
      }
    }

    //aggiunta riga vuota dopo l'header
    if (headEmptyRow ==1) {
      headObj.push([]);
      for (let j = 0; j < head[0].length; j++) 
        headObj[i].push({ content: "", styles: {lineWidth: 0, fillColor: false, minCellHeight: 1, cellPadding: 0} })        
    }
    //****************   FINE HEADER

    //qui arriva un generico array di una riga da trasformare in un array di n record
    let content : string;

    //for (let i = 0; i < this.PagellaVoti.length; i++) {

    let objIndex = -1;

    //console.log ("jspdf.service.ts - addTableDinamica - PagellaVoti", this.PagellaVoti)
    this.PagellaVoti.forEach ((Pagella:DOC_PagellaVoto, i: number) =>{

      if (body.join().indexOf("[el]")>0 ) { //se ci trova scritto [el] capisce di dover entrare dentro gli obiettivi e fare una riga per ogni obiettivo  
        Pagella!._ObiettiviCompleti!.forEach((element, el: number) => {
          bodyObj.push([]);  
          objIndex++;
          for (let j = 0; j < body[0].length; j++) {
            //estraggo il riempimento
            if (colFills == undefined || colFills == null || colFills[j] == null || colFills[j] == undefined || colFills[j] == 0) cellFill = null;
            else cellFill = this.defaultFillColor.substring(1);

            //estraggo lo spessore del bordo cella
            if (cellBorders == undefined || cellBorders == null || cellBorders[j] == null || cellBorders [j] == undefined || cellBorders [j] == 0) cellLineWidth = 0;
            else cellLineWidth = this.defaultLineWidth;

            //estraggo i rowSpans
            if (rowsMerge == undefined || rowsMerge == null || rowsMerge[j] == null || rowsMerge[j] == undefined || rowsMerge[j] ==0 || i != 0) rowSpan = 1;
            else rowSpan = this.PagellaVoti.length;

            try {
              if (eval(body[0][j]) == null) 
                content = "";
              else 
                content = eval(body[0][j]);
            }
            catch {
              content = "";
            }

            if ((i==0) || (i!=0 && rowsMerge == undefined) || (i!=0 && rowsMerge[j] == 0))
              bodyObj[objIndex].push({ content: content, colSpan: 1, rowSpan: rowSpan, styles: {font: fontName, lineWidth: cellLineWidth, fillColor: cellFill, lineColor: cellLineColor} })
          }
        })
      } 
      else {

        bodyObj.push([]);
        objIndex++;
        for (let j = 0; j < body[0].length; j++) {

          //estraggo il riempimento
          if (colFills == undefined || colFills == null || colFills[j] == null || colFills[j] == undefined || colFills[j] == 0) cellFill = null;
          else cellFill = this.defaultFillColor.substring(1);

          //estraggo lo spessore del bordo cella
          if (cellBorders == undefined || cellBorders == null || cellBorders[j] == null || cellBorders [j] == undefined || cellBorders [j] == 0) cellLineWidth = 0;
          else cellLineWidth = this.defaultLineWidth;

          //estraggo i rowSpans
          if (rowsMerge == undefined || rowsMerge == null || rowsMerge[j] == null || rowsMerge[j] == undefined || rowsMerge[j] ==0 || i != 0) rowSpan = 1;
          else rowSpan = this.PagellaVoti.length;

          //console.log ("body[k][j]", body[0][j]);
          try {

            if (eval(body[0][j]) == null) 
              content = "";
            else 
              content = eval(body[0][j]);
          }
          catch {
            content = "";
          }

          if ((i==0) || (i!=0 && rowsMerge == undefined) || (i!=0 && rowsMerge[j] == 0)){
            //bodyObj[i].push({ content: content, colSpan: 1, rowSpan: rowSpan, styles: {font: fontName, lineWidth: cellLineWidth, fillColor: cellFill, lineColor: cellLineColor} })
            bodyObj[objIndex].push({ content: content, colSpan: 1, rowSpan: rowSpan, styles: {font: fontName, lineWidth: cellLineWidth, fillColor: cellFill, lineColor: cellLineColor} })
          }
        }
      }
      //console.log ("bodyObj", bodyObj);
    })

    //console.log ("bodyObj", bodyObj);
    autoTable(docPDF, {
      //startY: Y,
      margin: {top: Y, right: 0, bottom: 0, left: X},
      tableWidth: W,
      //tableLineColor: lineColor,
      //tableLineWidth: lineWidth,  //Attenzione: attivando questa cambia il bordo ESTERNO della tabella
      head: headObj, //Header eventualmente di più linee
      body: bodyObj,
      styles: {      
              //cellWidth: W/ data[0].length,
              halign: align,
              valign: 'middle',
              fillColor: fillColor,
              minCellHeight: H,
      },
      columnStyles: columnStylesObj,
      headStyles: {
        lineWidth: 0.1,
      },
    })
  }
//#endregion

//#region ----- addTableDinamicaPagella -------
  private async addTableDinamicaPagella(
                  docPDF: jsPDF,
                  rptPagella: any)
    {
    if(rptPagella.fontName == null || rptPagella.fontName == "")            rptPagella.fontName = this.defaultFontName;
    if(rptPagella.fontColor == null || rptPagella.fontColor == "")          rptPagella.fontColor = this.defaultColor;
    if(rptPagella.fontSize == null || rptPagella.fontSize == 0)             rptPagella.fontSize = this.defaultFontSize;
    if(rptPagella.lineColor == null || rptPagella.lineColor == "")          rptPagella.lineColor = this.defaultLineColor;
    if(rptPagella.cellLineColor == null || rptPagella.cellLineColor == "")  rptPagella.cellLineColor = this.defaultCellLineColor;
    if(rptPagella.fillColor == null || rptPagella.fillColor == "")          rptPagella.fillColor = this.defaultFillColor;
    if(rptPagella.lineWidth == null || rptPagella.lineWidth == 0)           rptPagella.lineWidth = this.defaultLineWidth;

    docPDF.setTextColor(rptPagella.fontColor);
    docPDF.setDrawColor(rptPagella.lineColor);
    docPDF.setFontSize(rptPagella.fontSize);

    let cellLineWidth : number; 
    let cellFill: any;

    let i: number; //serve definirlo fuori dal ciclo for perchè poi serve tenere l'ultimo valore

    let headObj: { content: any, styles:any  }[][] = [];
    let bodyObj: { content: any, colSpan: any, rowSpan: any, styles:any  }[][] = [];

    let columnStylesObj= <any>{};
    let W = 0;
    for (let i = 0; i < rptPagella.colWidths.length; i++) {
      columnStylesObj[i] = {}
      columnStylesObj[i]["cellWidth"] = rptPagella.colWidths[i];
      W = W + rptPagella.colWidths[i];
    }

    // HEADER
    for (i = 0; i < rptPagella.head.length; i++) {
      headObj.push([]);  //va prima inserito un array vuoto altrimenti risponde con un Uncaught in promise
      for (let j = 0; j < rptPagella.head[i].length; j++) {        
        headObj[i].push({ content: rptPagella.head[i][j], styles: {font: rptPagella.fontName, lineColor: rptPagella.cellLineColor} })
      }
    }
    //aggiunta riga vuota dopo l'header
    if (rptPagella.headEmptyRow ==1) {
      headObj.push([]);
      for (let j = 0; j < rptPagella.head[0].length; j++) {
        headObj[i].push({ content: "", styles: {lineWidth: 0, fillColor: false, minCellHeight: 1, cellPadding: 0} })        
      }
    }
    // FINE HEADER   

    this.objIndex = -1;
    let PagellaVoto : any;
    for (let i = 0; i < this.PagellaVoti.length; i++) { //per ragioni di sincronia meglio usare sempre un ciclo for
    //this.PagellaVoti.forEach ((PagellaVoto:DOC_PagellaVoto, i: number) =>{
      PagellaVoto = this.PagellaVoti[i];
      //IN BASE A PagellaVoto.tipoVotoID:
      //SE tipoVotoID == 3 -> obiettivi   serve come template quello a tre record per ciascun Voto con il merge sulla sinistra: è necessario ciclare sugli obiettivi completi del voto
      //SE tipoVotoID == 2 -> Giudizi     serve come template quello con un solo record per ciascun Voto: non serve ciclare sugli obiettivi completi del voto
      //SE TipoVotoID == 1 -> Voti        serve come template quello con un solo record per ciascun Voto: non serve ciclare sugli obiettivi completi del voto
      let tipoVotoID = PagellaVoto.tipoVotoID;
      switch (tipoVotoID) {
        case 3:
          bodyObj = this.stampaRigaObiettivo  (bodyObj, rptPagella, PagellaVoto, i);  //la stampaRigaObiettivo restituisce un bodyObj più "ricco" di n record (di norma tre)
          break;
        case 2:
          bodyObj = this.stampaRigaGiudizio    (bodyObj, rptPagella, PagellaVoto, i);                                                                          //la stampaRigaGiudizio aggiunge a bodyObj un solo record
          break;
        case 1:
          bodyObj = this.stampaRigaVoto       (bodyObj, rptPagella, PagellaVoto, i);                          //la stampaRigaVoto aggiunge a bodyObj un solo record
          break;
        default:
      }
      // console.log (this.objIndex, bodyObj);

      //inserisco una riga vuota dopo il voto/giudizio o dopo la serie di livelli di apprendimento
       bodyObj.push([]);
       this.objIndex++;
       bodyObj[this.objIndex].push({ content: "", colSpan: rptPagella.body[0].length, rowSpan: 1, styles: {font: rptPagella.fontName, fontSize: 5, lineWidth: 0, fillColor: false, minCellHeight: 0, cellPadding: 0}});
       docPDF.setFontSize(rptPagella.fontSize);

    }


    //console.log ("bodyObj", bodyObj);
    autoTable(docPDF, {
      //startY: Y,
      margin: {top: rptPagella.Y, right: 0, bottom: 0, left: rptPagella.X},
      tableWidth: W,
      //tableLineColor: lineColor,
      //tableLineWidth: lineWidth,  //Attenzione: attivando questa cambia il bordo ESTERNO della tabella
      head: headObj, //Header eventualmente di più linee
      body: bodyObj,

      
      styles: {      
              //cellWidth: W/ data[0].length,
              halign: rptPagella.align,
              valign: 'middle',
              fillColor: rptPagella.fillColor,
              minCellHeight: rptPagella.H,
      },
      columnStyles: rptPagella.columnStylesObj,
      headStyles: {
        lineWidth: 0.1,
      },
    })
  }

//#endregion

//#region ----- stampaRigaVoto -------

  private stampaRigaVoto (bodyObj: any, rptPagella: any, PagellaVoto: any , i: number): any {
    let content: any;
    //console.log ("stampaRigaVoto : rptPagella", rptPagella);

    bodyObj.push([]);
    this.objIndex++;
    for (let j = 0; j < rptPagella.body[0].length; j++) {

      //estraggo il riempimento
      if (rptPagella.colFills == undefined || rptPagella.colFills == null || rptPagella.colFills[j] == null || rptPagella.colFills[j] == undefined || rptPagella.colFills[j] == 0) rptPagella.cellFill = null;
      else rptPagella.cellFill = this.defaultFillColor.substring(1);

      //estraggo lo spessore del bordo cella
      if (rptPagella.cellBorders == undefined || rptPagella.cellBorders == null || rptPagella.cellBorders[j] == null || rptPagella.cellBorders [j] == undefined || rptPagella.cellBorders [j] == 0) rptPagella.cellLineWidth = 0;
      else rptPagella.cellLineWidth = this.defaultLineWidth;

      //estraggo i rowSpans
      if (rptPagella.rowsMerge[0] == undefined || rptPagella.rowsMerge[0] == null || rptPagella.rowsMerge[0][j] == null || rptPagella.rowsMerge[0][j] == undefined || rptPagella.rowsMerge[0][j] ==0 || i != 0) rptPagella.rowSpan = 1;
      else rptPagella.rowSpan = this.PagellaVoti.length;

      // //estraggo i colSpans
      if (rptPagella.colSpans[0] == undefined || rptPagella.colSpans[0] == null || rptPagella.colSpans[0][j] == null || rptPagella.colSpans[0][j] == undefined || rptPagella.colSpans[0][j] ==0) rptPagella.colSpan = 1;
      else rptPagella.colSpan = rptPagella.colSpans[0][j];

      try {
        if (eval(rptPagella.body[0][j]) == null) {
          content = "";
        } else {
          content = eval(rptPagella.body[0][j]);
        }
      }
      catch {
        content = "";
      }

      if ((i==0) || (i!=0 && rptPagella.rowsMerge == undefined) || (i!=0 && rptPagella.rowSpan == 1)){
        bodyObj[this.objIndex].push({ content: content, colSpan: rptPagella.colSpan, rowSpan: rptPagella.rowSpan, styles: {font: rptPagella.fontName, lineWidth: rptPagella.cellLineWidth, fillColor: rptPagella.cellFill, lineColor: rptPagella.cellLineColor, cellPadding: 0} })
      }
    }
    return bodyObj;

  }
//#endregion

//#region ----- stampaRigaGiudizio -------

  private stampaRigaGiudizio (bodyObj: any, rptPagella: any, PagellaVoto: any , i: number): any {
    let content: any;
    //console.log ("stampaRigaGiudizio : rptPagella", rptPagella);

    bodyObj.push([]);
    this.objIndex++;
    for (let j = 0; j < rptPagella.body[1].length; j++) {

      //estraggo il riempimento
      if (rptPagella.colFills == undefined || rptPagella.colFills == null || rptPagella.colFills[j] == null || rptPagella.colFills[j] == undefined || rptPagella.colFills[j] == 0) rptPagella.cellFill = null;
      else rptPagella.cellFill = this.defaultFillColor.substring(1);

      //estraggo lo spessore del bordo cella
      if (rptPagella.cellBorders == undefined || rptPagella.cellBorders == null || rptPagella.cellBorders[j] == null || rptPagella.cellBorders [j] == undefined || rptPagella.cellBorders [j] == 0) rptPagella.cellLineWidth = 0;
      else rptPagella.cellLineWidth = this.defaultLineWidth;

      //estraggo i rowSpans
      if (rptPagella.rowsMerge[0] == undefined || rptPagella.rowsMerge[1] == null || rptPagella.rowsMerge[1][j] == null || rptPagella.rowsMerge[1][j] == undefined || rptPagella.rowsMerge[1][j] ==0 || i != 0) rptPagella.rowSpan = 1;
      else rptPagella.rowSpan = this.PagellaVoti.length;

      // //estraggo i colSpans
      if (rptPagella.colSpans[1] == undefined || rptPagella.colSpans[1] == null || rptPagella.colSpans[1][j] == null || rptPagella.colSpans[1][j] == undefined || rptPagella.colSpans[1][j] ==0) rptPagella.colSpan = 1;
      else rptPagella.colSpan = rptPagella.colSpans[1][j];

      try {
        if (eval(rptPagella.body[1][j]) == null) {
          content = "";
        } else {
          content = eval(rptPagella.body[1][j]);
        }
      }
      catch {
        content = "";
      }

      if ((i==0) || (i!=0 && rptPagella.rowsMerge == undefined) || (i!=0 && rptPagella.rowSpan == 1)){
        bodyObj[this.objIndex].push({ content: content, colSpan: rptPagella.colSpan, rowSpan: rptPagella.rowSpan, styles: {font: rptPagella.fontName, lineWidth: rptPagella.cellLineWidth, fillColor: rptPagella.cellFill, lineColor: rptPagella.cellLineColor, cellPadding: 0} })
      }
    }
    return bodyObj;

  }
//#endregion

//#region ----- stampaRigaObiettivo -------
  
  private stampaRigaObiettivo (bodyObj: any, rptPagella: any, PagellaVoto: any , i: number): any {
    let content: any;
    //console.log ("stampaRigaObiettivo : rptPagella", rptPagella);

    for (let el = 0; el < PagellaVoto._ObiettiviCompleti.length; el++) { //per ragioni di sincronia meglio usare sempre un ciclo for

    //obiettiviCompleti.forEach((element: any, el: number) => {
      bodyObj.push([]);  
      this.objIndex++;
      for (let j = 0; j < rptPagella.body[2].length; j++) {
        //estraggo il riempimento
        if (rptPagella.colFills == undefined || rptPagella.colFills == null || rptPagella.colFills[j] == null || rptPagella.colFills[j] == undefined || rptPagella.colFills[j] == 0) rptPagella.cellFill = null;
        else rptPagella.cellFill = this.defaultFillColor.substring(1);

        //estraggo lo spessore del bordo cella
        if (rptPagella.cellBorders == undefined || rptPagella.cellBorders == null || rptPagella.cellBorders[j] == null || rptPagella.cellBorders [j] == undefined || rptPagella.cellBorders [j] == 0) rptPagella.cellLineWidth = 0;
        else rptPagella.cellLineWidth = this.defaultLineWidth;

        //estraggo i rowSpans
        if (rptPagella.rowsMerge[2] == undefined || rptPagella.rowsMerge[2] == null || rptPagella.rowsMerge[2][j] == null || rptPagella.rowsMerge[2][j] == undefined || rptPagella.rowsMerge[2][j] ==0) rptPagella.rowSpan = 1;
        else rptPagella.rowSpan = PagellaVoto._ObiettiviCompleti.length;
   
        //estraggo i colSpans
        if (rptPagella.colSpans[2] == undefined || rptPagella.colSpans[2] == null || rptPagella.colSpans[2][j] == null || rptPagella.colSpans[2][j] == undefined || rptPagella.colSpans[2][j] ==0) rptPagella.colSpan = 1;
        else rptPagella.colSpan = rptPagella.colSpans[2][j];



        try {

          if (eval(rptPagella.body[2][j]) == null) {
            content = "";
          } else {
            content = eval(rptPagella.body[2][j]);
          }
        }
        catch {
          content = "";
        }


        if ((el==0) || (el!=0 && rptPagella.rowsMerge == undefined) || (el!=0 && rptPagella.rowSpan == 1)){
          bodyObj[this.objIndex].push({ content: content, colSpan: rptPagella.colSpan, rowSpan: rptPagella.rowSpan, styles: {font: rptPagella.fontName, lineWidth: rptPagella.cellLineWidth, fillColor: rptPagella.cellFill, lineColor: rptPagella.cellLineColor, cellPadding: 0} })
        }  

      }
    }
    return bodyObj;

  }
//#endregion

//#region ----- addText addImage addRect addLine -----
  
  private async addText(docPDF: jsPDF, text: string, X: number, Y: number, fontName: string, fontStyle: string , fontColor:string, fontSize: number, align: any, maxWidth: number  ){
    if(fontName == null || fontName == "") fontName = this.defaultFontName;
    if(fontColor == null || fontColor == "") fontColor = this.defaultColor;
    if(fontSize == null || fontSize == 0) fontSize = this.defaultFontSize;
    if(maxWidth == null || maxWidth == 0) maxWidth = this.defaultMaxWidth;

    docPDF.setFont(fontName, fontStyle);
    docPDF.setTextColor(fontColor);
    docPDF.setFontSize(fontSize);
    //var splitTitle = docPDF.splitTextToSize(text, 190); //in questo modo NON esco dalla pagina!!! va a capo quando deve!!! splitTitle è un array passabile a .text
    docPDF.text(text, X, Y, { align: align, maxWidth: maxWidth}); //altro metodo: maxWidth SPEZZA in n righe. Esiste anche lineHeightFactor che definisce l'altezza della riga.
    //docPDF.text(text, X, Y, { align: align });

    //Restituisce l'altezza del testo
    //docPDF.getTextDimensions(text);
    //var dim = docPDF.getTextDimensions(text);
    //console.log("dimensioni testo: ", dim);
  }  

  private async addImage(docPDF: jsPDF, ImageUrl: string, x: string, y: string,w: string ) {
    // console.log ("addImage");
    let imgWidth = 0;
    let imgHeight = 0;

    //creo l'oggetto img che passerò a docPDF.addImage corredandolo dei parametri di w e h corretti
    let img = new Image();
    img.src = ImageUrl;

    //costruisco la mia funzione promise custom (genero l'asincronia necessaria)
    //serve per creare un'altra Img (imgTmp) ed estrarne le dimensioni
    const loadImage = (src: string) => new Promise((resolve, reject) => {
      
      
      
      const imgTmp = new Image();
      imgTmp.src = src;
      imgTmp.onload = () =>{          
        imgWidth = imgTmp.width;
        imgHeight = imgTmp.height;
        //resolve(imgTmp);
        resolve ("hey");           //importante, senza questo non funzia
      }
      //imgTmp.onerror = reject;
    });

    await loadImage(ImageUrl);
    // console.log ("img", img);
    docPDF.addImage(img, 'png', parseFloat(x), parseFloat(y), parseFloat(w), parseFloat(w)*(imgHeight/imgWidth), undefined,'FAST');
  }

  private async addLine(docPDF: jsPDF, X1: string, Y1: string, X2: string, Y2: string, lineColor:string, lineWidth: string  ){
    if(lineColor == null || lineColor == "") lineColor = this.defaultColor;

    docPDF.setDrawColor(lineColor);
    docPDF.setLineWidth (parseFloat( lineWidth));

    docPDF.line(parseFloat(X1),parseFloat(Y1),parseFloat(X2),parseFloat(Y2));
  }

  private async addRect(docPDF: jsPDF, X1: number, Y1: number, W: number, H: number, lineColor:string, lineWidth: number, borderRadius: number  ){

    if(lineColor == null || lineColor == '') lineColor = this.defaultLineColor;

    docPDF.setDrawColor(lineColor);
    docPDF.setLineWidth (lineWidth);
    let rx: number=0;
    if(borderRadius != null && borderRadius> 0){
      rx=borderRadius;
      docPDF.roundedRect(X1,Y1,W,H, rx, rx );
    }
    else
      docPDF.rect(X1,Y1,W,H );
  }

//#endregion



//#region ----- Funzioni di appoggio -----

  private parseTextValue ( text: string) : string {

    let retString = "";
    let outArr: any = [];

    if(text.indexOf("%>") <= 0)
      retString = text;
    else {

      let textArr = text.split("%>");

      textArr.forEach((txt,index) => {
          let tmpArr = txt.split("<%");

          outArr.push(tmpArr[0]);
          if(tmpArr[1] != undefined){
            
            //objPagella deve diventare -->  this.Pagella 
            let fieldRef = tmpArr[1].replace("obj", "this.");
            
            if(fieldRef.toLocaleLowerCase().startsWith("formatdate")) 
              fieldRef = "this." + fieldRef; 

            if(fieldRef.toLocaleLowerCase().startsWith("formatnumber")) 
              fieldRef = "this." + fieldRef; 

            outArr.push(eval(fieldRef));
          }
        }
      );
      retString = outArr.join('');
    }
    return retString;
  }

  public FormatDate ( data: any, formato: string): string {
    let retDate= data;
    switch (formato) {
      case "yyyy-mm-dd":
        let dtISOLocaleStart = data.toLocaleString('sv').replace(' ', 'T');
        retDate = dtISOLocaleStart.substring(0,10);
        break;
      case "dd/mm/yyyy":
        var year = data.substring(0,4);
        var month = data.substring(5,7);
        let day = data.substring(8,10);
        retDate = day + '/' + month + '/' + year;
        break;
    }
    return retDate;
  }

  public FormatNumber ( data: any, n_dec: number): string {
    return Number(data).toFixed(n_dec);
  }



//#endregion

}





//#region ----- DA BUTTARE -----


 
/*

 //costruisce il report STANDARD
  public creaPdf (rptData :any, rptColumnsNameArr: any, rptFieldsToKeep: any, rptTitle: string): jsPDF  {
    let doc = this.buildReportPdf (rptData, rptColumnsNameArr, rptFieldsToKeep, rptTitle);
    return doc;
  }

propertiesToArray(obj: any) {
  //let keyNames = Object.keys(Object); //estrae solo i nomi delle prorietà di primo livello
  //questa routine estrae invece tutte le proprietà e sottoproprietà di un oggetto nella forma alunno.nome
  const isObject = (val: any) =>
    val && typeof val === 'object' && !Array.isArray(val);

  const addDelimiter = (a: any, b: any) =>
    a ? `${a}.${b}` : b;

  const paths: any = (obj = {}, head = '') => {
    return Object.entries(obj)
      .reduce((product, [key, value]) => 
        {
          let fullPath = addDelimiter(head, key)
          return isObject(value) ?
            product.concat(paths(value, fullPath))
          : product.concat(fullPath)
        }, []);
  }
  return paths(obj);
}

flatDeep(arr: any, d = 1) {
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
  //questa funzione schiaccia un array (non un object, attenzione)
  return d > 0 ? arr.reduce((acc: any, val: any) => acc.concat(Array.isArray(val) ? this.flatDeep(val, d - 1) : val), [])
                : arr.slice();
};


  public async creaPagellaPdf (objPagella: DOC_Pagella): Promise<jsPDF> {

    return this.dynamicRptPagella(objPagella);


    //Setup variabili
    
    let h_page = doc.internal.pageSize.getHeight();     //altezza pagina
    let w_page = doc.internal.pageSize.getWidth();      //larghezza pagina (ATTENZIONE: doppia!)
    let w_page1 = w_page/2;                             //larghezza pagina mezza

    let center_pos1 = w_page1/2;                   //center_pos1 = centro pagina sx
    let center_pos2 = w_page1/2*3;                 //center_pos2 = centro pagina dx

    let row_height = h_page / 45;
    let margins = 10;
    let currY=0;

    let fontName= 'TitilliumWeb-Regular';
    let fontNameBold= 'TitilliumWeb-SemiBold';
    let fontStyle= 'normal';
    let fontColor= "#C04F94";
    let fontSize= 12;
    let drawColor= "#C04F94";
    
    //doc.setFont('TitilliumWeb-SemiBold', 'normal');
    doc.setTextColor(fontColor);
    doc.setDrawColor(fontColor);

    //Bordi e sfondi
    doc.roundedRect(margins, margins, w_page1 - margins*2, h_page - margins*2, 3, 3, "S");
    doc.roundedRect(w_page1+margins, margins, w_page1 - margins*2, h_page - margins*2, 3, 3, "S");

    const ImageUrl = "../../assets/photos/logodefViola.png";
    //await  this.addImage(doc,ImageUrl, 60,50,90);

    currY = 139;
    this.addText(doc,"Anno Scolastico " +objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico,center_pos2,currY,fontName,fontStyle,fontColor,20  );
    currY = currY +row_height;

    this.addText(doc,"Documento di Valutazione",center_pos2,currY,fontNameBold,fontStyle,fontColor,20  );
    currY = currY +row_height;
    
    this.addText(doc,"Anno Scolastico " +objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico,center_pos2,currY,fontName,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;
    
    this.addText(doc,"Alunno" ,center_pos2,currY,fontName,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    this.addText(doc,objPagella.iscrizione!.alunno.nome+" "+objPagella.iscrizione!.alunno.cognome,center_pos2,currY,fontNameBold,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    this.addText(doc,"C.F. " +objPagella.iscrizione?.alunno.cf,center_pos2,currY,fontName,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    this.addText(doc,"Nato a " +objPagella.iscrizione?.alunno.comuneNascita+" ("+objPagella.iscrizione?.alunno.provNascita+") il "+Utility.UT_FormatDate2(objPagella.iscrizione?.alunno.dtNascita),center_pos2,currY,fontName,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    this.addText(doc,"Classe " + objPagella.iscrizione!.classeSezioneAnno.classeSezione.classe.descrizione2+ " Sez."+objPagella.iscrizione!.classeSezioneAnno.classeSezione.sezione,center_pos2,currY,fontNameBold,fontStyle,fontColor,fontSize  );
    currY = currY +row_height;

    // doc.setFont('TitilliumWeb-Regular', 'normal');
    // doc.text("Anno Scolastico "+objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico, center_pos2, row_height*21, { align: 'center' });
    
    // doc.text("Alunno", center_pos2, row_height*24, { align: 'center' });
    //doc.setFont('TitilliumWeb-SemiBold', 'normal');
    //doc.text(objPagella.iscrizione!.alunno.nome+" "+objPagella.iscrizione!.alunno.cognome, center_pos2, row_height*26, { align: 'center' });

    // doc.setFont('TitilliumWeb-Regular', 'normal');
    // doc.text("C.F."+objPagella.iscrizione?.alunno.cf, center_pos2, row_height*27, { align: 'center' });
    // doc.text("Nato a "+objPagella.iscrizione?.alunno.comuneNascita+" ("+objPagella.iscrizione?.alunno.provNascita+") il "+Utility.UT_FormatDate2(objPagella.iscrizione?.alunno.dtNascita), center_pos2, row_height*28, { align: 'center' });

    //doc.setFont('TitilliumWeb-SemiBold', 'normal');
    //doc.text("Classe "+objPagella.iscrizione!.classeSezioneAnno.classeSezione.classe.descrizione2+ " Sez."+objPagella.iscrizione!.classeSezioneAnno.classeSezione.sezione, center_pos2, row_height*29, { align: 'center' });

    doc.addPage();
    return doc;
  }
  */
  /*


Metodo interessante: c'è la possibilità di sapere quanto largo viene il testo e quindi fare degli offset
  var centeredText = function(text, y) {
    var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.text(textOffset, y, text);
}


  */





//NICOLA

// function loadAsset (url: string, type: any, callback: any) {
//   let xhr= new XMLHttpRequest();
//   xhr.open('GET', url);
//   xhr.responseType = type;

//   xhr.onload = function () {
//     callback(xhr.response);
//   }

//   xhr.send;
// }

// function displayImage(blob: any) {
//   let objectURL = URL.createObjectURL(blob)
//   let image = document.createElement('img');
//   image.src = objectURL;
//   document.body.appendChild(image);

// }
// loadAsset("URLdell'immagine", 'blob', displayImage);


// fetch ("URL dell'immagine")
// .then (response=> {
//   if (!response.ok) {
//     throw new Error("error:"+ response.status)
//   } else {
//     return response.blob();
//   }
// }).then (myBlob => {
//   let objectURL = URL.createObjectURL(myBlob);
//   let image = document. createElement('img');
//   image.src = objectURL;
//   document. body.appendChild(image);
// }).catch(e => {
//   console.log ('Fetch problem'+ e.message);
// })

// let timeoutpromise = new Promise((resolve, reject) => {

//     resolve('success');

// });


//#endregion