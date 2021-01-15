import * as summaryService from "../../services/summaryService.js";
import {showSummary, showLanding} from "../controllers/generalControllers.js";


const showAvgMonth = async({render, session}) => {
    
    const yyww = 'Last week'
    const yymm = 'Last month'

    let dateNow = new Date();

    let yearForWeek = dateNow.getFullYear();
    let yearForMonth = dateNow.getFullYear();
    let onejan = new Date(dateNow.getFullYear(), 0, 1);
    let currentWeek = Math.ceil( (((dateNow.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7 );
    let lastWeek = currentWeek - 1;
    
    if(lastWeek == 0) {
        if(yearForWeek == 2021) {
            lastWeek = 53; // 2020 haas 53 weeks :D 
        } else {
            lastWeek = 52;
        }
        yearForWeek -= 1;
    }

    dateNow.setMonth(dateNow.getMonth() - 1);
    const lastMonth = dateNow.getMonth();

    if(lastMonth == 11) { // In case of December
        yearForMonth -= 1;
    }

    
    const id = (await session.get('user')).id
    const data2 = await summaryService.getPersonalSummaryW(lastWeek, yearForWeek, id);
    const data = await summaryService.getPersonalSummaryM(lastMonth + 1, yearForMonth, id);
    showSummary({render: render}, data,data2, yyww, yymm);
}

const postAvgMonth = async({render, request, session}) => {
    
    const body = request.body();
    const params = await body.value;
    let yyww = params.get('week')
    let yymm = params.get('month')

    let inputWeek = ''
    let inputYear = ''
    let inputMonth = ''
    let inputYearSecond = ''
    const id = (await session.get('user')).id
    
    if(yyww){
        inputWeek = yyww.substr(6, 7)
        inputYear = yyww.substr(0, 4)
    }
    if(yymm){
        inputYearSecond = yymm.substr(0, 4)
        inputMonth = yymm.substr(5, 6)
    }

    let dateNow = new Date();
    let onejan = new Date(dateNow.getFullYear(), 0, 1);
    let currentWeek = Math.ceil( (((dateNow.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7 );
    let lastWeek = currentWeek - 1;
    let yearForWeek = dateNow.getFullYear();
    let yearForMonth = dateNow.getFullYear();

    if(lastWeek == 0) {
        if(yearForWeek == 2021) {
            lastWeek = 53; // 2020 has 53 weeks :D
        } else {
            lastWeek = 52;
        }
        yearForWeek -= 1;
    }
    
    
    dateNow.setMonth(dateNow.getMonth() - 1);
    const lastMonth = dateNow.getMonth();
    if(lastMonth == 11) {
        yearForMonth -= 1;
    }
    

    let data2 = ''
    let data = ''
    if(inputWeek === '' || inputYear === ''){
        data2 = await summaryService.getPersonalSummaryW(lastWeek, yearForWeek, id);
        yyww = 'last week'
    }else{
        data2 = await summaryService.getPersonalSummaryW(Number(inputWeek), Number(inputYear), id);
    }
    
    if(inputMonth === '' || inputYearSecond === ''){
        data = await summaryService.getPersonalSummaryM(lastMonth + 1, yearForMonth, id);
        yymm = 'last month'
    }else{
        data = await summaryService.getPersonalSummaryM(Number(inputMonth), Number(inputYearSecond), id);
    }

    showSummary({render: render}, data, data2, yyww, yymm);
}

const landingStats = async({render}) => {
    let output = ''
    let mood1 = 0
    let mood2 = 0
    

    const today = (new Date()).toISOString().slice(0, 10).replace(/-/g, "-")
    let d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().slice(0, 10).replace(/-/g, "-")

    if((await summaryService.getEveningMood(today)).rowCount !== 0 && (await summaryService.getMorningMood(today)).rowCount !== 0){
        
        const resM = await summaryService.getMorningMood(today)
        const resE = await summaryService.getEveningMood(today)
        const moodMObj = await resM.rowsOfObjects()[0];
        const moodEObj = await resE.rowsOfObjects()[0];
        mood1 = (Number(moodMObj.avgmorningmood) + Number(moodEObj.avgeveningmood)) / 2
    }
    if((await summaryService.getEveningMood(yesterday)).rowCount !== 0 && (await summaryService.getMorningMood(yesterday)).rowCount !== 0){
        
        const resM = await summaryService.getMorningMood(yesterday)
        const resE = await summaryService.getEveningMood(yesterday)
        const moodMObj = await resM.rowsOfObjects()[0];
        const moodEObj = await resE.rowsOfObjects()[0];
        mood2 = (Number(moodMObj.avgmorningmood) + Number(moodEObj.avgeveningmood)) / 2
    }
    if(mood2 && mood1){
        if(mood1 >= mood2){
            output = 'Things are looking bright today!'
        }else{
            output = 'Things are looking gloomy today..'
        }
    }else{
        output = 'Not enough data for analysis.'
    }
    

    showLanding({render:render}, output, mood1, mood2)
}

   
export { showAvgMonth, postAvgMonth, landingStats};