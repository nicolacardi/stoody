export const rptPagella: any = [
	
	//#########################     IMPOSTAZIONI     #########################
	{
		"tipo": "SheetDefault",
		"width": 420,
		"heigth": 297,
		"defaultFontName": "TitilliumWeb-Regular",
		"defaultColor":"#C04F94",
		"defaultFontSize":20,
		"defaultMaxWidth": 190,
		"defaultLineColor": "#000000",
		"defaultCellLineColor": "000000",
		"defaultFillColor": "#CCCCCC",
		"defaultLineWidth": 0.1,
	},
	
	//#########################     COPERTINA     #########################
	{
		"tipo": "Image",
		"value": "logodefViola.png",
		"X": 275,
		"Y": 30,
		"W": 80
	},
	{
		"tipo": "Text",
		"value": "Documento di Valutazione",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 120,
		"align": "center"
	},
	{
		"tipo": "Text",
		"value": "Annoscolastico <%objPagella.iscrizione?.classeSezioneAnno.anno.annoscolastico%>",
		"X": 315,
		"Y": 130,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "Alunno",
		"X": 315,
		"Y": 140,
		"fontSize": 14,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "<%objPagella.iscrizione.alunno.nome%> <%objPagella.iscrizione.alunno.cognome%>",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 150,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "C.F.<%objPagella.iscrizione.alunno.cf%>",
		"X": 315,
		"Y": 160,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "nato a <%objPagella.iscrizione.alunno.comuneNascita%> (<%objPagella.iscrizione.alunno.provNascita%>) il <%this.FormatDate(objPagella.iscrizione.alunno.dtNascita, 'dd/mm/yyyy')%>",
		"X": 315,
		"Y": 168,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "La donzelletta vien dalla campagna in sul calar del sol omnia gallia in tres partes divisa est faccio la prova con un testo lungo per vedere cosa accade e se va a capo come deve",
		"X": 315,
		"Y": 188,
		"fontSize": 16,
		"align": "center" ,
		"maxWidth": 100
	},

	{
		"tipo": "Line",
		"thickness": 0.2,
		"color":"#C04F94",
		"X1": 210,
		"Y1": 10,
		"X2": 210,
		"Y2": 287
	},
	//#########################    PAGINA 2 E 3    #########################
	{
		"tipo": "Page"
	},
	{
		"tipo": "Image",
		"value": "logodefViola.png",
		"X": 10,
		"Y": 10,
		"W": 30
	},
	{
		"tipo": "Image",
		"value": "logodefViola.png",
		"X": 380,
		"Y": 10,
		"W": 30
	},
	{
		"tipo": "Text",
		"value": "- PRIMO QUADRIMESTRE -",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 105,
		"Y": 25,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "- SECONDO QUADRIMESTRE -",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 25,
		"fontSize": 16,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "- SECONDO QUADRIMESTRE -",
		"fontName": "TitilliumWeb-SemiBold",
		"X": 315,
		"Y": 25,
		"fontSize": 16,
		"align": "center" 
	},

//#region ----- STATICA -----

	// {
	// 	"tipo": "TableStatica",
	// 	"head":  [['Materia', '', 'Obiettivi di Apprendimento','','Livello Raggiunto', '',  'Giudizio Descrittivo']],
	// 	"headEmptyRow": 1,

	// 	//"data": [['David', '<%objPagella.iscrizione.alunno.comuneNascita%>', 'Sweden'],['Nick', 'david@example.com', 'Sweden']],
	// 	//"data": "<%objPagella.PagellaVoti%>",
	// 	//"head":  [['Materia', '', 'Obiettivi di Apprendimento','','Livello Raggiunto', '',  'Giudizio Descrittivo']],
	// 	//"data":  "<%objPagella.PagellaVoti.materia%>",
	// 	//"data1":  "['italiano',<%objPagella.PagellaVoti.obiettivi%>, <%objPagella.PagellaVoti.livello%>]",

	// 	"body":  			[
	// 		['Italiano', '', 'ascoltare e comprendere narrazioni o letture orali cogliendone il senso globale e le informazioni principali.','', 'Avanzato', '', "Nel corso dell'anno Alice ha mostrato interesse e curiosità per la lettura e la scrittura. Interviene volentieri e in modo appropriato rivelando un linguaggio fluido e preciso. Nella scrittura il gesto è sicuro, pulito e ordinato. Riconosce e sa usare i grafemi in stampato maiuscolo."],
	// 		['Italiano', '', 'partecipare a una conversazione, rispettando le regole della comunicazione, intervenendo in modo pertinente.', '', 'Avanzato', '', ''],
	// 		['Italiano', '', 'riconoscere i grafemi in stampato maiuscolo e associarli correttamente ai fonemi.', '', 'Base', '', '']
	// 	],


	// 	"colWidths": 		[  		15, 	2,     80, 		2, 	   20, 	    2,     69],
	// 	"cellBorders": 		[		1,	    0,		1,		0,		1,		0,		1], //Indica se TUTTE le celle in questa colonna hanno o meno il bordo (speci di SI/NO)
	// 	//"rowSpans": 		[		3,	    1,		1,		1,		1,		1,		3], //NON PIU' USATO: si usa ROWSMERGE
	// 	"rowsMerge": 		[		1,	    0,		0,		0,		0,		0,		1], //Indica se TUTTE le righe della tabella in questa colonna vanno unite
	// 	"colFills": 		[		0,		0,		0,		0,		0,		0,		0],

	// 	"fontName": "TitilliumWeb-Regular",
	// 	"X": 10,
	// 	"Y": 40,
	// 	//"W": 200,
	// 	"H": 10,
	// 	"color":"#C04F94",
	// 	"lineColor":"#000000",
	// 	"cellLineColor":"000000",
	// 	"fillColor":"#CCCCCC",
	// 	"lineWidth": 0.3,
	// 	"align": "center"
	// },
//#endregion

//#region ----- DINAMICA -----



	// {
	// 	"tipo": "TableDinamica",
	// 	"head":  [['Materia', 'Voto', 'Note', 'DtVoto']],
	// 	"headEmptyRow": 1,

	// 	"body":  			[
	// 		['Pagella.materia.descrizione', 'Pagella.voto', 'Pagella.note', 'Pagella.dtVoto']
	// 	],

	// 	"colWidths": 		[  	   50, 	   40,     60, 	   40],
	// 	"cellBorders": 		[		1,	    1,		1,		1], //non mette bordi su seconda col
	// 	"rowsMerge": 		[		0,	    0,		0,      0], //unisce tutte le celle della colonna
	// 	"colFills": 		[		0,		0,		0,		0], // riempie celle della colonna

	// 	"fontName": "TitilliumWeb-Regular",
	// 	"X": 10,
	// 	"Y": 100,
	// 	//"W": 200,
	// 	"H": 10,
	// 	"color":"#C04F94",
	// 	"lineColor":"#000000",
	// 	"cellLineColor":"000000",
	// 	"fillColor":"#CCCCCC",
	// 	"lineWidth": 0.3,
	// 	"align": "center"
	// },

	// {
	// 	"tipo": "TableDinamica",
	// 	"head":  [['Materia', 'Giudizio', 'Note', 'DtVoto']],
	// 	"headEmptyRow": 1,

	// 	"body":  			[
	// 		['Pagella.materia.descrizione', 'Pagella.tipoGiudizio.descrizione', 'Pagella.note', 'Pagella.dtVoto']
	// 	],

	// 	"colWidths": 		[  	   50, 	   40,     60, 	   40],
	// 	"cellBorders": 		[		1,	    1,		1,		1], //non mette bordi su seconda col
	// 	"rowsMerge": 		[		0,	    0,		0,      0], //unisce tutte le celle della colonna
	// 	"colFills": 		[		0,		0,		0,		0], // riempie celle della colonna

	// 	"fontName": "TitilliumWeb-Regular",
	// 	"X": 10,
	// 	"Y": 100,
	// 	//"W": 200,
	// 	"H": 10,
	// 	"color":"#C04F94",
	// 	"lineColor":"#000000",
	// 	"cellLineColor":"000000",
	// 	"fillColor":"#CCCCCC",
	// 	"lineWidth": 0.3,
	// 	"align": "center"
	// },

//#endregion
	
//#region ----- DINAMICA 2 -----
	// {
	// 	"tipo": "TableDinamica",
	// 	"head":  [['Materia', 'Obiettivi', 'Livello Raggiunto', 'DtVoto']],
	// 	"headEmptyRow": 1,

	// 	"body":  			[
	// 		['Pagella.materia.descrizione', 'Pagella._ObiettiviCompleti[el].livelloObiettivoID', 'Pagella._ObiettiviCompleti[el].descrizione', 'Pagella.dtVoto']
	// 	],

	// 	"colWidths": 		[  	   50, 	   40,     60, 	   40],
	// 	"cellBorders": 		[		1,	    1,		1,		1], //non mette bordi su seconda col
	// 	"rowsMerge": 		[		0,	    0,		0,      0], //unisce tutte le celle della colonna
	// 	"colFills": 		[		0,		0,		0,		0], // riempie celle della colonna

	// 	"fontName": "TitilliumWeb-Regular",
	// 	"X": 10,
	// 	"Y": 100,
	// 	//"W": 200,
	// 	"H": 10,
	// 	"color":"#C04F94",
	// 	"lineColor":"#000000",
	// 	"cellLineColor":"000000",
	// 	"fillColor":"#CCCCCC",
	// 	"lineWidth": 0.3,
	// 	"align": "center"
	// },

//#endregion

//#region ----- TableDinamicaPagella -----
	{
		"tipo": "TableDinamicaPagella",
		"head":  [
			['Materia', 'Livello Raggiunto', 'Obiettivo']
		],
		"headEmptyRow": 1,
		"body": 			[
			['PagellaVoto.materia.descrizione', 'PagellaVoto.voto', 'PagellaVoto.note'],
			['PagellaVoto.materia.descrizione', 'PagellaVoto.tipoGiudizio.descrizione', 'PagellaVoto.note'],
			['PagellaVoto.materia.descrizione', 'PagellaVoto._ObiettiviCompleti[el].livelloObiettivo.descrizione', 'PagellaVoto._ObiettiviCompleti[el].descrizione'],
							],

						
		"cellPadding": 		[  	   10, 	   10,     10],
		"colWidths": 		[  	   90, 	   56,     40],
		"cellBorders": 		[		1,	    1,      1],
		"colSpans": 		[
			[		1,      2],
			[		1,      2],
			[		1,	    1,	    1]
		],
		"rowsMerge": 		[
				[		0,	    0,		0],
				[		0,	    0,		0],
				[		1,	    0,		0]
			],
		"colFills": 		[		0,		0,		0],

		"fontName": "TitilliumWeb-Regular",
		"X": 10,
		"Y": 30,
		//"W": 200,
		"H": 10,

		"color":"#C04F94",
		"lineColor":"#000000",
		"cellLineColor":"000000",
		"fillColor":"#CCCCCC",
		"lineWidth": 0.3,
		"align": "center"
	 
	},

//#endregion
	 
]










	/*
	{
		"tipo": "Text",
		"value": "Campo data: <%FormatDate(objPagella.dtIns, 'dd/mm/yyyy')%>",
		"X": 315,
		"Y": 175,
		"fontSize": 14,
		"align": "center" 
	},
	{
		"tipo": "Text",
		"value": "FormatNumber: <%FormatNumber(objPagella.periodo, 3)%>",
		"X": 315,
		"Y": 180,
		"fontSize": 12,
		"align": "center" 
	},
	*/

	/*
	{
		"tipo": "Rect",
		"thickness": 0,
		"color":"#C04F94",
		"X": 210,
		"Y": 90,
		"W": 90,
		"H": 50,
		"borderRadius":0
	},*/
	// {
	// 	"tipo": "Cell",
	// 	"value": "Documento di Valutazione",
	// 	"font": "TitilliumWeb-Regular",
	// 	"X": 220,
	// 	"Y": 100,
	// 	"W": 190,
	// 	"H": 10,
	// 	"color":"#C04F94",
	// 	"lineColor":"#C04F94",
	// 	"lines": 2,
	// 	"align": "center"
	// },