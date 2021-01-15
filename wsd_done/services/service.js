import { executeQuery } from "../database/database.js";

  
  const addUser = async(email, hash) => {
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, hash);
  }
  const getUser = async(email) => {
    const res = await executeQuery("SELECT * FROM users WHERE email = $1", email);
    return res;
  }
  const addMorning = async(duration, mood, quality, date, user_id) => {
    await executeQuery("INSERT INTO morning (sleep_dur, gen_mood, sleep_quality, date, user_id) VALUES ($1, $2, $3, $4, $5);", duration, mood, quality, date, user_id);
  }
  const addEvening = async(eating_quality, mood, study, sport, date, user_id) => {
    await executeQuery("INSERT INTO evening (eating_quality, gen_mood, time_studying, time_sports, date, user_id) VALUES ($1, $2, $3, $4, $5, $6);", eating_quality, mood, study, sport, date, user_id);
  }
  const checkMorning = async(date, id) => {
    const res = await executeQuery("SELECT * FROM morning WHERE date = $1 AND user_id = $2;", date, id)
    return res;
  }
  const checkEvening = async(date, id) => {
    const res = await executeQuery("SELECT * FROM evening WHERE date = $1 AND user_id = $2;", date, id)
    return res;
  }
  const updateMorning = async(duration, mood, quality, date, user_id) => {
    await executeQuery("UPDATE morning SET sleep_dur = $1, gen_mood = $2, sleep_quality = $3 WHERE date = $5 AND user_id = $4;", duration, mood, quality, user_id, date)
  }
  const updateEvening = async(eating_quality, mood, study, sport, date, user_id) => {
    await executeQuery("UPDATE evening SET eating_quality = $1, gen_mood = $2, time_studying = $3, time_sports  = $4 WHERE date = $6 AND user_id = $5;", eating_quality, mood, study, sport, user_id, date)
  }



  export { addUser, getUser, addMorning, addEvening,checkMorning,updateMorning ,checkEvening,updateEvening};

