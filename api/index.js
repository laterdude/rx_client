// Main starting point of the application
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');
const cors = require('cors');
const geoblaze = require('geoblaze')

const raster = geoblaze.load('https://www.ercserver.us/geoTiff')
	.then(raster => geoblaze.rasterCalculator(raster, (rh, temp, wind) => ((rh < temp) ? 1 : 0)))
	.then(x => console.log(x));
// const rasterMaff = await geoblaze
// 	.rasterCalculator(raster, (rh, temp, wind) => ((rh < temp) ? 1 : 0))
// console.log('rasterMaff: ', rasterMaff)
// var config = require('./config');

// DB Setup
// mongoose.connect(config.getDbConnectionString());

// App Setup
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json({ type: '*/*' }));
router(app);

// Server Setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on:', port);
