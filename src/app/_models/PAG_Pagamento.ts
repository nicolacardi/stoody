import { PAG_CausalePagamento }                 from "./PAG_CausalePagamento";
import { PAG_PagamentoRetta } from "./PAG_PagamentoRetta";
import { PAG_TipoPagamento }                    from "./PAG_TipoPagamento";

export interface PAG_Pagamento {

        id                 : number;
        annoID             : number;
        importo            : number;
        dtPagamento        : Date;
        tipoPagamentoID    : number;
        tipoPagamento      : PAG_TipoPagamento;
        causaleID          : number;
        causale            : PAG_CausalePagamento;

        note               : string;
        dtIns              : string;
        dtUpd              : string;
        userIns            : number;
        userUpd            : number;
        
        pagamentoRetta?    : PAG_PagamentoRetta;
}


