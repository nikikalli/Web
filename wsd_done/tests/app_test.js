import * as service from "../services/service.js";
import * as service2 from "../services/summaryService.js"
import { assertEquals } from "../deps.js";
import { executeQuery } from "../database/database.js";
import { bcrypt } from "../deps.js";
import { superoak } from "../deps.js";
import { app } from "../app.js";



//Test only with the TEST_ENVIRONMENT variable set to "true" (test database)!!!!

//Reset the test database
if (Deno.env.get('TEST_ENVIRONMENT')) {
    console.log("resetting");
    await executeQuery("DELETE from morning;");
    await executeQuery("DELETE from evening;");
    await executeQuery("DELETE from users;");
}



//Services: addUser, getUser
Deno.test("User added using addUser should be returned using getUser with correct email and password", async() => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const email = "test@test.com"
    const hash = await bcrypt.hash("test");
    await service.addUser(email, hash);
    const res = await service.getUser(email);
    const obj = await res.rowsOfObjects()[0];
    await assertEquals(obj.email, email);
    await assertEquals(obj.password, hash);
});




//Registration
Deno.test("Get to /auth/registration should show register page", async () => {
    const testClient = await superoak(app);
    await testClient.get('/auth/registration')
        .expect(new RegExp('<input type="password" id="passwordVerField" name="verification" placeholder="Verify your password here..."/>'));
});

Deno.test("Registering an account without email", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.post('/auth/registration')
        .send('password=moi&verification=moi')
        .expect(new RegExp('email is required'));
});

Deno.test("Registering an account without password", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.post('/auth/registration')
        .send('email=test2@test.com&verification=moi')
        .expect(new RegExp('password is required'));
});

Deno.test("Registering an account with too short password", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.post('/auth/registration')
        .send('email=test2@test.com&password=moi&verification=moi')
        .expect(new RegExp('password cannot be lower than 4 characters'));
});

Deno.test("Registering an account with wrong verfication password", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.post('/auth/registration')
        .send('email=test2@test.com&password=moiks&verification=moikkuu')
        .expect(new RegExp("Passwords don&#39;t match"));
});

Deno.test("Registering an account with wrong already registered email", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.post('/auth/registration')
        .send('email=test@test.com&password=moiks&verification=moiks')
        .expect(new RegExp("Email is already in use"));
});

Deno.test("Registering an account with correct fields", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;
    
    const testClient = await superoak(app);
    await testClient.post('/auth/registration')
        .send('email=test2@test.com&password=moiks&verification=moiks')
        .expect(200);
    const res = await service.getUser("test2@test.com");
    const obj = await res.rowsOfObjects()[0];
    await assertEquals(obj.email, "test2@test.com"); //registered email should be found in the database
});







//Logging in / authenticating
Deno.test("Get to /auth/login should show login page", async () => {
    const testClient = await superoak(app);
    await testClient.get('/auth/login')
        .expect(new RegExp('<input type="password" name="password" id=\'passwordField\' placeholder="Type your password here..."/>\r\n                    <input type="submit" value="Login" />'));
});

Deno.test("Logging in with unregistered email", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.post('/auth/login')
        .send('email=moi@moikku.com&password=moikkuu')
        .expect(new RegExp("Invalid email or password"));
});

Deno.test("Logging in with invalid email", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.post('/auth/login')
        .send('email=moi&password=moikkuu')
        .expect(new RegExp("Invalid email or password"));
});

Deno.test("Logging in with registered mail and incorrect password", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.post('/auth/login')
        .send('email=test@test.com&password=moikkuu')
        .expect(new RegExp("Invalid email or password"));
});

Deno.test("Trying to access /behavior/reporting without logging in", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    const testClient = await superoak(app);
    await testClient.get('/behavior/reporting')
        .expect(new RegExp('<input type="password" name="password" id=\'passwordField\' placeholder="Type your password here..."/>\r\n                    <input type="submit" value="Login" />')); //should be redirected to login page
});


Deno.test("Logging in with correct credentials", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    testClient = await superoak(app);
    //setting cookie - should be authenticated and render reporting.ejs
    await testClient.get('/behavior/reporting')
        .set("Cookie", cookie)
        .expect(new RegExp('<input type="text" min="0" name="sleep" id=\'sleepField\' placeholder="Type how long did you sleep for..." value=""/>\r\n        <label for="qualityField">Sleep quality</label>\r\n        <select class="sleep-quality" name="sleepq" id="qualityField">\r\n            <option>1</option>\r\n            <option>2</option>\r\n            <option>3</option>\r\n            <option>4</option>\r\n            <option>5</option>\r\n          </select>\r\n        <label for="moodField">Generic mood</label>'));      

});




//Posting morning / evening behavior

Deno.test("Post morning data", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    const sleep = 7;
    const date = new Date().toISOString().substr(0,10);
    const sleepq = 3;
    const moodq = 4;


    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sleep=${sleep}&date=${date}&sleepq=${sleepq}&moodq=${moodq}`)
        .expect(new RegExp('<input type="text" min="0" name="sleep" id=\'sleepField\' placeholder="Type how long did you sleep for..." value=""/>\r\n        <label for="qualityField">Sleep quality</label>\r\n        <select class="sleep-quality" name="sleepq" id="qualityField">\r\n            <option>1</option>\r\n            <option>2</option>\r\n            <option>3</option>\r\n            <option>4</option>\r\n            <option>5</option>\r\n          </select>\r\n        <label for="moodField">Generic mood</label>'));      

    //database resets after every test run so if res.rowCount > 0, morning data has been added to database:
    const res = await executeQuery("SELECT * FROM morning");
    await assertEquals(res.rowCount, 1);
});



Deno.test("Post evening data", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    const sport = 2.3;
    const date = new Date().toISOString().substr(0,10);
    const study = 4.2;
    const gmood = 4;
    const eat = 5;

    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sport=${sport}&date=${date}&study=${study}&generic-mood=${gmood}&eat=${eat}`)
        .expect(new RegExp('<input type="text" min="0" name="sleep" id=\'sleepField\' placeholder="Type how long did you sleep for..." value=""/>\r\n        <label for="qualityField">Sleep quality</label>\r\n        <select class="sleep-quality" name="sleepq" id="qualityField">\r\n            <option>1</option>\r\n            <option>2</option>\r\n            <option>3</option>\r\n            <option>4</option>\r\n            <option>5</option>\r\n          </select>\r\n        <label for="moodField">Generic mood</label>'));      

    //database resets after every test run so if res.rowCount > 0, evening data has been added to database:
    const res = await executeQuery("SELECT * FROM evening");
    await assertEquals(res.rowCount, 1);
});

Deno.test("Post morning data without filling all the fields", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    const date = new Date().toISOString().substr(0,10);
    const sleepq = 3;
    const moodq = 4;


    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`date=${date}&sleepq=${sleepq}&moodq=${moodq}`)
        .expect(new RegExp('All fields must be filled.'))
        .expect(new RegExp('Please try again.'));
});

Deno.test("Post evening data without filling all the fields", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    const sport = 2.3;
    const date = new Date().toISOString().substr(0,10);
    const study = 4.2;

    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sport=${sport}&date=${date}&study=${study}`)
        .expect(new RegExp('All fields must be filled.'))
        .expect(new RegExp('Please try again.'));
});



Deno.test("Post morning data with negative sleep hours", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    const sleep = -5;
    const date = new Date().toISOString().substr(0,10);
    const sleepq = 3;
    const moodq = 4;


    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sleep=${sleep}&date=${date}&sleepq=${sleepq}&moodq=${moodq}`)
        .expect(new RegExp("-5 must be between 0 - 24"));

    const res = await executeQuery("SELECT * FROM morning WHERE sleep_dur = -5");
    await assertEquals(res.rowCount, 0);
});

Deno.test("Post evening data with negative sport hours", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    const sport = -2.3;
    const date = new Date().toISOString().substr(0,10);
    const study = 4.2;
    const gmood = 4;
    const eat = 5;

    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sport=${sport}&date=${date}&study=${study}&generic-mood=${gmood}&eat=${eat}`)
        .expect(new RegExp("-2.3 must be between 0 - 24"));

    const res = await executeQuery("SELECT * FROM evening WHERE time_sports = -2.3");
    await assertEquals(res.rowCount, 0);
});

Deno.test("Post evening data with negative study hours", async () => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    const sport = 2.3;
    const date = new Date().toISOString().substr(0,10);
    const study = -4.2;
    const gmood = 4;
    const eat = 5;

    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sport=${sport}&date=${date}&study=${study}&generic-mood=${gmood}&eat=${eat}`)
        .expect(new RegExp("-4.2 must be between 0 - 24"));

    const res = await executeQuery("SELECT * FROM evening WHERE time_studying = -4.2");
    await assertEquals(res.rowCount, 0);
});





//Test summaries
const sleep = 7;
let date = "2020-12-09";
const sleepq = 3;
const moodq = 4;

const sleep2 = 5.5;
let date2 = "2020-12-10";
const sleepq2 = 5;
const moodq2 = 2;

const sport = 2.3;
date = "2020-12-09";
const study = 4.2;
const gmood = 4;
const eat = 5;

const sport2 = 1;
date2 = "2020-12-10";
const study2 = 2.5;
const gmood2 = 2;
const eat2 = 4;

const postedAvg_sleep = (sleep + sleep2) / 2.0;
const postedAvg_sleepq = (sleepq + sleepq2) / 2.0;
const postedAvg_sport = (sport + sport2) / 2.0;
const postedAvg_study = (study + study2) / 2.0;
const postedAvg_mood = (gmood + gmood2 + moodq + moodq2) / 4.0;


Deno.test("Calculate week summary (personal)", async() => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;

    await executeQuery("DELETE from morning;");
    await executeQuery("DELETE from evening;");

    //login
    let testClient = await superoak(app);
    const response = await testClient.post('/auth/login')
        .send('email=test@test.com&password=test')
        .expect(200);
    
    const headers = response.headers["set-cookie"];
    const cookie = headers.split(";")[0];
    
    //post morning data
    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sleep=${sleep}&date=${date}&sleepq=${sleepq}&moodq=${moodq}`);

    //post morning data 2
    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sleep=${sleep2}&date=${date2}&sleepq=${sleepq2}&moodq=${moodq2}`);

    //post evening data
    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sport=${sport}&date=${date}&study=${study}&generic-mood=${gmood}&eat=${eat}`);
      
    //post evening data 2
    testClient = await superoak(app);
    await testClient.post('/behavior/reporting')
        .set("Cookie", cookie)
        .send(`sport=${sport2}&date=${date2}&study=${study2}&generic-mood=${gmood2}&eat=${eat2}`);
    
    //fetch id
    const res = await executeQuery("SELECT id FROM users WHERE email = 'test@test.com';");
    const user_id = res.rowsOfObjects()[0].id;

    const data = await service2.getPersonalSummaryW(50, 2020, user_id);
    
    //compare with manually calculated averages
    assertEquals(postedAvg_sleep, data.sleep_dur);
    assertEquals(postedAvg_sleepq, data.sleep_quality);
    assertEquals(postedAvg_sport, data.sports);
    assertEquals(postedAvg_study, data.studying);
    assertEquals(postedAvg_mood, data.mood);

});

Deno.test("Calculate month summary (personal)", async() => {
    if (!Deno.env.get('TEST_ENVIRONMENT')) return;
    
    //fetch id
    const res = await executeQuery("SELECT id FROM users WHERE email = 'test@test.com';");
    const user_id = res.rowsOfObjects()[0].id;

    const data = await service2.getPersonalSummaryM(12, 2020, user_id);
    
    //compare with manually calculated averages
    assertEquals(postedAvg_sleep, data.sleep_dur);
    assertEquals(postedAvg_sleepq, data.sleep_quality);
    assertEquals(postedAvg_sport, data.sports);
    assertEquals(postedAvg_study, data.studying);
    assertEquals(postedAvg_mood, data.mood);

});



//Reset the test database
if (Deno.env.get('TEST_ENVIRONMENT')) {
    await executeQuery("DELETE from morning;");
    await executeQuery("DELETE from evening;");
    await executeQuery("DELETE from users;");
}



Deno.test({
    name: "GET / returns 200", 
    async fn() {
        const testClient = await superoak(app);
        await testClient.get("/").expect(200);
    },
    sanitizeResources: false,
    sanitizeOps: false
});

