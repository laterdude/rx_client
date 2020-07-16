// const UpdateZone = require('./controllers/updateZone')
// const Authentication = require('./controllers/authentication')
// const passportService = require('./services/passport')
// const passport = require('passport')

// create middleware/route-interceptor of sorts
// const requireAuth = passport.authenticate('jwt', { session: false }) // session: false means 'no cookies'
// const requireSignin = passport.authenticate('local', { session: false }) // route middleware

// const ercDataArchive = require('./archive/ercDataArchive')
// const genErcData = require('./cron/genErcData')

// const zonesQuery = require('./queries/zones')
// const Status = require('./models/status')
// const Status = require('./queries/status')

module.exports = app => {
	// app.locals.ercDataArchive = ercDataArchive
	app.get('/data', function(req, res, next) {
		const options = {
	    root: __dirname + '/',
	    // dotfiles: 'deny',
	    lastModified: true,
	    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true,
	    }
	  }
	  res.sendFile('./data/stack_raw.tif', options, function (err) {
	    if (err) {
	      next(err);
	    } 
	    return
	  })	  
		// async function respond() {
		// 	try {
		// 		const jsonData = await genErcData()
		// 		// console.log("az105", jsonData["AZ105"])
		// 		res.send({ jsonData })
		// 	}
		// 	catch (error) {
		// 		console.log(error)
		// 	}
		// }
		// respond()		
		// res.send(ercDataArchive)
	})
	// app.get('/', requireAuth, function(req, res) {
	// 	res.send({ "message": "this is a secret code" })
	// 	// res.send(app.locals.ercDataArchive)
	// })
	// use route middleware requireSignin before proceeding to route
	// app.post('/signin', requireSignin, Authentication.signin, function(req, res) {
	// 	// res.send(zonesQuery(req.user.ID).then(response => response).catch(err => console.log(err)))
	// }) 
	// app.post('/signup', Authentication.signup)
	// app.post('/client', requireAuth, function(req, res) {
	// 	res.send({ "message": "this is a secret widget code" })
	// })
	// app.post('/update', requireAuth, 
	// 	UpdateZone.updateZone
	// // 	function(req, res) {
	// // 		genErcData()
	// // 		res.send({ "message": "update successful" })		
	// // 	}
	// )
	// app.get('/status', function(req, res) {
	// 	// const statusQuery = Status
	// 	// 	.find({
	// 	// 		updated:  { $gt: (Date.now() - 365*86400000) } 
	// 	// 	})
	// 	// 	.sort({ 'updated': -1 })

	// 	Status.statusQuery.then(response => {
	// 		res.set({
	// 	    lastModified: true,
	// 	    headers: {
	//         'x-timestamp': Date.now(),
	//         'x-sent': true,
	// 	    }
	//   	})
	// 		res.send(response)
	// 	})		
	// })
}