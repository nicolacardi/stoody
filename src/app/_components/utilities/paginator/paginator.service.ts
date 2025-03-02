import { Injectable }                           from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginatorService {

  constructor() { }

  replacer(text: string, objFields:any): string{
    //va a creare un DOMParser e ci mette il text
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    //ora cerca tutti i tag che contengono  data-denotation-char= "@"
    const mentions = doc.querySelectorAll(`span[data-denotation-char="@"]`);
    
    //per ciascun tag identificato...
    mentions.forEach((mention) => {
      //estrae l'atribute data-value
      const fieldName = mention.getAttribute("data-value");
      //se esiste ed esiste objFields[fieldName]
      if (fieldName && objFields[fieldName]) {
        //sostituisce con il valore trovato!
        mention.textContent = objFields[fieldName];
      }
    });
    //ora estrae l'innerHTML così pulito
    return doc.body.innerHTML;
  }

  paginatorBuild(rptFile: any, blocco: any, objFields: any): any {
    //Paginator deve anche aggiungere il salto pagina
    //questo se riceve un blocco di tipo Page ma anche se in fase di paginazione (quindi in solo caso Tabella) si è raggiunta la fine della pagina
    //console.log ("PaginatorBuild - ricevuto blocco", blocco);
    
    if (blocco.tipoBlocco!.descrizione=="Page") {
      //console.log ("Page - salto pagina");
      rptFile.push({
        "tipo": "Page"
      });
    }

    if (blocco.tipoBlocco!.descrizione=="Text") {
      // console.log ("blocco._BloccoTesti![0].testo", blocco._BloccoTesti![0].testo);
      let cleanText = this.replacer(blocco._BloccoTesti![0].testo, objFields);
      rptFile.push({
        tipo: "TextHtml",
        alias: "...",
        value: cleanText,
        X: blocco.x,
        Y: blocco.y,
        W: blocco.w,
        H: blocco.h,
        borderTop: blocco.borderTop,
        borderRight: blocco.borderRight,
        borderBottom: blocco.borderBottom,
        borderLeft: blocco.borderLeft,
        backgroundColor: blocco.color,
        colorBorders: blocco.colorBorders,
        thicknBorders: blocco.thicknBorders,
        typeBorders: blocco.typeBorders,
        fontSize: blocco._BloccoTesti![0].fontSize
      });
    }

    if (blocco.tipoBlocco!.descrizione=="Image") {
      //console.log ("blocco._BloccoTesti![0].testo", blocco._BloccoTesti![0].testo);
      rptFile.push({
        "tipo": "ImageBase64",
        "alias": "...",
        "value": blocco._BloccoFoto![0].foto,
        "X": blocco.x,
        "Y": blocco.y,
        "W": blocco.w,
        "H": blocco.h,
        "imgW": blocco._BloccoFoto![0].w,
        "imgH": blocco._BloccoFoto![0].h,
        "backgroundColor": blocco.color,
        // "fontSize": blocchi[i]._BloccoTesti![0].fontSize
      });
    }


    if (blocco.tipoBlocco!.descrizione=="Table") {
      const limiteY = blocco.y+ blocco.h;  //rappresenta il valore massimo che può avere la y, se lo si supera si deve creare una nuova pagina
      //dovrò assicurarmi che i record arrivino ordinati prima per riga e poi per colonna!!!
      
      //estraggo il numero di righe e il numero di colonne: basta cercare il massimo valore che ha cella.row e il massimo valore che ha cella.col
      const maxRow = Math.max(...blocco._BloccoCelle.map((cella: any) => cella.row));
      const maxCol = Math.max(...blocco._BloccoCelle.map((cella: any) => cella.col));
      //costruisco ed inizializzo due array della dimensione del numero di colonne e righe che conterranno la larghezza e altezza cumulate
      let widthCum = new Array(maxCol).fill(0); // larghezza totale delle celle precedenti nella stessa colonna
      let heightCum = new Array(maxRow).fill(0); // altezza totale delle celle precedenti nella stessa riga
      
      //creo due array per tenere conto delle righe e colonne già visitate
      let colVisitate = new Array(maxCol).fill(false);
      let rowVisitate = new Array(maxRow).fill(false);

      //console.log ("paginator - paginatorBuild - blocco",blocco);
      let widthCumVal = 0;
      let heightCumVal = 0;

      //creo anzitutto le matrici con le altezze e larghezze delle celle a partire dalle due righe ricevute

      blocco._BloccoCelle.forEach((cella:any) => {

        //se mi imbatto per la prima volta in una colonna vado ad alimentare l'array delle larghezze e calcolo x di conseguenza
        if (!colVisitate[cella.col-1]) {
          colVisitate[cella.col-1] = true; 
          widthCumVal = widthCumVal + cella.w;
          widthCum [cella.col] = widthCumVal; //inserisco nella successiva colonna la x da cui dovrà partire
        }
        //se mi imbatto per la prima volta in una riga vado ad alimentare l'array delle altezze e calcolo y di conseguenza

        if (!rowVisitate[cella.row - 1]) {
          rowVisitate[cella.row-1] = true; 
          heightCumVal = heightCumVal + cella.h;
          heightCum [cella.row] = heightCumVal;
        }
      });
      //se ho due righe e tre colonne ad esempio con hriga =[16,19] e wcolonna = [52,38,62]
      //da qui esco con heightCum [0,16,35] e widthCum [0,52,90,152]. L'ultimo valore mi dice anche quanto alta e larga è la tabella in tutto

      //ora costruisco la riga dell'intestazione

      let intestazione = blocco._BloccoCelle.filter((cella:any) => cella.row === 1);

      let cleanText = '';


      intestazione.forEach((cella:any) => {
        let x  = widthCum [cella.col-1] + blocco.x ;
        let y  = heightCum [cella.row-1] + blocco.y;
        cleanText = this.replacer(cella.testo, objFields);
        let topush = {
          "tipo": "TextHtml",
          "alias": "...",
          "value": cleanText,
          "X": x,
          "Y": y,
          "W": cella.w,
          "H": cella.h,
          "backgroundColor": "#FFFFFF",
          "fontSize": 10
        }
        rptFile.push(topush); 
      });

      let rigaDaRipetere = blocco._BloccoCelle.filter((cella:any) => cella.row === 2);
      rigaDaRipetere.forEach((cella:any) => {
        let x  = widthCum [cella.col-1] + blocco.x ;
        let y  = heightCum [cella.row-1] + blocco.y;



        //estraggo il nome del campo (AlunniList_email)
        const parser = new DOMParser();
        const doc = parser.parseFromString(cella.testo, "text/html");
        const mentions = doc.querySelectorAll(`span[data-denotation-char="@"]`); //dovrei trovare un solo data-denotation-cahr = '@'
        let campo = '';
        mentions.forEach((mention) => {
          campo = mention.getAttribute("data-value")!;
        });
        //estraggo il nom della tabella (primi caratteri fino a _ compreso)
        const startIdx = campo.indexOf('@') + 1; // add 1 to exclude '@'
        const endIdx = campo.indexOf('_');
        const tabella = campo.substring(startIdx, endIdx);
        const tabella_ = tabella+"_";

        let datiAlunni = objFields[tabella];

        let nomeProprieta = campo.replace(tabella_, "");

        // console.log("nomeProprieta", nomeProprieta);
        // console.log("datiAlunni", datiAlunni);
        //ora entro nella singola cella che è da ripetere tante volte quanti i valori che vengono trovati per quel campo dentro objFields
        for (let j = 0; j < datiAlunni.length; j++) {

          // console.log ("cella.testo", cella.testo);
          //console.log("datiAlunni[j]", datiAlunni[j]);
          let cellaTestoNoTabella =  cella.testo.replace(tabella_, "");
          // console.log ("cella.testo dopo replace", cellaTestoNoTabella);

          cleanText = this.replacer(cellaTestoNoTabella, datiAlunni[j]);
          // console.log("cleanText", cleanText);
          
          //let cleanText = this.replacer(cella.testo, objFields);
          let topush = {
            "tipo": "TextHtml",
            "alias": "...",
            "value": cleanText,
            "X": x,
            "Y": y + j* cella.h,
            "W": cella.w,
            "H": cella.h,
            "backgroundColor": "#FFFFFF",
            "fontSize": 10
          }
          rptFile.push(topush); 
          console.log ("paginator - paginatorBuild - topush:", topush);
        }

        
       
      })
      
    }

    return rptFile
  }
}
