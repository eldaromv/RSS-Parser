import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import runApp from './app.js';
import { setYupLocale } from './validator';

setYupLocale();

runApp();
