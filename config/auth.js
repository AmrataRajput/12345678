var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
const session = require('express-session');
var {Registration,Userwallet,Importwallet,Tokendetails} = require('../models/contact');

var isAdmin = function(req, res, next) {
   
        
          // req.flash('error', 'Please log in first.');
          res.redirect('/admin');
  
}

var isUser = function(req, res, next) {
     var check_user = req.session.is_user_logged_in;
     var check_user_id=req.session.re_us_id;
    if (check_user != undefined && check_user !="" && check_user==true && check_user_id!="") {
      res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
       next();
    } else {
        req.flash('danger', 'Please log in first.');
        res.redirect('/Login');
    }
}


// exports.transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'questtestmail@gmail.com',
//     pass: 'test123R',

//   }
// });

module.exports = {

isUser:isUser,
isAdmin:isAdmin

}


