import * as summaryService from "../../services/summaryService.js";

const returnLastSevenDayJSON = async({response}) => {
    const data = await summaryService.getLastSevenSummary();
    response.body = data;
}

const returnSpecificDayJSON = async({response,params}) =>{
    
    const year = Number(params.year);
    const month = Number(params.month) - 1;
    const day = Number(params.day);

    let res = {};
    if(year && month && day){
        let d = new Date(year, month, day);
        res = await summaryService.getSpecificDateSummary(d);
    }
    response.body = res;
}

export{returnLastSevenDayJSON, returnSpecificDayJSON}