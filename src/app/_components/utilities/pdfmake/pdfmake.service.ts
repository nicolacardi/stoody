import { Injectable } from '@angular/core';

// In alternativa a 
// import * as pdfMake from "pdfmake/build/pdfmake";
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require("pdfmake/build/vfs_fonts.js");

//console.log("XXX pdfFonts.pdfMake.vfs:", pdfFonts.pdfMake.vfs); //MA PERCHE' CAZZO BUTTA FUORI ROBOTO CHE NON C'E' IN VFS_FONTS?????????
pdfMake.vfs = pdfFonts.pdfMake.vfs; //del file pdfFonts pesco pdfMake.vfs


const htmlToPdfMake = require('html-to-pdfmake');

const f = 2.83464567;


@Injectable({
  providedIn: 'root'
})
export class PdfmakeService {
  // https://www.ngdevelop.tech/client-side-pdf-generation-in-angular-with-pdfmake/
  // https://stackoverflow.com/questions/50576746/import-pdfmake-js-file-to-my-ts-file/56535907#56535907
  constructor() {}


  
  generatePDF(rptFile: any) {

    // pdfMake.fonts = {
    //   TitilliumWeb: {
    //     normal: 'TitilliumWeb-Regular.ttf',
    //     bold: 'TitilliumWeb-Bold.ttf',
    //     italics: 'TitilliumWeb-Italic.ttf',
    //     bolditalics: 'TitilliumWeb-BoldItalic.ttf'
    //   }
    // };

    //console.log ("pdfMake Service - rptFile ricevuto da Template component dopo paginatorBuild", rptFile);

    //l'item di tipo SheetDefault contiene le impostazioni della pagina
    const sheetDefaultObj = rptFile.find((item:any) => item.tipo === "SheetDefault");
    const pageOrientation = sheetDefaultObj.pageOrientation;
    const pageWidth = sheetDefaultObj.width * f;
    const pageHeight = sheetDefaultObj.height * f;

    let content = [];

    for (let i = 0; i < rptFile.length; i++) {
      if (rptFile[i].tipo == "TextHtml"){
        let thick = rptFile[i].thicknBorders;   
        let typeBorders = rptFile[i].typeBorders;

        let obj = {
          absolutePosition: { x: rptFile[i].X*f, y: rptFile[i].Y*f },

          table: {
            widths: [rptFile[i].W*f -10],
            heights: [rptFile[i].H*f -10],
            body: [[{
              text: htmlToPdfMake(rptFile[i].value),
              fillColor: rptFile[i].backgroundColor,
              border: [rptFile[i].borderLeft, rptFile[i].borderTop, rptFile[i].borderRight, rptFile[i].borderBottom ],
              borderColor: [rptFile[i].colorBorders,rptFile[i].colorBorders,rptFile[i].colorBorders,rptFile[i].colorBorders],
              fontSize: rptFile[i].fontSize,
            }]]
          },
          layout: { 
            hLineWidth: function (i:any, node:any) { return (i === 0 || i === node.table.body.length) ? thick: 0;  },
            vLineWidth: function (i:any, node:any) { return (i === 0 || i === node.table.widths.length) ? thick: 0; },
            hLineStyle: function (i:any) { return (typeBorders == "dashed") ? {dash: {length: 10, space: 4}} : (typeBorders == "dotted")? {dash: {length: 2, space: 2}} : null; },
            vLineStyle: function (i:any) { return (typeBorders == "dashed") ? {dash: {length: 10, space: 4}} : (typeBorders == "dotted")? {dash: {length: 2, space: 2}} : null; },
            //imposto i 4 padding a 5 pt
            paddingTop: function(i:any, node:any) { return 5; },
            paddingBottom: function(i:any, node:any) { return 5; },
            paddingLeft: function(i:any, node:any) { return 5; },
            paddingRight: function(i:any, node:any) { return 5; },
          },

        };
        content.push(obj);
      }
      if (rptFile[i].tipo == "ImageBase64"){
        //estraggo le dimensioni del blocco e le dimensioni dell'immagine interna

        // console.log ("rptFile[i]", rptFile[i]);
        const X = rptFile[i].X*f;
        const Y = rptFile[i].Y*f;
        const W = rptFile[i].W*f;
        const H = rptFile[i].H*f;
        const imgW = rptFile[i].imgW*f;
        const imgH = rptFile[i].imgH*f;
        let obj : {
          absolutePosition: 
          { x: number, y: number },
          image: string,
          heigth : number,
          width : number
        }
        if (W/H > imgW/imgH) {
          //per le proporzioni comanda H
          obj = 
          {
            absolutePosition: { x: X+ W/2-imgW/imgH*H/2, y: Y },
            image: rptFile[i].value,
            width : H*imgW/imgH,
            heigth : H
          };
        } else {
          //per le proporzioni comanda W
          obj = 
          {
            absolutePosition: { x: X, y: Y+ H/2-imgH/imgW*W/2 },
            image: rptFile[i].value,
            width : W,
            heigth : W*imgH/imgW
          };
        }

        content.push(obj);
      }
    };


    let docDefinition = {
      pageOrientation: pageOrientation,
      pageSize: {width: pageWidth, height: pageHeight},
      content: content,
      // styles: {
      //   tableStyle: {
      //     font: 'TitilliumWeb'
      //   }
      // }
      // style: {
      //   cellStyle: {
      //     borderWidth: [10,0,0,1]
      //   }
      // }

      // defaultStyle: {
      //   font: 'TitilliumWeb'
      // }
    }
    //console.log ("docDefinition", docDefinition);
    pdfMake.createPdf(docDefinition).download();

  }


  
}
