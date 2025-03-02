export interface RPT_TagDocument {   
	templateName:                         		string;

	tagFields?:          			      		RPT_TagField[];
	tagTables?:              			  		RPT_TagTable[];
}

export interface RPT_TagField {
	tagName:                                  	string;
	tagValue?:                                	string;
}

export interface RPT_TagTable {
	tagTableTitle:                            	string;
	tagTableRows?:             				  	RPT_TagTableRow[];
}

export interface RPT_TagTableRow {
	tagFields?:             			  		RPT_TagField[];
}

 