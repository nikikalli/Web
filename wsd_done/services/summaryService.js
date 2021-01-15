import { executeQuery } from "../database/database.js";

const getPersonalSummaryW = async(week,year,userId) => {
    const morningres = await executeQuery("SELECT AVG(sleep_dur) as avgSleep,AVG(gen_mood) as avgMorningMood, AVG(sleep_quality) as avgQuality FROM morning WHERE EXTRACT('week' FROM date) = $1 AND user_id = $2 AND EXTRACT('year' from date) = $3;", week,userId, year);
    const eveningres = await executeQuery("SELECT AVG(eating_quality) as eatQuality,AVG(gen_mood) as avgEveningMood,AVG(time_studying) as avgStudyTime,AVG(time_sports) as avgSportTime FROM evening WHERE EXTRACT('week' FROM date) = $1 AND user_id = $2 AND EXTRACT('year' from date) = $3;", week,userId, year);
    const morningObj = morningres.rowsOfObjects()[0];
    const eveningObj = eveningres.rowsOfObjects()[0];

    const morMoodAvg = Number(morningObj.avgmorningmood);
    const eveMoodAvg = Number(eveningObj.avgeveningmood);
    
    let avgMood;
    if(morMoodAvg != 0 && eveMoodAvg != 0) {
      avgMood = (morMoodAvg + eveMoodAvg) / 2
    } else if(morMoodAvg == 0) {
      avgMood = eveMoodAvg;
    } else {
      avgMood = morMoodAvg;
    }

    const data = {
      sleep_dur: Number(morningObj.avgsleep),
      sports: Number(eveningObj.avgsporttime),
      studying: Number(eveningObj.avgstudytime),
      sleep_quality: Number(morningObj.avgquality),
      mood: avgMood
    };
    return data;
  }

  const getPersonalSummaryM = async(month,year,userId) => {
    const morningres = await executeQuery("SELECT AVG(sleep_dur) as avgSleep,AVG(gen_mood) as avgMorningMood, AVG(sleep_quality) as avgQuality FROM morning WHERE EXTRACT('month' FROM date) = $1 AND user_id = $2 AND EXTRACT('year' from date) = $3;", month,userId, year);
    const eveningres = await executeQuery("SELECT AVG(eating_quality) as eatQuality,AVG(gen_mood) as avgEveningMood,AVG(time_studying) as avgStudyTime,AVG(time_sports) as avgSportTime FROM evening WHERE EXTRACT('month' FROM date) = $1 AND user_id = $2 AND EXTRACT('year' from date) = $3;", month,userId, year);
    const morningObj = morningres.rowsOfObjects()[0];
    const eveningObj = eveningres.rowsOfObjects()[0];
    

    const morMoodAvg = Number(morningObj.avgmorningmood);
    const eveMoodAvg = Number(eveningObj.avgeveningmood);
    
    let avgMood;
    if(morMoodAvg != 0 && eveMoodAvg != 0) {
      avgMood = (morMoodAvg + eveMoodAvg) / 2
    } else if(morMoodAvg == 0) {
      avgMood = eveMoodAvg;
    } else {
      avgMood = morMoodAvg;
    }

    const data = {
      sleep_dur: Number(morningObj.avgsleep),
      sports: Number(eveningObj.avgsporttime),
      studying: Number(eveningObj.avgstudytime),
      sleep_quality: Number(morningObj.avgquality),
      mood: avgMood
    };
    
    return data;
  }
  
    const getSummaryW = async(week, year) => {
    const morningres = await executeQuery("SELECT AVG(sleep_dur) as avgSleep,AVG(gen_mood) as avgMorningMood, AVG(sleep_quality) as avgQuality FROM morning WHERE EXTRACT('week' FROM date) = $1 AND EXTRACT('year' FROM date) = $2;", week, year);
    const eveningres = await executeQuery("SELECT AVG(eating_quality) as eatQuality,AVG(gen_mood) as avgEveningMood,AVG(time_studying) as avgStudyTime,AVG(time_sports) as avgSportTime FROM evening WHERE EXTRACT('week' FROM date) = $1 AND EXTRACT('year' FROM date) = $2;", week, year);
    const morningObj = morningres.rowsOfObjects()[0];
    const eveningObj = eveningres.rowsOfObjects()[0];

    const morMoodAvg = Number(morningObj.avgmorningmood);
    const eveMoodAvg = Number(eveningObj.avgeveningmood);
    
    let avgMood;
    if(morMoodAvg != 0 && eveMoodAvg != 0) {
      avgMood = (morMoodAvg + eveMoodAvg) / 2
    } else if(morMoodAvg == 0) {
      avgMood = eveMoodAvg;
    } else {
      avgMood = morMoodAvg;
    }

    const data = {
      sleep_dur: Number(morningObj.avgsleep),
      sports: Number(eveningObj.avgsporttime),
      studying: Number(eveningObj.avgstudytime),
      sleep_quality: Number(morningObj.avgquality),
      mood: avgMood
    };
    return data;
  }

  const getSummaryM = async(month, year) => {
    const morningres = await executeQuery("SELECT AVG(sleep_dur) as avgSleep,AVG(gen_mood) as avgMorningMood, AVG(sleep_quality) as avgQuality FROM morning WHERE EXTRACT('month' FROM date) = $1 AND EXTRACT('year' FROM date) = $2;", month, year);
    const eveningres = await executeQuery("SELECT AVG(eating_quality) as eatQuality,AVG(gen_mood) as avgEveningMood,AVG(time_studying) as avgStudyTime,AVG(time_sports) as avgSportTime FROM evening WHERE EXTRACT('month' FROM date) = $1 AND EXTRACT('year' FROM date) = $2;", month, year);
    const morningObj = morningres.rowsOfObjects()[0];
    const eveningObj = eveningres.rowsOfObjects()[0];
    

    const morMoodAvg = Number(morningObj.avgmorningmood);
    const eveMoodAvg = Number(eveningObj.avgeveningmood);
  
    let avgMood;
    if(morMoodAvg != 0 && eveMoodAvg != 0) {
      avgMood = (morMoodAvg + eveMoodAvg) / 2
    } else if(morMoodAvg == 0) {
      avgMood = eveMoodAvg;
    } else {
      avgMood = morMoodAvg;
    }
    
    const data = {
      sleep_dur: Number(morningObj.avgsleep),
      sports: Number(eveningObj.avgsporttime),
      studying: Number(eveningObj.avgstudytime),
      sleep_quality: Number(morningObj.avgquality),
      mood: avgMood
    };
   
    return data;
  }

  const getMorningMood = async(date) =>{
    const res = await executeQuery("SELECT AVG(gen_mood) as avgMorningMood FROM morning WHERE date = $1;", date)
    return res;
  }
  const getEveningMood = async(date) => {
    const res = await executeQuery("SELECT AVG(gen_mood) as avgEveningMood FROM evening WHERE date = $1", date )
    return res;
  }

  const getLastSevenSummary = async() => {
    let currentDate = new Date();
    let oldDate = new Date();
    oldDate.setDate(oldDate.getDate() -7);
    const data = {
      sleep_dur: 0,
      sports: 0,
      studying: 0,
      sleep_quality: 0,
      mood: 0
    };
    const morningres = await executeQuery("SELECT AVG(sleep_dur) as avgSleep,AVG(gen_mood) as avgMorningMood, AVG(sleep_quality) as avgQuality FROM morning WHERE date BETWEEN $1 AND $2;",oldDate,currentDate );
    const eveningres = await executeQuery("SELECT AVG(eating_quality) as eatQuality,AVG(gen_mood) as avgEveningMood,AVG(time_studying) as avgStudyTime,AVG(time_sports) as avgSportTime FROM evening WHERE date BETWEEN $1 AND  $2 ;",oldDate,currentDate);
    if(morningres.rowCount >0 && eveningres.rowCount >0){
      const morningObj = morningres.rowsOfObjects()[0];
      const eveningObj = eveningres.rowsOfObjects()[0];
      const avgMood = (Number(morningObj.avgmorningmood) + Number(eveningObj.avgeveningmood))/2;
        data.sleep_dur = Number(morningObj.avgsleep);
        data.sports= Number(eveningObj.avgsporttime);
        data.studying= Number(eveningObj.avgstudytime);
        data.sleep_quality= Number(morningObj.avgquality);
        data.mood= avgMood;
    }
    return data;
  }
  const getSpecificDateSummary = async(date) => {

    const data = {
      sleep_dur: 0,
      sports: 0,
      studying: 0,
      sleep_quality: 0,
      mood: 0
    };
  
    const morningres = await executeQuery("SELECT AVG(sleep_dur) as avgSleep,AVG(gen_mood) as avgMorningMood, AVG(sleep_quality) as avgQuality FROM morning WHERE date = $1;",date );
    const eveningres = await executeQuery("SELECT AVG(eating_quality) as eatQuality,AVG(gen_mood) as avgEveningMood,AVG(time_studying) as avgStudyTime,AVG(time_sports) as avgSportTime FROM evening WHERE date = $1 ;",date);
    if(morningres.rowCount >0 && eveningres.rowCount >0){
    const morningObj = morningres.rowsOfObjects()[0];
    const eveningObj = eveningres.rowsOfObjects()[0];
    const avgMood = (Number(morningObj.avgmorningmood) + Number(eveningObj.avgeveningmood))/2;
    
      data.sleep_dur = Number(morningObj.avgsleep);
      data.sports= Number(eveningObj.avgsporttime);
      data.studying= Number(eveningObj.avgstudytime);
      data.sleep_quality= Number(morningObj.avgquality);
      data.mood= avgMood;
    
  }
    return data;
  }
export{ getSummaryW, getSummaryM,getPersonalSummaryW,getPersonalSummaryM, getMorningMood, getEveningMood,getLastSevenSummary,getSpecificDateSummary }