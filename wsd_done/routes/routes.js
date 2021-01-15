import { Router } from "../deps.js";
import { showBehavior } from "./controllers/generalControllers.js";
import * as calculusApis from "./apis/calculusApis.js";
import * as authenticationApi from "./apis/authenticationApis.js";
import { showLoginForm, showRegistrationForm } from "./controllers/authenticationController.js";
import * as JSONendPoint from "./apis/endpointsApis.js";

const router = new Router();

router.get('/', calculusApis.landingStats)
router.get('/auth/registration', showRegistrationForm);
router.post('/auth/registration', authenticationApi.postRegistrationForm);
router.get('/auth/login', showLoginForm);
router.post('/auth/login',  authenticationApi.postLoginForm);
router.get('/auth/logout', authenticationApi.getLogout);
router.get('/behavior/reporting', showBehavior);
router.post('/behavior/reporting',authenticationApi.postReportingData);
router.post('/behavior/summary', calculusApis.postAvgMonth);
router.get('/behavior/summary', calculusApis.showAvgMonth)
router.get('/api/summary', JSONendPoint.returnLastSevenDayJSON);
router.get('/api/summary/:year/:month/:day', JSONendPoint.returnSpecificDayJSON);


export { router };