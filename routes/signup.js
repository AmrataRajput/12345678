const express = require('express');

const session = require('express-session');

const flash   = require('req-flash');

const multer  = require('multer');  
var crypto = require('crypto');

const request = require('request');
var async = require('async');

const routes = require('express').Router();

const bodyParser = require('body-parser');

const nodemailer = require('nodemailer');

var mkdirp = require('mkdirp');

const bcrypt = require('bcryptjs');

const {mongoose} = require('../config/config');

const {AdminInfo} = require('../models/admin');
const Tx = require('ethereumjs-tx');
// const {UserInfo,StateInfo,TokenInfo,CountryInfo,VeriInfo,EtherInfo,GiftInfo,ContactInfo,NewsInfo,BasictInfo,TeamMemberInfo,NewsDetailsInfo,MailInfo} = require('../models/registered_user');
var {Registration,Userwallet,Importwallet,Tokendetails} = require('../models/contact');

// const {middleware_check_login} = require('./middleware/login_middleware');
// const auth = require('../config/auth');
const {middleware_check_login} = require('../middleware/login_middleware');

var dateTime = require('node-datetime');
// var dt = dateTime.create();
// var moment = require('moment');
// var current_time = Date.now();
// console.log(current_time)

   var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var current_time=indiaTime.toLocaleString();


/****************/
// app.use( bodyParser.json() );
// routes.use(bodyParser.json());
routes.use(bodyParser.urlencoded({ extended: true }))
routes.use(bodyParser.json())

// routes.use(bodyParser.urlencoded({ extended: true })); 

routes.use(session({ secret: 'admindetails' }));

routes.use(flash());
// var middleware_check_login = auth.middleware_check_login;
/******For User Profile Pictrue***/

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'assets/uploads/user_profile_images')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() +'.jpg')
    }
});
var upload = multer({storage: storage});


/******For Admin Profile Picture***/

var storage_admin = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/admin_assets/uploads/admin_profile_images')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() +'.jpg')
    }
});

// var upload_admin = multer({storage: storage_admin});

var upload_admin = multer({
   storage: storage_admin
}).array("imgUploader", 1);


/******For Team Member Profile Picture***/

var storage_team_member = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/admin_assets/uploads/team-member-profiles')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() +'.jpg')
    }
});

var upload_member_profile = multer({storage: storage_team_member});


/******For News Section Picture***/

var storage_news_details = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/admin_assets/uploads/news-section')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() +'.jpg')
    }
});

var upload_news_profile = multer({storage: storage_news_details});


        //console.log(result_mail);
         
        

       	var transporter = nodemailer.createTransport({
                                                // service: 'Gmail',
                                                // auth: {
                                                //     user: my_send_user,
                                                //     pass: my_send_pass
                                                // }
                                               //   port: 25,
                                               // host: 'localhost',
                                               // tls: {
                                               //   rejectUnauthorized: false
                                               // },
                                                service: 'Gmail',
          auth: {
          user: 'questtestmail@gmail.com',
          pass: 'test123R',
          }
                                                  //  no-reply@agifttoken.com
                                            });
       //	console.log(transporter);

/*****Create New Admin****/

routes.post('/submit-new-admin',(req,res)=>{

	var name = req.body.admin_name;
	
	var email = req.body.email;

	var password = req.body.password;

	var submit_construct = new AdminInfo({
		name:name,
		email:email,
		password:password
	});

	submit_construct.save().then((done)=>{

		if(done){

			res.send('New Admin Details Entered Successfully');

		}

	}).catch((e)=>{

		res.send(e);

	});


});

/********Login work*****/

routes.get('/admin-login',(req,res)=>{


	res.render('admin/admin-login/admin_login.hbs',req.flash());

});




routes.get('/test',(req,res)=>{

req.flash('success_logout', 'You have entered wrong email or password try again.');

res.redirect('/admin-login');

});

// routes.get('/',(req,res)=>{

// 	res.render('index.ejs',req.flash());

// });
routes.get('/send_ether',middleware_check_login,(req,res)=>{

// err_msg = req.flash('err_msg');
// success_msg = req.flash('success_msg');

AdminInfo.findOne().then((succ)=>{

		res.render('admin/admin-dashboard/send_ether.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,user_main_id:succ._id,expressFlash: req.flash()});

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});
	
	// res.render('admin/admin-dashboard/send_token_admin.hbs',req.flash());

});

routes.post('/submit-ether',(req,res)=>{

	// var username = req.body.username;

	// var password = req.body.password;
	var user_id=req.body.user_m_id;
	// var user_correct_passphrese=req.body.user_cr_pass.trim();
	var entered_passphrese=req.body.enter_passphrase.trim();
	// var hashnew=crypto.createHash('sha256').update(entered_passphrese).digest('base64');

	var sender_address=req.body.sender_address.trim();
	var reciver_address=req.body.reciver_address.trim();
	var get_amount=req.body.amount_send.trim();

	if(entered_passphrese=='12345678')
  {

 var options = {  
        url: "http://45.252.190.5:8000",
        method: 'POST',
        headers:
        { 
         "content-type": "application/json"
        },
        body: JSON.stringify({"jsonrpc":"2.0","method":"personal_unlockAccount","params":[sender_address,entered_passphrese],"id":1})
      };
      request(options, function (error, response, body) {
       if (!error && response.statusCode == 200) {
         console.log(body);
      
          var sender_private_key='E255E5565B6D62A7408630189E0ACE188773EC87F5A64FA79DE278F579E91429';
          var privateKey = Buffer.from(sender_private_key, 'hex');
        
            var tokenContractABI ='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardEthBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"timeStampForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardTo","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targetForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"epochCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MAXIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"miningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"challengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"solutionForChallenge","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestDifficultyPeriodStarted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MINIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"donation","type":"address"}],"name":"Donation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"donnationAddress","type":"address"}],"name":"DonationAddressOf","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"reward_amount","type":"uint256"},{"indexed":false,"name":"epochCount","type":"uint256"},{"indexed":false,"name":"newChallengeNumber","type":"bytes32"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getChallengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningDifficulty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"}],"name":"getMintDigest","outputs":[{"name":"digesttest","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"},{"name":"testTarget","type":"uint256"}],"name":"checkMintSolution","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"donationTo","outputs":[{"name":"donationAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"donationAddress","type":"address"}],"name":"changeDonation","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"},{"name":"donation","type":"address[]"},{"name":"admin","type":"address"}],"name":"transferAndDonateTo","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]'

             var user1=JSON.parse(tokenContractABI);
             var tokenContract = new web3js.eth.Contract(user1,"0x53218739EdEa3857148C931E0644AAC0C1368305");
             var count;

              tokenContract.methods.balanceOf(sender_address).call().then(function (result) {
            // console.log(result);
		          var count_balance = parseInt(result);
		          rown_bal=count_balance/Math.pow(10,10);
		          console.log(rown_bal);
          if(rown_bal >= get_amount)
          { 
                web3js.eth.getTransactionCount(sender_address).then(function(v) {
                console.log("Count: " + v);
                count = v;
                var amount = get_amount;

                var rawTransaction = {
                    "from": sender_address,
                     "to": reciver_address,
                    "gasPrice": '0x0',
                    "gasLimit": web3js.utils.toHex(4600000),
                     "value": web3js.utils.toHex(web3js.utils.toWei(amount, 'ether')),
     
                   "nonce": web3js.utils.toHex(count)
                }

                // var rawTransaction = {


                //                     /*Code to send Eather*/

                //                     nonce: web3js.utils.toHex(count),
                //                     to: reciver_address,
                //                     value: web3js.utils.toHex(web3js.utils.toWei(total_asg, 'ether')),
                //                     gasLimit: web3js.utils.toHex(21000),
                //                     gasPrice: web3js.utils.toHex(web3js.utils.toWei('20', 'gwei')),
                //                     // gasLimit: 0.000000002,
                //                     // gasPrice: 210000,


                //                 }
                // console.log(rawTransaction);
                var transaction = new Tx(rawTransaction);
                transaction.sign(privateKey);
                web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'), (err, hash) => {
                  if (hash !="" && hash!=null && hash!=undefined) 
                  // if(err)
                  {
                     // console.log(hash);
                          // var dt = dateTime.create();
                          // var d = dt.format('Y-m-d H:M:S');
                          // var currentDate = d;
                          // var created_at = currentDate;


      var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var created_at=indiaTime.toLocaleString();



                          var TokendetailsData = new Tokendetails({
                       
                        
                          sender_wallet_address      :  sender_address,
                          receiver_wallet_address    :  reciver_address,
                          hash                       :  hash,
                          amount                     :  get_amount,
                          payment_status             :  'pending',
                          created_at                 :  created_at,
                          status                     :  'active',
                          token_type                 :  'ETH',
                          transaction_type           :  'Send'

                          });
                          TokendetailsData.save(function (err,doc) {
                          if (err){ console.log('token data is not save.');
                         } else {
                          req.flash('success', 'Your transaction in done.');
                          res.redirect('/Rowan-token-history');
                          }});
                        } 

                        else { 
                             req.flash('fail', "Insufficient funds In Your account.");
                            res.redirect('send_ether'); 
 
                             }
                    }).on('transactionHash');
            });
          }
          else
          {
                req.flash('fail', "Insufficient funds In Your account.");
                            res.redirect('send_ether'); 
          }
        });


            
          // }
          // });

        // }
        // });

        // });
        // });
       }
       else{
          res.write(response.statusCode.toString() + " " + error);
        }
      });
  }
  else
  {
    req.flash('fail', 'Please enter valid passphrase.');
    res.redirect('send_ether');
  }

});


     

routes.get('/test',(req,res)=>{

req.flash('success_logout', 'You have entered wrong email or password try again.');

res.redirect('/admin-login');

});
routes.get('/send_token',middleware_check_login,(req,res)=>{

// err_msg = req.flash('err_msg');
// success_msg = req.flash('success_msg');

AdminInfo.findOne().then((succ)=>{

		res.render('admin/admin-dashboard/send_token_admin.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,user_main_id:succ._id,expressFlash: req.flash()});

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});
	
	// res.render('admin/admin-dashboard/send_token_admin.hbs',req.flash());

});

routes.post('/submit-token',(req,res)=>{

	// var username = req.body.username;

	// var password = req.body.password;
	var user_id=req.body.user_m_id;
	// var user_correct_passphrese=req.body.user_cr_pass.trim();
	var entered_passphrese=req.body.enter_passphrase.trim();
	// var hashnew=crypto.createHash('sha256').update(entered_passphrese).digest('base64');

	var sender_address=req.body.sender_address.trim();
	var reciver_address=req.body.reciver_address.trim();
	var get_amount=req.body.amount_send.trim();

	if(entered_passphrese=='12345678')
  {

 var options = {  
        url: "http://45.252.190.5:8000",
        method: 'POST',
        headers:
        { 
         "content-type": "application/json"
        },
        body: JSON.stringify({"jsonrpc":"2.0","method":"personal_unlockAccount","params":[sender_address,entered_passphrese],"id":1})
      };
      request(options, function (error, response, body) {
       if (!error && response.statusCode == 200) {
         console.log(body);


           var options = {  
        url: "http://45.252.190.5:8000",
        method: 'POST',
        headers:
        { 
        "content-type": "application/json"
        },
        body: JSON.stringify({"jsonrpc":"2.0","method":"clique_getSigners","params":[],"id":1})
        };
        request(options, function (error5, response5, body5) {
        if (!error5 && response5.statusCode == 200) {
        var validators=JSON.parse(body5);
        var all_validators=validators.result;

          console.log("inside"+all_validators);
       
          var sender_private_key='E255E5565B6D62A7408630189E0ACE188773EC87F5A64FA79DE278F579E91429';
          var privateKey = Buffer.from(sender_private_key, 'hex');
        
            var tokenContractABI ='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardEthBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"timeStampForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardTo","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targetForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"epochCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MAXIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"miningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"challengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"solutionForChallenge","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestDifficultyPeriodStarted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MINIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"donation","type":"address"}],"name":"Donation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"donnationAddress","type":"address"}],"name":"DonationAddressOf","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"reward_amount","type":"uint256"},{"indexed":false,"name":"epochCount","type":"uint256"},{"indexed":false,"name":"newChallengeNumber","type":"bytes32"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getChallengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningDifficulty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"}],"name":"getMintDigest","outputs":[{"name":"digesttest","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"},{"name":"testTarget","type":"uint256"}],"name":"checkMintSolution","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"donationTo","outputs":[{"name":"donationAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"donationAddress","type":"address"}],"name":"changeDonation","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"},{"name":"donation","type":"address[]"},{"name":"admin","type":"address"}],"name":"transferAndDonateTo","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]'

             var user1=JSON.parse(tokenContractABI);
             var tokenContract = new web3js.eth.Contract(user1,"0x53218739EdEa3857148C931E0644AAC0C1368305");
             var count;

              tokenContract.methods.balanceOf(sender_address).call().then(function (result) {
            // console.log(result);
		          var count_balance = parseInt(result);
		          rown_bal=count_balance/Math.pow(10,10);
		          console.log(rown_bal);
          if(rown_bal >= get_amount)
          { 
                web3js.eth.getTransactionCount(sender_address).then(function(v) {
                console.log("Count: " + v);
                count = v;
                var amount = get_amount;

                var rawTransaction = {
                    "from": sender_address,
                    "gasPrice": '0x0',
                    "gasLimit": web3js.utils.toHex(4600000),
                    "to": '0x53218739EdEa3857148C931E0644AAC0C1368305',
                    "value": "0x0",
                    "data": tokenContract.methods.transferAndDonateTo(reciver_address, amount * Math.pow(10, 10),array_donation,'0xd44b028E32230DA41D024D16c0F7f6cE4902FB76').encodeABI(),
                    "nonce": web3js.utils.toHex(count)
                }
                // console.log(rawTransaction);
                var transaction = new Tx(rawTransaction);
                transaction.sign(privateKey);
                web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'), (err, hash) => {
                  if (hash !="" && hash!=null && hash!=undefined) 
                  // if(err)
                  {
                     // console.log(hash);
                          // var dt = dateTime.create();
                          // var d = dt.format('Y-m-d H:M:S');
                          // var currentDate = d;
                          // var created_at = currentDate;


      var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var created_at=indiaTime.toLocaleString();

      Tokendetails.count(function (err,respcount){
             var count_val=parseFloat(respcount)+parseFloat(1);

                          var TokendetailsData = new Tokendetails({
                       
                          auto                       :  count_val,
                          sender_wallet_address      :  sender_address,
                          receiver_wallet_address    :  reciver_address,
                          hash                       :  hash,
                          amount                     :  get_amount,
                          payment_status             :  'pending',
                          created_at                 :  created_at,
                          status                     :  'active',
                          token_type                 :  'RWN',
                          transaction_type           :  'Send'

                          });
                          TokendetailsData.save(function (err,doc) {
                          if (err){ console.log('token data is not save.');
                         } else {
                          req.flash('success', 'Your transaction in done.');
                          res.redirect('/Rowan-token-history');
                          }});
                        });
                        } 

                        else { 
                             req.flash('fail', "Insufficient funds In Your account.");
                            res.redirect('send_token'); 
 
                             }
                    }).on('transactionHash');
            });
          }
          else
          {
                req.flash('fail', "Insufficient funds In Your account.");
                            res.redirect('send_token'); 
          }
        });


            
          // }
          // });

        // }
        // });

        // });
        // });
      }
      });
       }
       else{
          res.write(response.statusCode.toString() + " " + error);
        }
      });
  }
  else
  {
    req.flash('fail', 'Please enter valid passphrase.');
    res.redirect('send_token');
  }

});

/*********Admin Login******/

routes.post('/submit-details',(req,res)=>{

	var username = req.body.username;

	var password = req.body.password;

	AdminInfo.checkUserLogin(username,password).then((success)=>{
  

		if(success){
			console.log(success._id);
			console.log(success.name);

			var user_details = {user_id: success._id,name: success.name};

			/******Store in session*******/
			
			req.session.user_main_id = user_details.user_id;
			
			req.session.user_name = user_details.name;

			req.session.profile_image = success.profile_image;



			
			/*******Call save function to store****/

			req.session.save(function(err) {
		        
		        console.log('saved?!');

		     });

			res.redirect('/admin-dashboard');
		}

	
	}).catch((e)=>{

		req.flash('fail', 'You have entered wrong email or password try again.');

		res.redirect('/admin-login');

	});

});

/********Redirect on Dashboard******/

routes.get('/admin-dashboard',middleware_check_login,(req,res)=>{

	var total_tokens_count = [];

	 async.parallel([
     
 //     function(callback) {

	//  VeriInfo.count({},function(err,total_kyc_received){
                
 //                if (err) return callback(err);
                
 //                kyc_receiveds = total_kyc_received;
                
 //                callback();
 //            });
	// },

	function(callback) {

		Tokendetails.count({},function(err,user2){
                
                if (err) return callback(err);
                
                total_orders = user2;
                
                callback();
            });

	},

	function(callback) {

		Registration.count({deleted:'0',status:'active'},function(err,user3){
                
                if (err) return callback(err);
                
                total_users = user3;
                
                callback();
            });
	
	},

	function(callback) {

                
                var tokenContractABI ='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardEthBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"timeStampForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardTo","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targetForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"epochCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MAXIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"miningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"challengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"solutionForChallenge","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestDifficultyPeriodStarted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MINIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"donation","type":"address"}],"name":"Donation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"donnationAddress","type":"address"}],"name":"DonationAddressOf","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"reward_amount","type":"uint256"},{"indexed":false,"name":"epochCount","type":"uint256"},{"indexed":false,"name":"newChallengeNumber","type":"bytes32"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getChallengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningDifficulty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"}],"name":"getMintDigest","outputs":[{"name":"digesttest","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"},{"name":"testTarget","type":"uint256"}],"name":"checkMintSolution","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"donationTo","outputs":[{"name":"donationAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"donationAddress","type":"address"}],"name":"changeDonation","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"},{"name":"donation","type":"address[]"},{"name":"admin","type":"address"}],"name":"transferAndDonateTo","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]'

             var user1=JSON.parse(tokenContractABI);
             
             var tokenContract = new web3js.eth.Contract(user1,"0x53218739EdEa3857148C931E0644AAC0C1368305");
             
             tokenContract.methods.balanceOf('0xd44b028E32230DA41D024D16c0F7f6cE4902FB76').call().then(function (result) {

             	   		//if (err) return callback(err);
             			
             			  count_balance = parseInt(result);
             			  // console.log(result);
             			  rown_bal=count_balance/Math.pow(10,10);
         				 
         				  rown_bal1 =rown_bal;
         				     web3js.eth.getBalance('0xd44b028E32230DA41D024D16c0F7f6cE4902FB76')
                                .then(function(balance1) {
                                	 count_balance1 = parseInt(balance1);

                                  actual_balance = count_balance1 / Math.pow(10, 18).toFixed(5);

         				 callback();
         		
                
              			
              			 // callback(1,2);

				//console.log(rown_bal)
					});
            		});
            				  
	
	}], function(err) { 
        
           // console.log(actual_balance);
            console.log(rown_bal)
         if (err) return next(err); 

        res.render('admin/admin-dashboard/main-dashboard.hbs',{
		
		Name:req.session.user_name,profile_image:req.session.profile_image,total_orders_s:total_orders,total_users_s:total_users,token_balance:rown_bal1,ether_balance:actual_balance});
         
    });
});

/****Logout user***/

routes.get('/logout1',(req,res)=>{
console.log("logout")
	req.session.destroy(function(err) {
	 
	console.log("in_logout")
	});

	 req.flash('success_logout', 'You have logged out successfully.');
	     
	 res.redirect('/admin-login');
});

/******List of all registered users*****/

routes.get('/registered-users',middleware_check_login,(req,res)=>{

	Registration.find({status:'active',deleted:'0'}).sort({_id: -1}).then((results)=>{

       //return res.send(results);
		if(results){
			// console.log(results);
    	res.render('admin/admin-dashboard/users_list.hbs',{expressFlash: req.flash(),user_details:results,Name:req.session.user_name,profile_image:req.session.profile_image});

		}

	},(error)=>{

		res.send('Something went wrong');

	}).catch((e)=>{

		res.send(e);

	});

});

/**********Edit users details******/

routes.get('/edit-user/:id',middleware_check_login,(req,res)=>{

	var user_main_id = req.params.id;

	Registration.findById({status:'active',deleted:'0','_id':user_main_id}).then((results)=>{

	if(results){

			res.render('admin/admin-dashboard/edit_user_view.hbs',{details:results,Name:req.session.user_name,profile_image:req.session.profile_image});
		}

	},(error)=>{

		res.send('Something went wrong');

	}).catch((e)=>{

		res.send(e);

	});


});
/**********Update user profile*******/

routes.post('/update-profile',middleware_check_login,upload.single('user_profile'),(req,res)=>{

	if (req.file) { 

			var profile_image = req.file.filename;
	
	} else { 

			var profile_image = req.body.user_pre_image;;

	 } 

	var username = req.body.user_name;
	
	var useremail = req.body.user_email;
	
	var mob = req.body.mobile_number;
	
	var wallet_address = req.body.wallet_adddress;
	
	var user_main_id_edit = req.body.user_m_id;
	
	var user_address = req.body.user_home_address;

	// var current_time = Date.now();

      var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var current_time1=indiaTime.toLocaleString();

	Registration.findByIdAndUpdate(user_main_id_edit,{$set:{profile_image:profile_image,name:username,mobile_no:mob,email:useremail,address:wallet_address,user_address:user_address,updated_at:current_time1,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			req.flash('edit_success', 'User profile has been updated successfully.');

			res.redirect('/registered-users');
		}
	
	},(error)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/registered-users');
	
	}).catch((e)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/registered-users');
	});


});

/**********Delete User******/

routes.get('/delete-user/:id',middleware_check_login,(req,res)=>{

	var current_time = Date.now();

	var user_main_id_delete = req.params.id;

	Registration.findByIdAndUpdate(user_main_id_delete,{$set:{deleted:'1',updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			req.flash('edit_success', 'User has been deleted successfully.');

			res.redirect('/registered-users');
		}
	
	},(error)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/registered-users');
	
	}).catch((e)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/registered-users');
	});

});

/****Set Token Data******/

routes.get('/token-setting',middleware_check_login,(req,res)=>{

TokenInfo.findOne({status:'active',deleted:'0'}).then((success_response)=>{

	if(success_response){

		res.render('admin/admin-dashboard/token_setting.hbs',{expressFlash: req.flash(),token_data:success_response,Name:req.session.user_name,profile_image:req.session.profile_image});
		
	}
},(err)=>{

	res.send('Something went wrong try again');


}).catch((e)=>{

	res.send('Something went wrong try again');
});

});

/****update token****/

routes.post('/update-token-details',middleware_check_login,(req,res)=>{

	var current_time = Date.now();

	var user_main_id_up = req.body.edit_id;

	var token_name = req.body.token_name;
	
	var qtys = req.body.total_quantity;
	
	var re_qtys = req.body.remaining_quantity;
	
	var ethvalue = req.body.eather_value;

	TokenInfo.findByIdAndUpdate(user_main_id_up,{$set:{token_name:token_name,token_quantity:qtys,token_remaining_quantity:re_qtys,token_eather_value:ethvalue,updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			req.flash('token_success', 'Token details has been updated successfully.');

			res.redirect('/token-setting');
		}
	
	},(error)=>{

		req.flash('token_fail', 'Something went wrong try again.');

		res.redirect('/token-setting');
	
	}).catch((e)=>{

		req.flash('token_fail', 'Something went wrong try again.');

		res.redirect('/token-setting');
	});

});

/****Verification Details****/

routes.get('/verification-details',middleware_check_login,(req,res)=>{

	VeriInfo.find().populate({ path: 'user_id',
		
		match:{}, 
		
		select: 'name email address'}).sort({_id: -1}).then((success_data)=>{
		
		res.render('admin/admin-dashboard/verification_details.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,veri_details:success_data,expressFlash: req.flash()});

	},(error)=>{

		console.log(error);
	});

});

/****Update KYC Status****/

routes.get('/update-kyc-status',middleware_check_login,(req,res)=>{

	var current_time = Date.now();

	var get_prim_id = req.query.prime_id;
	
	var change_status = req.query.value;

	VeriInfo.findByIdAndUpdate(get_prim_id,{$set:{id_verify_status:change_status,taking_status:'0',updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			if(change_status == 'Pending'){

				var mail_message = "We have received your KYC Details.Our admin team will verify your details and completed your KYC details within 24 hours.";

				req.flash('update_status_fail', 'KYC has been moved in pending status successfully.');

			} else if(change_status == 'Rejected'){

				req.flash('update_status_fail', 'KYC has been rejected successfully.');

			} else if(change_status == 'Verified'){

				mail_message = 'Hi,' + '\n\n' + ' Your KYC has been approved by admin.\n\n' +
                                                'Thanks and Regards,' + '\n' + 'aGifttoken Team.' + '\n\n';

				// var mail_message = "Your KYC has been approved by admin.";

				req.flash('update_status_success', 'Document has been verified successfully.');

			}


			VeriInfo.findById({_id:get_prim_id}).then((success_details)=>{

				if(success_details){

					var user_id_kyc = success_details.user_id;

					Registration.findById({_id:user_id_kyc}).then((success_user_details)=>{

						var user_email_get =success_user_details.email;
						console.log("transporter" +transporter)
						

						var mailOptions = {
											  from: 'no-reply@agifttoken.com',
											  to: user_email_get,
											  subject: 'aGifttoken Document Verification',
											  text: mail_message
										   };

						transporter.sendMail(mailOptions, function(error, info){
							  
							  if (error) {
							    
							    console.log(error);
							  
							  } else {
							    
							    console.log('Email sent: ' + info.response);
							  
							  }
							
						});

					});

				}


			});

			res.redirect('/verification-details');
		}
	
	},(error)=>{

		req.flash('update_status_fail', 'Something went wrong please try again.');

		res.redirect('/verification-details');
	
	}).catch((e)=>{

		req.flash('update_status_fail', 'Something went wrong please try again.');

		res.redirect('/verification-details');
	});


});

/*******Update rejected KYC******/

routes.post('/update-kyc-status-rejection',middleware_check_login,(req,res)=>{

	var current_time = Date.now();

	var get_prim_id = req.body.doc_fin_status_id;
	
	var change_status = req.body.doc_fin_status;
	
	var reject_reason = req.body.reject_reason;

	VeriInfo.findByIdAndUpdate(get_prim_id,{$set:{id_verify_status:change_status,updated_at:current_time,reason_of_rejection:reject_reason,taking_status:'1',updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			if(change_status == 'Pending'){

				req.flash('update_status_fail', 'Document has been moved in pending status successfully.');

			} else if(change_status == 'Rejected'){
				var mail_message = 'Hi,' + '\n\n' + ' Due to '+reject_reason+' Your KYC has been rejected please upload your KYC Details again.\n\n' +
                                                  '\n\n' + 'Thanks and Regards,' + '\n' + 'aGifttoken Team.' + '\n\n'
				// var mail_message = "Due to "+reject_reason+" Your KYC has been rejected please upload your KYC Details again.";

				req.flash('update_status_fail', 'Document has been rejected successfully.');

			} else if(change_status == 'Verified'){

				req.flash('update_status_success', 'Document has been verified successfully.');

			}


			VeriInfo.findById({_id:get_prim_id}).then((success_details)=>{

				if(success_details){

					var user_id_kyc = success_details.user_id;

					Registration.findById({_id:user_id_kyc}).then((success_user_details)=>{

						var user_email_get =success_user_details.email;

						var mailOptions = {
											  from: 'no-reply@agifttoken.com',
											  to: user_email_get,
											  subject: 'aGift Token Document Verification Alert',
											  text: mail_message
										   };

						transporter.sendMail(mailOptions, function(error, info){
							  
							  if (error) {
							    
							    console.log(error);
							  
							  } else {
							    
							    console.log('Email sent: ' + info.response);
							  
							  }
							
						});

					});

				}


			});

			res.redirect('/verification-details');
		}
	
	},(error)=>{

		req.flash('update_status_fail', 'Something went wrong please try again.');

		res.redirect('/verification-details');
	
	}).catch((e)=>{

		req.flash('update_status_fail', 'Something went wrong please try again.');

		res.redirect('/verification-details');
	});


});

/***See Ether History*****/

routes.get('/ether-history',middleware_check_login,(req,res)=>{

 EtherInfo.find({deleted:'0'}).then((success_response)=>{


  	res.render('admin/admin-dashboard/ether_history.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,ether_data:success_response});

  },(err)=>{

  	res.send('something went wrong try again');

  }).catch((e)=>{

  	res.send('something went wrong try again');

  });


});


/*****aGift Token******/

routes.get('/Rowan-token-history',middleware_check_login,(req,res)=>{

 Tokendetails.find({deleted:'0'}).sort([['auto', -1]]).then((success_response)=>{

  
  	res.render('admin/admin-dashboard/gift_token_history.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,ether_data:success_response});

 },(err)=>{

  	res.send('something went wrong try again');

  }).catch((e)=>{

  	res.send('something went wrong try again');

  });
Tokendetails.find({'payment_status':'pending'},function (err,response) {
  if(response!= "" && response!=null && response!=undefined)
  {
      for(var i=0; i<response.length; i++)
      {
      console.log(response.length);
      check_tx_status(response[i].hash,response[i]._id,function(err,respo)
      {
      console.log(respo);
      });
      }
  }
  else
  {
  console.log('no record found.');
  }

  });
  // }
  // else{
  // console.log('error' + response.statusCode);
  // }
  // });
  // },60000);


//////////////////////////////

function check_tx_status(tx_hash,tx_id,callback){
var options = {  
url: "http://45.252.190.5:8000",
method: 'POST',
headers:
{ 
"content-type": "application/json"
},
body: JSON.stringify({"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":[tx_hash],"id":1})
};
request(options, function (error, response, body) {
if (!error && response.statusCode == 200) {
     var resu=JSON.parse(body);
     var send_resu=resu.result;
     console.log(send_resu);
     if(send_resu!=null && send_resu!="" && send_resu!=undefined)
     {
        Tokendetails.updateOne({'_id':tx_id}, {$set: { 'payment_status': 'paid' }}, {upsert: true}, function(err,result){
        if (err){ console.log(err); } 
        else 
        { 
             return callback(null,'tx success');
        }});
     }
     else
     {
        return callback(null,'tx pending.');
     }
 
}else{

return callback(null,error);
}
});
}


});

/***Manage Account Super Admin****/

routes.get('/manage-accounts',middleware_check_login,(req,res)=>{

  AdminInfo.findOne().then((succ)=>{

    res.render('admin/admin-dashboard/edit_admin_details.hbs',{Name:req.session.user_name,name:succ.name,email:succ.email,mobile:succ.mobile,contract_address:succ.contract_address,profile_image:succ.profile_image,user_main_id:succ._id,expressFlash: req.flash()});

  },(err)=>{

    res.send('Some thing went wrong try again.');

  }).catch((e)=>{

    res.send('Some thing went wrong try again.');

  });

});

/***********Update admin profile******/
routes.post('/update2-profile-admin',middleware_check_login,(req,res)=>{
  // console.log(req.body);
  // console.log(req.files.image)
var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
   if(imageFile != "")
   {
     profile_image=imageFile;
   }
   else
   {
    if(req.body.user_pre_image != "" && req.body.user_pre_image != undefined)
    {
     profile_image=req.body.user_pre_image;
    }
    else
    {
      profile_image="";
    }
   }

   var username = req.body.user_name;
  
  var useremail = req.body.user_email;
  
  var mob = req.body.mobile_number;
  
  // var wallet_address = req.body.wallet_adddress;
  
  var user_main_id_up = req.body.user_m_id;
  
  var current_time = Date.now();
  // console.log(profile_image);

  
 var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var current_time=indiaTime.toLocaleString();
      // console.log(currentDate);

  AdminInfo.findByIdAndUpdate(user_main_id_up,{$set:{profile_image:profile_image,name:username,mobile:mob,email:useremail,updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

    console.log(success);

           
    if(success){

      mkdirp('public/upload_admin_profile/', function (err) { });
            if (imageFile != "") {
              var imgpath = 'public/upload_admin_profile/'+ imageFile;
              req.files.image.mv(imgpath, function (err) { });
            }


      // use update name and profile image //

       req.session.user_name = success.name;

       req.session.profile_image = success.profile_image;


      req.flash('edit_success', 'Admin profile has been updated successfully.');

      res.redirect('/manage-accounts');
    }
  
  },(error)=>{

    req.flash('edit_fail', 'Something went wrong try again.');

    res.redirect('/manage-accounts');
  
  }).catch((e)=>{

    req.flash('edit_fail', 'Something went wrong try again.');

    res.redirect('/manage-accounts');
  });






});


routes.post('/update1-profile-admin',middleware_check_login,upload_admin,(req,res)=>{

  console.log(req.body.user_name);

  if (req.file) { 

      var profile_image = req.file.filename;
  
  } else { 

      var profile_image = req.body.user_pre_image;

   } 

  var username = req.body.user_name;
  
  var useremail = req.body.user_email;
  
  var mob = req.body.mobile_number;
  
  var wallet_address = req.body.wallet_adddress;
  
  var user_main_id_up = req.body.user_m_id;
  
  var current_time = Date.now();

  AdminInfo.findByIdAndUpdate(user_main_id_up,{$set:{profile_image:profile_image,name:username,mobile:mob,email:useremail,contract_address:wallet_address,updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

           
    if(success){

      // use update name and profile image //

       req.session.user_name = success.name;

       req.session.profile_image = success.profile_image;


      req.flash('edit_success', 'Admin profile has been updated successfully.');

      res.redirect('/manage-accounts');
    }
  
  },(error)=>{

    req.flash('edit_fail', 'Something went wrong try again.');

    res.redirect('/manage-accounts');
  
  }).catch((e)=>{

    req.flash('edit_fail', 'Something went wrong try again.');

    res.redirect('/manage-accounts');
  });


});
/********Change Password Admin*******/

routes.get('/change-password-admin',middleware_check_login,(req,res)=>{

	AdminInfo.findOne().then((succ)=>{

		res.render('admin/admin-dashboard/change_admin_password.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,user_main_id:succ._id,expressFlash: req.flash()});

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});
});

/***********Update Admin Password******/

routes.post('/update-password-admin',middleware_check_login,(req,res)=>{

	var user_main_id = req.body.user_m_id;

	var old_password = req.body.current_password;

	var new_pass = req.body.new_password;


	AdminInfo.checkUserPassword(user_main_id,old_password,new_pass).then((success)=>{

		req.flash('success', 'Password updated successfully.');

		res.redirect('/change-password-admin');

	},(err)=>{

		req.flash('fail', 'You entered wrong old password.');

		res.redirect('/change-password-admin');

	}).catch((e)=>{

		req.flash('fail', 'Something went wrong.');

		res.redirect('/change-password-admin');
	});

});

/*******Contact Enquiry*****/

routes.get('/all-enquiries',middleware_check_login,(req,res)=>{

	ContactInfo.find({deleted:"0",user_status:'Active'}).sort({_id: -1}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/contacts_list.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,contactDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}


	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});

});

/********News letter subscribers******/

routes.get('/newsletter-subscribers',middleware_check_login,(req,res)=>{

	NewsInfo.find({deleted:"0",user_status:'Active'}).sort({_id: -1}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/newsletter_subscribers.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,contactDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}


	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});

});


/**********Delete User******/

routes.get('/delete-subscriber/:id',middleware_check_login,(req,res)=>{

	var current_time = Date.now();

	var user_main_id_delete = req.params.id;

	NewsInfo.findByIdAndUpdate(user_main_id_delete,{$set:{deleted:'1',updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			req.flash('edit_success', 'Subscriber has been removed successfully.');

			res.redirect('/newsletter-subscribers');
		}
	
	},(error)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/newsletter-subscribers');
	
	}).catch((e)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/newsletter-subscribers');
	});

});

/*********Basic settings********/

routes.get('/basic-settings',middleware_check_login,(req,res)=>{

	BasictInfo.findOne({deleted:"0",user_status:'Active'}).then((success)=>{

		console.log(success);
 
		if(success){

			res.render('admin/admin-dashboard/basic_settings.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,basicDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}


	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});

});

/************Update Basic Settings*********/

routes.post('/update-token-basic-details',(req,res)=>{
 
	var current_time = Date.now();
	var user_main_id_up = req.body.edit_id;
	var token_name = req.body.token_name;
	var token_symbols = req.body.token_symbol;
	var project_protocol = req.body.project_protocol;
	var total_sales_reached = req.body.total_sales_reached;
	var worth_gift_token = req.body.worth_gift_token;
	var token_issued = req.body.token_issued;
	var hard_cap = req.body.hard_cap;
	var soft_cap = req.body.soft_cap;
	var toal_sales_reached = req.body.toal_sales_reached;
	var exchange_rate = req.body.exchange_rate;
	var sale_start = req.body.sale_start;
	//var sale_end = req.body.sale_end;
	var total_token_supply = req.body.token_total_supply;

	var gift_token_price = req.body.gift_token_price;
	
	BasictInfo.findByIdAndUpdate(user_main_id_up,
		{$set:{
			token_name:token_name,
			token_symbol:token_symbols,
			project_protocol:project_protocol,
			worth_gift_token:worth_gift_token,
			token_issued:token_issued,
			hard_cap:hard_cap,
			soft_cap:soft_cap,
			exchange_rate:exchange_rate,
			start_date:sale_start,
			//end_date:sale_end,
			total_sales_reached:total_sales_reached,
			updated_at:current_time,
			total_token_supply:total_token_supply,
			gift_token_price:gift_token_price,

			updated_by:req.session.user_main_id
			}
		},{new:true}).then((success)=>{

		if(success){

			req.flash('token_success', 'Token details has been updated successfully.');

			res.redirect('/basic-settings');
		}
	
	},(error)=>{

		req.flash('token_fail', 'Something went wrong try again.');

		res.redirect('/basic-settings');
	
	}).catch((e)=>{

		req.flash('token_fail', 'Something went wrong try again.');

		res.redirect('/basic-settings');
	});

});

/********Add Team Members******/

routes.get('/add-team-member',middleware_check_login,(req,res)=>{

	res.render('admin/admin-dashboard/add_team_members.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,expressFlash: req.flash()});
});


/********Save Member Details*****/

routes.post('/submit-team-member-data',upload_member_profile.single('user_profile'),(req,res)=>{

	if (req.file) { 

			var profile_image = req.file.filename;
	
	} else { 

			var profile_image =  req.body.user_pre_image;

	 } 

	var name = req.body.member_name;

	var title = req.body.member_designation;
	
	var description = req.body.member_desc;

	var email = req.body.member_email;
	
	var phone = req.body.mobile_number;
	
	var facebook = req.body.facebook_url;
	
	var twitter = req.body.twitter_url;
	
	var linkedin = req.body.linkedin_url;
		
	var member_status = req.body.member_status;

	var current_time = Date.now();
   
	var submit_construct = new TeamMemberInfo({
		member_name:name,
		member_sub_title:title,
		member_description:description,
		member_email:email,
		member_phone:phone,
		member_facebook:facebook,
		member_twitter:twitter,
		member_linkedin:linkedin,
		member_image:profile_image,
		user_status:member_status,
		created_by:req.session.user_main_id,
		created_at:current_time
	});

	submit_construct.save().then((done)=>{

		if(done){

			req.flash('edit_success', 'Member Added Successfully.');

			res.redirect('/members-list');

		} else {

			req.flash('fail', 'Something went wrong try again.');

			res.redirect('/add-team-member');
			
		}

	},(err)=>{

		req.flash('fail', 'Something went wrong try again.');

		res.redirect('/add-team-member');


	}).catch((e)=>{

		req.flash('fail', 'Something went wrong try again.');

		res.redirect('/add-team-member');

	});
});


/***********All Members List*****/

routes.get('/members-list',middleware_check_login,(req,res)=>{

	TeamMemberInfo.find({deleted:"0"}).sort({_id: -1}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/team_members_list.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,memberDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});

});

/**********Edit Members******/

routes.get('/edit-team-member/:id',middleware_check_login,(req,res)=>{

	var user = req.params.id;

	TeamMemberInfo.findById({_id:user}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/edit_team_members.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,memberDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});


});


/********Update Member Profile******/

routes.post('/update-team-member-data',upload_member_profile.single('user_profile'),(req,res)=>{

	if (req.file) { 

			var profile_image = req.file.filename;
	
	} else { 

			var profile_image = req.body.user_pre_image;

	 } 

	var name = req.body.member_name;

	var current_time = Date.now();

	var title = req.body.member_designation;
	
	var description = req.body.member_desc;

	var email = req.body.member_email;
	
	var phone = req.body.mobile_number;
	
	var facebook = req.body.facebook_url;
	
	var twitter = req.body.twitter_url;
	
	var linkedin = req.body.linkedin_url;
		
	var member_status = req.body.member_status;

	var user_main_id_edit = req.body.user_m_id;


	TeamMemberInfo.findByIdAndUpdate(user_main_id_edit,
		{$set:{
				member_name:name,
				member_sub_title:title,
				member_description:description,
				member_email:email,
				member_phone:phone,
				member_facebook:facebook,
				member_twitter:twitter,
				member_linkedin:linkedin,
				member_image:profile_image,
				user_status:member_status,
				updated_by:req.session.user_main_id,
				updated_at:current_time
			}
	},{new:true}).then((success)=>{

		if(success){

			req.flash('edit_success', 'Member Details Updated Successfully.');

			res.redirect('/members-list');

		} else {

			req.flash('edit_fail', 'Something went wrong try again.');

			res.redirect('/members-list');
			
		}

	},(err)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/members-list');

	}).catch((e)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/members-list');

	});
});

/*****Delete Members*****/

routes.get('/delete-member/:id',middleware_check_login,(req,res)=>{

	var current_time = Date.now();

	var user_main_id_delete = req.params.id;

	TeamMemberInfo.findByIdAndUpdate(user_main_id_delete,{$set:{deleted:'1',updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			req.flash('edit_success', 'Member has been deleted successfully.');

			res.redirect('/members-list');
		}
	
	},(error)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/members-list');
	
	}).catch((e)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/members-list');
	});

});

/********New work********/

routes.get('/add-news',middleware_check_login,(req,res)=>{

	res.render('admin/admin-dashboard/add_news.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,expressFlash: req.flash()});
});

/********Save Member Details*****/

routes.post('/submit-news-details',upload_news_profile.single('user_profile'),(req,res)=>{

	if (req.file) { 

			var news_image = req.file.filename;
	
	} else { 

			var news_image =  '';

	 } 

	var news_title = req.body.news_heading;

	var news_desc = req.body.news_desc;
			
	var news_status = req.body.news_status;
	var current_time = Date.now();

	var submit_construct = new NewsDetailsInfo({
		news_title:news_title,
		news_desc:news_desc,
		news_image:news_image,
		news_status:news_status,
		created_by:req.session.user_main_id,
		created_at:req.session.current_time
	});

	submit_construct.save().then((done)=>{

		if(done){

			req.flash('edit_success', 'News Added Successfully.');

			res.redirect('/news-list');

		} else {

			req.flash('fail', 'Something went wrong try again.');

			res.redirect('/add-news');
			
		}

	},(err)=>{

		req.flash('fail', 'Something went wrong try again.');

		res.redirect('/add-news');


	}).catch((e)=>{

		req.flash('fail', 'Something went wrong try again.');

		res.redirect('/add-news');

	});
});


/*********News List*******/

routes.get('/news-list',middleware_check_login,(req,res)=>{


NewsDetailsInfo.find({deleted:"0"}).sort({_id: -1}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/news_list.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,newsDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});

});

/**********Edit News**********/

routes.get('/edit-news/:id',middleware_check_login,(req,res)=>{

	var user = req.params.id;

	NewsDetailsInfo.findById({_id:user}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/edit_news.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,newsDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});


});


/*******Update News**********/

routes.post('/update-news-details',upload_news_profile.single('user_profile'),(req,res)=>{

	if (req.file) { 

			var news_image = req.file.filename;
	
	} else { 

			var news_image =  req.body.user_pre_image;

	 } 

	var news_title = req.body.news_heading;

	var current_time = Date.now();
	console.log("current_time" +current_time);

	var news_desc = req.body.news_desc;
			
	var news_status = req.body.news_status;

	var user_main_id_edit = req.body.user_m_id;

	NewsDetailsInfo.findByIdAndUpdate(user_main_id_edit,
		{$set:{
				news_title:news_title,
				news_desc:news_desc,
				news_image:news_image,
				news_status:news_status,
				updated_by:req.session.user_main_id,
				updated_at:current_time
			}
	},{new:true}).then((success)=>{

		if(success){

			req.flash('edit_success', 'News Details Has Been Updated Successfully.');

			res.redirect('/news-list');

		} else {

			req.flash('edit_fail', 'Something went wrong try again.');

			res.redirect('/news-list');
			
		}

	},(err)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/news-list');

	}).catch((e)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/news-list');

	});
});

/***********Delete News********/

routes.get('/delete-news-details/:id',(req,res)=>{

	var current_time = Date.now();

	var user_main_id_delete = req.params.id;

	NewsDetailsInfo.findByIdAndUpdate(user_main_id_delete,{$set:{deleted:'1',updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			req.flash('edit_success', 'News has been deleted successfully.');

			res.redirect('/news-list');
		}
	
	},(error)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/news-list');
	
	}).catch((e)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/news-list');
	});

});

/*********Country Listing*********/

routes.get('/country-list',(req,res)=>{

	CountryInfo.find({deleted:"0"}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/country_list.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,countryDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});

});

/**********Add Country*********/

routes.get('/add-country',(req,res)=>{


	res.render('admin/admin-dashboard/add_country.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,expressFlash: req.flash()});

});

/**save country data**/

routes.post('/add-submit-country',(req,res)=>{

	
	var country_name = req.body.country_name;
	
	var status_c = req.body.contry_status;

	CountryInfo.findOne({deleted:'0',country_name:country_name}).then((success_counts)=>{

		if(success_counts){

			req.flash('fail', 'Country name already exist. Please try again.');

			res.redirect('/add-country');

		} else {

			var submit_construct = new CountryInfo({
														country_name:country_name,
														status:status_c,
														created_by:req.session.user_main_id
												 });

			submit_construct.save().then((done)=>{

			if(done){

				req.flash('edit_success', 'Country Added Successfully.');

				res.redirect('/country-list');

			} else {

				req.flash('fail', 'Something went wrong try again.');

				res.redirect('/add-country');
				
			}

			},(err)=>{

				req.flash('fail', 'Something went wrong try again.');

				res.redirect('/add-country');


			}).catch((e)=>{

				req.flash('fail', 'Something went wrong try again.');

				res.redirect('/add-country');

			});
		
		}

	});

});

/******Edit Country******/

routes.get('/edit-country/:id',middleware_check_login,(req,res)=>{

	var user = req.params.id;

	CountryInfo.findById({_id:user}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/edit_country.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,countryDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});


});

/*********Update Details******/

routes.post('/update-submit-country',(req,res)=>{

	var country_name = req.body.country_name;
	
	var country_name_pre = req.body.pre_country_name;

	var current_time = Date.now();
			
	var status = req.body.contry_status;

	var user_main_id_edit = req.body.user_m_id;

	if(country_name != country_name_pre){

		CountryInfo.findOne({deleted:'0',country_name:country_name}).then((success_counts)=>{

			if(success_counts){

				req.flash('edit_fail', 'Country name already exist.');

				res.redirect('/country-list');

			} else {

				CountryInfo.findByIdAndUpdate(user_main_id_edit,
						{$set:{
								country_name:country_name,
								status:status,
								updated_by:req.session.user_main_id,
								updated_at:current_time
							}
					},{new:true}).then((success)=>{

						if(success){

							req.flash('edit_success', 'Country Details Has Been Updated Successfully.');

							res.redirect('/country-list');

						} else {

							req.flash('edit_fail', 'Something went wrong try again.');

							res.redirect('/country-list');
							
						}

					},(err)=>{

						req.flash('edit_fail', 'Something went wrong try again.');

						res.redirect('/country-list');

					}).catch((e)=>{

						req.flash('edit_fail', 'Something went wrong try again.');

						res.redirect('/country-list');

					});

			}

		});

	} else {

				CountryInfo.findByIdAndUpdate(user_main_id_edit,
						{$set:{
								country_name:country_name,
								status:status,
								updated_by:req.session.user_main_id,
								updated_at:current_time
							}
					},{new:true}).then((success)=>{

						if(success){

							req.flash('edit_success', 'Country Details Has Been Updated Successfully.');

							res.redirect('/country-list');

						} else {

							req.flash('edit_fail', 'Something went wrong try again.');

							res.redirect('/country-list');
							
						}

					},(err)=>{

						req.flash('edit_fail', 'Something went wrong try again.');

						res.redirect('/country-list');

					}).catch((e)=>{

						req.flash('edit_fail', 'Something went wrong try again.');

						res.redirect('/country-list');

					});

		}

});


/*****Delete Country****/

routes.get('/delete-country-details/:id',(req,res)=>{

	var current_time = Date.now();

	var user_main_id_delete = req.params.id;

	CountryInfo.findByIdAndUpdate(user_main_id_delete,{$set:{deleted:'1',updated_at:current_time,updated_by:req.session.user_main_id}},{new:true}).then((success)=>{

		if(success){

			req.flash('edit_success', 'Country has been deleted successfully.');

			res.redirect('/country-list');
		}
	
	},(error)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/country-list');
	
	}).catch((e)=>{

		req.flash('edit_fail', 'Something went wrong try again.');

		res.redirect('/country-list');
	});

});

/************State work statrt******/

routes.get('/state-list',(req,res)=>{

	StateInfo.find({deleted:"0"}).populate({ path: 'country_id',
		
		match:{}, 
		
		select: 'country_name'}).then((success)=>{
       
		if(success){

			res.render('admin/admin-dashboard/state_list.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,stateDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});

});


/**********Add State*********/

routes.get('/add-state',(req,res)=>{

	CountryInfo.find({deleted:"0",status:'Active'}).then((success)=>{

		if(success){

			res.render('admin/admin-dashboard/add_state.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,countryDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Something went wrong');
		}

	});

});

/*****save country data*****/

routes.post('/add-submit-state',(req,res)=>{

	var state_name = req.body.state_name;
	
	var status_c = req.body.state_status;
	
	var country_name = req.body.country_name;

	StateInfo.findOne({deleted:'0',state_name:state_name}).then((success_counts)=>{

		if(success_counts){

			req.flash('fail', 'State name already exist. Please try again.');

			res.redirect('/add-state');

		} else {

			var submit_construct = new StateInfo({
														state_name:state_name,
														status:status_c,
														country_id:country_name,
														created_by:req.session.user_main_id
												 });

			submit_construct.save().then((done)=>{

			if(done){

				req.flash('edit_success', 'State Added Successfully.');

				res.redirect('/state-list');

			} else {

				req.flash('fail', 'Something went wrong try again.');

				res.redirect('/add-state');
				
			}

			},(err)=>{

				req.flash('fail', 'Something went wrong try again.');

				res.redirect('/add-state');


			}).catch((e)=>{

				req.flash('fail', 'Something went wrong try again.');

				res.redirect('/add-state');

			});
		
		}

	});

});

/******Edit State******/

routes.get('/edit-state/:id',middleware_check_login,(req,res)=>{

	var user = req.params.id;

	StateInfo.findById({_id:user}).then((success)=>{

		if(success){

			CountryInfo.find({deleted:"0",status:'Active'}).then((success_counts)=>{

				if(success_counts){

						//console.log(success_counts);

						res.render('admin/admin-dashboard/edit_state.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,stateDetails:success,contsDetails:success_counts,expressFlash: req.flash()});
					
				
				} else {


						res.send('Country Not Found.');
				}

			});
			
		} else {

			res.send('Some thing went wrong try again.');
		}

	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});


});


/********Forget Password get*****/

routes.get('/forgot',(req,res)=>{

	res.render('admin/admin-login/forget_password.hbs',req.flash());

});

/********Forget Password POST*****/

routes.post('/forgot',(req,res)=>{

 var email = req.body.email;
 console.log(email);
 AdminInfo.findOne({email,email}).then((success)=>{
 
  	if(success){
      
    var user_email_get = success.email;
    
       // use genrate new password 
             var length = "6";
             var newpass = Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
 	         var NewPass = ""+newpass+"";
            
               bcrypt.genSalt(10, function (err, salt) {
               bcrypt.hash(NewPass, salt, function (err, hash) {
   
               adminpass = {password:hash};
             
               AdminInfo.findByIdAndUpdate(success._id,{$set:adminpass},{new:true},function(err,result){
                  if(err){
                      req.flash('fail', err);
                     res.redirect('/forgot');
                  }else{
                  
                      mail_message = "Your New Password :"+newpass;
                  	 var mailOptions = {
								   from: 'no-reply@agifttoken.com',
								    to: user_email_get,
									subject: 'Forgot Password',
									text: mail_message
								 };


         

						transporter.sendMail(mailOptions, function(error, info){
							  
							  if (error) {
							    console.log(error);

							    req.flash('fail', 'You have entered wrong email try again.');
                                res.redirect('/forgot');
							  
							  } else {
							    
							     console.log('Email sent: ' + info.response);
							    req.flash('success_logout', 'Password Reset Successfully Check Your Email.');
                                res.redirect('/admin-login');
							 
							  }
						});
                    }
                 })
               })
             })   

		}else{
			req.flash('fail', 'You have entered wrong email try again.');
            res.redirect('/forgot');
		}

	
	}).catch((e)=>{
      	req.flash('fail', 'You have entered wrong email try again.');
        res.redirect('/forgot');

	});
  

});

//************** remove profile image********* //


routes.post('/remove_profile_image',middleware_check_login,(req,res)=>{


    var admin_id = req.session.user_main_id;
	
    
	AdminInfo.findByIdAndUpdate(admin_id,{$set:{profile_image:""}},{new:true}).then((success)=>{
      res.send(success);
		if(success){
           res.send("success");
	    }
	
	},(error)=>{

		res.send("error");
	
	}).catch((e)=>{
        return res.send(e);
		res.send("0");
	});


});
// for mail-configuration//////////

routes.get('/mail-setting',middleware_check_login,(req,res)=>{

	MailInfo.findOne({deleted:"0",user_status:'Active'}).then((success)=>{

		console.log(success);
 
		if(success){

			res.render('admin/admin-dashboard/mail_settings.hbs',{Name:req.session.user_name,profile_image:req.session.profile_image,basicDetails:success,expressFlash: req.flash()});
			
		} else {

			res.send('Some thing went wrong try again.');
		}


	},(err)=>{

		res.send('Some thing went wrong try again.');

	}).catch((e)=>{

		res.send('Some thing went wrong try again.');

	});

});
//////////update mail-details //////////
routes.post('/update-mail-details',(req,res)=>{
 
	
	var user_name = req.body.user_name;
	var userpass = req.body.userpass;
	var user_main_id_up = req.body.edit_id;

	/////////for password encryption//////
	var mailpass = crypto.createCipher('aes-128-cbc', 'mypassword1');
	var mailops_pass = mailpass.update(req.body.userpass, 'utf8', 'hex')
	mailops_pass += mailpass.final('hex');
	console.log("mail1"+mailops_pass);
	/////////end password encryption//////
	
	MailInfo.findByIdAndUpdate(user_main_id_up,
		{$set:{
			user_name:user_name,
			userpass:mailops_pass,
			

			updated_by:req.session.user_main_id
			}
		},{new:true}).then((success)=>{

		if(success){

			req.flash('token_success', 'Email details has been updated successfully.');

			res.redirect('/mail-setting');
		}
	
	},(error)=>{

		req.flash('token_fail', 'Something went wrong try again.');

		res.redirect('/mail-setting');
	
	}).catch((e)=>{

		req.flash('token_fail', 'Something went wrong try again.');

		res.redirect('/mail-setting');
	});

});

module.exports = routes;


