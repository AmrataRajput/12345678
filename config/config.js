const mongoose = require('mongoose');

const nodemailer = require('nodemailer');

var env = process.env.NODE_ENV || 'test';

if(env === 'development' || env==='test'){

	var config_details = require('./config.json');

	var envConfig = config_details[env];

	Object.keys(envConfig).forEach((key)=>{

		process.env[key] = envConfig[key];

	});

	mongoose.Promise = global.Promise;

	var url = process.env.url;

	mongoose.connect(url);

	/*************Mail Setting********/

	// var transporter = nodemailer.createTransport({
	// 				  service: 'gmail',
	// 				  auth: {
	// 				    user: 'questtestmail@gmail.com',
	// 				    pass: 'test123R'
	// 				  }
	// 				});

	module.exports = { mongoose: mongoose};


}
