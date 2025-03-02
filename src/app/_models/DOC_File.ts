import { RPT_TagDocument } from "./RPT_TagDocument";

export interface DOC_File {
        id?:                                    number;

        tipoDoc:                                string;
        docID:                                  number;
        fileBase64?:                            string;
        tipoFile:                               string;

        TagDocument?:                           RPT_TagDocument;
}

 