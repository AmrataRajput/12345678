var express = require('express');
var app = express();
var ejs = require('ejs');
var bcrypt = require('bcryptjs');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var path = require('path');
var nodemailer = require('nodemailer');
const request = require('request');
const http = require('http');
var crypto = require('crypto');
const auth = require('../config/auth');
const keythereum = require("keythereum");
var bip39 = require('bip39');
var exec = require('child_process').exec;
var btoa = require('btoa');
const web3 = require('web3');
var qr = require('qr-image');  
var dateFormat = require('dateformat');
// var pagination = require('pagination');
// const quorumjs = require("quorum-js"); //for web3 extends

web3js = new web3(new web3.providers.HttpProvider("http://192.168.1.14:8000"));
 // web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/XMSYU3WSXHXSBNC81DCNJUZBZIVTBIN1HX"));
// var transporter = auth.transporter;
// use current time // 
var dateTime = require('node-datetime');

// Get Users model //
var {Registration,Userwallet,Importwallet,Tokendetails} = require('../models/contact');

var isUser = auth.isUser;


//************ to get user data on header using session **********//
app.use(function(req, res, next){
    res.locals.session = req.session;
    var user_id=res.locals.session.re_us_id;
     Registration.findOne({'_id': user_id},function(err,result)
      { 
        if(err){
          console.log('Something went wrong');

        }else{
          res.locals.greet = function(){
          return result;
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
         next();
        }
      });  
});





//************ root function **********//

app.get('/',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test == true) {
res.redirect('/Dashboard');
} else 
{
res.render('front/signup',{err_msg,success_msg,layout: false,session: req.session,}); 
}
})  

//***************** get signup **************//
app.get('/Signup',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test == true) {
res.redirect('/Dashboard');
} else 
{
 res.render('front/signup',{err_msg,success_msg,layout: false,session: req.session,});
}
}); 

//***************** post signup **************//
app.post('/submit_registration',function(req,res){
   var name       = req.body.name.trim();
   var email      = req.body.email.trim();
   var password     = req.body.password.trim();

   var dt = dateTime.create();
   var d = dt.format('Y-m-d H:M:S');
   var currentDate = d;
   var created_at = currentDate;

   var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
   var mystr = mykey.update(password, 'utf8', 'hex')
    mystr += mykey.final('hex');        
   Registration.find({'email': req.body.email},function(err,result){
		if (err) {
		req.flash('err_msg', 'Please enter valid Email.');
                res.redirect('/Signup')
		} else {
         if(result.length > 0)
         {
         	req.flash('err_msg', 'Email is already exists, please enter another Email.');
                res.redirect('/Signup')
         }
         else
         {
          var RegistartionData = new Registration({
                name                  :  name,
                first_name            :  name,
                last_name             :  '',
                email                 :  email,
                password              :  mystr,
                created_at            :  created_at,
                email_varify_status   :  '',
                mobile_no             :  '',
                address               :  '', 
                user_address          :  '',
                country               :  '',
                state                 :  '',
                city                  :  '',
                status                :  'active',
                profile_image         :  '',
             })
			RegistartionData.save(function (err,doc) {
				if (err){
				req.flash('err_msg', 'Please enter valid Email.');
                res.redirect('/Signup')
				} else 
				{
          // console.log(doc);
					var smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
					user: 'questtestmail@gmail.com',
					pass: 'test123R',
					}
					});
					const mailOptions = {
					to: email,
					from: 'amratarajput@pwavetech.com',
					subject: 'Rowan Energy Registration',

					text: 'Dear Customer,' + '\n\n' + 'Thank you for registering on Rowan Coin. Please use following login credentials.\n\n' +
					'Email: '+email+' \nPassword: '+password+

					'\n\nPlease click on below link to verify your Email.:\n\n' +

					'http://' + req.headers.host + '/email_verify/'+Buffer.from(email).toString('base64') + '\n\n' +
					'Thanks and Regards,' + '\n' + 'Rowan Energy Team' + '\n\n',
					};
                     smtpTransport.sendMail(mailOptions, function (err) {
                     req.flash('success_msg', 'Your registration has been completed successfully. Please check your Email and verify your account by clicking on the link. Please check your SPAM folder to in case the mail has gone to the SPAM folder.');
                     res.redirect('/Registration-success')
                      });                      
				}
				});
         }		
		}
   });       
});

//***************** get verfify email **************//
app.get('/email_verify/:token', (req, res) => {
	if(req.params.token)
	{
		var email=Buffer.from(req.params.token, 'base64').toString('ascii');
	    Registration.find({'email': email},function(err,result){
		if (err) {
		req.flash('err_msg', 'Your email verfication is not done please try again.');
        res.redirect('/Signup')
		} else 
		{ 
         	Registration.update({email:email}, {$set: { email_varify_status: 'verified' }}, {upsert: true}, function(err){
         		if (err){
				req.flash('err_msg', 'Your email verfication is not done please try again.');
                res.redirect('/Signup')
				} else 
				{ 
					req.flash('success_msg', 'Your email verfication is done successfully.');
                  res.redirect('/Login')
				}
		   })
                
		}
   });
	}
   });

//***************** get login **************//

app.get('/Login',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test == true) {
res.redirect('/Dashboard');
} else 
{
res.render('front/login',{err_msg,success_msg,layout: false,session: req.session,}) 
}
});


//***************** post  login**************//
app.post('/submit-login',function(req,res){ 
var mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
var mystr1 = mykey1.update(req.body.password, 'utf8', 'hex')
mystr1 += mykey1.final('hex');  
Registration.find({'email': req.body.email.trim(),'password':mystr1},function(err,result){
if (err) {
req.flash('err_msg', 'Please enter valid Email.');
res.redirect('/Login')
} else { 
  if(result.length > 0 && result.length==1 && result[0].email_varify_status!=undefined)
  {
    if(result[0].email_varify_status == 'verified')
    {
                req.session.success = true;
                req.session.re_us_id = result[0]._id;
                req.session.re_usr_name =result[0].name;
                req.session.re_usr_email = result[0].email;
                req.session.is_user_logged_in = true;
                res.redirect("/Dashboard");
    }
    else
    {
      req.flash('err_msg', 'Please verify the link which you received in your Email.');
      res.redirect('/Resend-link')
    }
  }
  else
  {
    req.flash('err_msg', 'Please enter valid Email and Password.');
    res.redirect('/Login')
  }

}
});
});


//***************** get reg success **************//
app.get('/Registration-success',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg'); 
var test = req.session.is_user_logged_in;
if (test == true) {
res.redirect('/Dashboard');
} else 
{
res.render('front/registration_success',{err_msg,success_msg,layout: false,session: req.session,}); 
}
}) 


/***************** get forgot pass **************//
app.get('/Forgot-password',function(req,res){
var test = req.session.is_user_logged_in;
if (test == true) {
res.redirect('/Dashboard');
} else 
{  
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
res.render('front/forgot-pass',{err_msg,success_msg,layout: false,session: req.session,});
}
}); 

//***************** post forgot pass **************//
app.post('/submit-forgot',function(req,res){  
Registration.find({'email': req.body.email.trim()},function(err,result){
if (err) {
req.flash('err_msg', 'Please insert Registered Email.');
res.redirect('/Forgot-password');
} else { 
  if(result.length > 0 && result.length ==1)
  {
    new_pass=Math.random().toString(36).slice(-5);
    var mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
   var mystr1 = mykey1.update(new_pass, 'utf8', 'hex')
    mystr1 += mykey1.final('hex'); 
    Registration.update({email:req.body.email.trim()}, {$set: { password: mystr1 }}, {upsert: true}, function(err){
        if (err){
        req.flash('err_msg', 'Something went wrong.');
        res.redirect('/Forgot-password')
        } else 
        { 

          var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
          user: 'questtestmail@gmail.com',
          pass: 'test123R',
          }
          });
          const mailOptions = {
          to: req.body.email.trim(),
          from: 'amratarajput@pwavetech.com',
          subject: 'Forgot Password',

          text: 'Dear Customer,' + '\n\n' + 'New Password form Rowan Coin.\n\n' +
          'Password: '+new_pass+ '\n http://' + req.headers.host + '/'+ '\n\n' +

          'We suggest you to please change your password after successfully logging in on the portal using the above password :\n\n' +

          'Here is the change password link: http://' + req.headers.host + '/Profile'+ '\n\n' +
          'Thanks and Regards,' + '\n' + 'Rowan Energy Team' + '\n\n',

          };
         smtpTransport.sendMail(mailOptions, function (err) {
         req.flash('success_msg', 'Password has been successfully sent to your email. In case you have not received any email, please check your spam folder also.');
         res.redirect('/Forgot-password')
          });
        }
      });
  }
  else
  {
    req.flash('err_msg', 'Please insert Registered Email.');
    res.redirect('/Forgot-password');
  }

}
});
}); 


//***************** get resend link **************//
app.get('/Resend-link',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test == true) {
res.redirect('/Dashboard');
} else 
{
res.render('front/resend_link',{err_msg,success_msg,layout: false,session: req.session,});
}
});


//***************** post resend link **************//
app.post('/submit-resend-link',function(req,res){  
var email=req.body.email.trim();
Registration.find({'email': email},function(err,result){
if (err) {
req.flash('err_msg', 'Please insert Registered Email.');
res.redirect('/Resend-link');
} else { 
  if(result.length > 0 && result.length ==1)
  {
    if(result[0].email_varify_status=='verified')
    {
       req.flash('err_msg', 'Your Email Verification is done you can login.');
       res.redirect('/Resend-link')

    }
    else
    {
      var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
          user: 'questtestmail@gmail.com',
          pass: 'test123R',
          }
          });
          const mailOptions = {
          to: email,
          from: 'amratarajput@pwavetech.com',
          subject: 'Rowan Energy Registration',

          text: 'Dear Customer,' + '\n\n' + 'Thank you for registering on Rowan Coin. Please use following login credentials.\n\n' +
          'Email: '+email+' \n'+

          'Please click on below link to verify your Email.:\n\n' +

          'http://' + req.headers.host + '/email_verify/'+Buffer.from(email).toString('base64') + '\n\n' +
          'Thanks and Regards,' + '\n' + 'Rowan Energy Team' + '\n\n',
          };
                     smtpTransport.sendMail(mailOptions, function (err) {
                     req.flash('success_msg', 'Please verify the link which you receive on Email.');
                     res.redirect('/Resend-link')
                      }); 
    }
  }
  else
  {
    req.flash('err_msg', 'Please insert Registered Email.');
    res.redirect('/Resend-link');
  }
}
});
}); 





//***************** get logout **************//
app.get('/Logout', function (req, res) {
var test = req.session.is_user_logged_in;
if (test == true) {
req.session.destroy(function (err) {
if (err) {
return err;
} else {
return res.redirect('/Login');
}
});
}
}); 

//***************** get profile **************//
app.get('/Profile',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;

if (test != true) {
res.redirect('/Login');
} else 
{
 var user_id=req.session.re_us_id;
Registration.find({'_id': user_id},function(err,result){
if (err) {
  console.log("Something went wrong");
}
else
{
  // res.send(result);
  res.render('front/profile',{err_msg,success_msg,result,layout: false,session: req.session,});
}
});

}

});


//***************** post update profile **************//
app.post('/update-profile',isUser,function(req,res){ 
  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
   if(imageFile != "")
   {
     user_image=imageFile;
   }
   else
   {
    if(req.body.old_image_name != "" && req.body.old_image_name != undefined)
    {
     user_image=req.body.old_image_name;
    }
    else
    {
      user_image="";
    }
   }
   var user_id=req.session.re_us_id;
   var user_first_name=req.body.first_name.trim();
   var user_last_name=req.body.last_name.trim();
   var profile_image=user_image.trim();
   var user_full_name=user_first_name+" "+user_last_name;
   Registration.update({_id:user_id}, {$set: {first_name:user_first_name,last_name:user_last_name,profile_image:profile_image,name:user_full_name}}, {upsert: true}, function(err,result)
     {
          if(err){
               console.log("Something went wrong");    
          }else{
           mkdirp('public/upload_user_profile/', function (err) { });
            if (imageFile != "") {
              var imgpath = 'public/upload_user_profile/'+ imageFile;
              req.files.image.mv(imgpath, function (err) { });
              req.flash('success_msg', 'Profile updated successfully.');
              res.redirect('/Profile')
                }
             else
             {
               req.flash('success_msg', 'Profile updated successfully.');
                  res.redirect('/Profile')
             }   
          }
     });
});




//***************** get changes password **************//
app.get('/Change-password',isUser,function(req,res){
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{  
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg'); 
res.render('front/change_password',{err_msg,success_msg,layout: false,session: req.session,}) 
}
});


//***************** post changes password **************//
app.post('/submit-change-pass',isUser,function(req,res){  
var user_id=req.session.re_us_id;
var old_pass=req.body.password;    
var mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
   var mystr1 = mykey1.update(old_pass, 'utf8', 'hex')
    mystr1 += mykey1.final('hex');
Registration.find({'_id':user_id,'password':mystr1},function(err,result){
if (err) {
req.flash('err_msg', 'Something is worng');
res.redirect('/Change-password');
} else { 
  if(result.length > 0 && result.length ==1)
  {
    var check_old_pass=result[0].password;
    var mykey2 = crypto.createCipher('aes-128-cbc', 'mypass');
   var new_pass = mykey2.update(req.body.new_password, 'utf8', 'hex')
    new_pass += mykey2.final('hex');

    if(mystr1 !=new_pass)
    {
      // console.log(result);
      Registration.update({_id:user_id}, {$set: { password: new_pass }}, {upsert: true}, function(err){
        if (err){
        req.flash('err_msg', 'Something went wrong.');
        res.redirect('/Change-password');
        } else 
        { 

         req.flash('success_msg', 'Password updated successfully.');
         res.redirect('/Change-password');
        
        }
      });
    }
    else
    {
       req.flash('err_msg', 'Current Password and New Password should not be same.');
       res.redirect('/Change-password');
    }    
  }
  else
  {
    req.flash('err_msg', 'Current password is not matched.');
    res.redirect('/Change-password');
  }
   
  }
});
});

//***************** get dashboard **************//
app.get('/Dashboard',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var wallet_details="";
var import_wallet_id="";
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
 var user_id=req.session.re_us_id;
Importwallet.findOne({'user_id': user_id,'login_status':'login'},function(err,loginwallet){
if (err) {
  console.log("Something went wrong");
}
else{
  if(loginwallet !="" && loginwallet!=undefined)
  {
      Userwallet.findOne({'_id': loginwallet.wallet_id},function(err,result){
      if (err) {console.log("Something went wrong");}
      else{ 
       wallet_details=result;
       import_wallet_id=loginwallet._id;
       var tokenContractABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]'
          
            // var contractAddress = '0x9Bd3F09eda3aF694373faF154Bc74ebEb62d3d42';
            // var contract = new web3js.eth.Contract(user, contractAddress);
    var tokenContract = eth.contract(tokenContractABI).at("0x9Bd3F09eda3aF694373faF154Bc74ebEb62d3d42");

    // var gnoAccount = "{'0x9Bd3F09eda3aF694373faF154Bc74ebEb62d3d42'}".toLowerCase();
    var get_eth_bal= tokenContract.balanceOf('0x9Bd3F09eda3aF694373faF154Bc74ebEb62d3d42');
    console.log(get_eth_bal);

       var getTokenBalance = function(address) {
    var token = new web3js.eth.Contract(user,contractAddress);
    token.methods.balanceOf(address).call().then(function (result) {
        var count_balance = parseInt(result);
        console.log(count_balance/Math.pow(10,8));
    });

}
console.log(getTokenBalance(wallet_details.wallet_address));

        var options = {  
        url: "http://192.168.1.14:8000",
        method: 'POST',
        headers:
        { 
        "content-type": "application/json"
        },
        body: JSON.stringify({"jsonrpc":"2.0","method":"eth_getBalance","params":[wallet_details.wallet_address,"latest"],"id":1})
        };
        request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        // console.log(body);
        var get_bal=JSON.parse(body);
        var total_bal=get_bal.result;
        var count_balance = parseInt(total_bal);
        // var balance=count_balance;
        var balance=count_balance/Math.pow(10,18)
        // console.log(total_bal);
        // console.log(balance);
        res.render('front/dashboard',{err_msg,success_msg,wallet_details,import_wallet_id,balance,layout: false,session: req.session,crypto});
        }else{
          console.log(error);
          console.log("get balance api is not working");
        }
        });
      }});
  }
  else
  {
    wallet_details="";
    import_wallet_id="";
    res.render('front/dashboard',{err_msg,success_msg,wallet_details,import_wallet_id,layout: false,session: req.session,crypto});
  }
}
}); 
}});

//***************** get Set-you-wallet **************//
app.get('/Set-you-wallet',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  res.render('front/setting-you-wallet',{err_msg,success_msg,layout: false,session: req.session,});
}
});

//***************** get Create-wallet **************//
app.get('/Create-wallet',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var passphrase="";
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
var mnemonic=bip39.generateMnemonic();
 if(mnemonic)
 {
  var response={success:1,secret:mnemonic};  
  var data = JSON.stringify(response); 
  var new_code=JSON.parse(data);
  var passphrase=new_code.secret
 }
 else
 {
   var response2={ success:0}; 
   var data = JSON.stringify(response2); 
   res.send(data.secret);
 }
  res.render('front/dash-private-key',{err_msg,success_msg,passphrase,layout: false,session: req.session});
}
});


/***************** get verfify key **************/
app.post('/Verify-key',isUser,function(req,res){  
var user_id=req.session.re_us_id;
var user_passphrase=req.body.passphrase;
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  res.render('front/verify-private-key',{err_msg,success_msg,user_passphrase,layout: false,session: req.session});
}
});



/***************** post submit-create-wallet **************/
app.post('/submit-create-wallet',isUser,function(req,res){  
var user_id=req.session.re_us_id;
var user_passphrase=req.body.passphrase.trim();
var check_passphrase=req.body.check_key.trim();
var hash = crypto.createHash('sha256').update(user_passphrase).digest('base64');
// console.log(user_passphrase);
// console.log(hash);
if(user_passphrase == check_passphrase){

var options = {  
    url: "http://192.168.1.14:8000",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_newAccount","params":[user_passphrase],"id":1})
};
request(options, function (error, response, body) {
   if (!error && response.statusCode == 200) {
    var get_result=JSON.parse(body);
    var result=get_result.result;
   var dt = dateTime.create();
   var d = dt.format('Y-m-d H:M:S');
   var currentDate = d;
   var created_at = currentDate; 
      var UserwalletData = new Userwallet({
                user_id               :  user_id,
                wallet_address        :  result,
                passphrase            :  hash,
                created_at            :  created_at,
                status                :  'active',
                deleted               :   '0'
             });

            UserwalletData.save(function (err,doc) {
            if (err){
            req.flash('err_msg', 'Something went wrong.');
            res.redirect('/Create-wallet');
            } else 
            { 
              var ImportwalletData = new Importwallet({
                user_id               :  user_id,
                wallet_id             :  doc._id,
                login_status          :  'login',
                created_at            :  created_at,
                status                :  'active',
                deleted               :   '0'
             });
               ImportwalletData.save(function (err,doc1) {
            if (err){
            req.flash('err_msg', 'Something went wrong.');
            res.redirect('/Create-wallet');
            } else 
            {
              Importwallet.find({'user_id': user_id,'login_status':'login','_id': { '$ne':doc1._id }},function (err,doc) {
              if (err){
              req.flash('err_msg', 'Something went wrong.');
              res.redirect('/Create-wallet');
              } 
              else 
              { 
                if(doc !="" && doc != undefined)
                {
                Importwallet.updateMany({'user_id':user_id,'_id': { '$ne':doc1._id }}, {$set: { login_status: 'logout' }}, {upsert: true}, function(err,result){
                if (err){ console.log(err); } 
                else 
                { console.log('login status update successfully.'); }});
                }
             }});

               res.redirect('/Create-wallet-success/'+Buffer.from(result).toString('base64'));
             }});
            } 
            });
   }else{
      res.write(response.statusCode.toString() + " " + error);
    } 
});
}
else{
  res.redirect('verify-key');
}
});

//***************** get Wallet-success **************//
app.get('/Create-wallet-success/:wallet',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var wallet_address="";
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  if(req.params.wallet){
    wallet_address=Buffer.from(req.params.wallet, 'base64').toString('ascii');

  }else{
    wallet_address="";
  }
 
  res.render('front/wallet-success',{err_msg,success_msg,wallet_address,layout: false,session: req.session,});
}
});

//***************** get import-wallet **************//
app.get('/Import-wallet',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  res.render('front/import-private-key',{err_msg,success_msg,layout: false,session: req.session,});
}
});

/***************** post submit-create-wallet **************/
app.post('/submit-import',isUser,function(req,res){  
var user_id=req.session.re_us_id;
var Passphrase=req.body.Passphrase.trim();
var hash1 = crypto.createHash('sha256').update(Passphrase).digest('base64');
Userwallet.findOne({'passphrase':hash1},function (err,doc) {
if (err){
console.log('Something went wrong.');
} 
else 
{ 
if(doc!= "" && doc!=undefined)
{
    Importwallet.findOne({'wallet_id':doc._id,'user_id':user_id},function (err,doc1) {
      if (err){
      console.log(err);
      } 
      else 
      {
        if(doc1!="" && doc1!=undefined)
        {

            if(doc1.login_status=='logout')
                {
                  Importwallet.updateOne({'user_id':user_id,'wallet_id':doc1.wallet_id}, {$set: { login_status: 'login' }}, {upsert: true}, function(err,result){
                      if (err){ console.log(err); } 
                      else 
                      { 
                        console.log('login status update successfully.'); 
                      Importwallet.find({'user_id': user_id,'login_status':'login','_id': { '$ne':doc1._id }},function (err,doc4) {
                      if (err){ console.log('Something is worng to find login status.') } 
                      else 
                      { 
                      if(doc4 !="" && doc4 != undefined)
                      {
                      Importwallet.updateMany({'user_id':user_id,'_id': { '$ne':doc1._id }}, {$set: { login_status: 'logout' }}, {upsert: true}, function(err,result){
                      if (err){ console.log(err); } 
                      else 
                      { 
                        console.log('login status update successfully2.'); }});
                      }
                      }});

                       req.flash('success_msg', 'Your wallet Import successfully.');
                        res.redirect('/Import-wallet-success/'+Buffer.from(doc.wallet_address).toString('base64')+'/'+doc._id);
                        
                      }});
              }
              else
             {  
              req.flash('success_msg', 'Your wallet is already login.');
              console.log('wallet is already login');
                res.redirect('/Import-wallet-success/'+Buffer.from(doc.wallet_address).toString('base64')+'/'+doc._id)
             } 

        }
        else
        {
          var dt = dateTime.create();
          var d = dt.format('Y-m-d H:M:S');
          var currentDate = d;
          var created_at = currentDate; 
          var ImportwalletData1 = new Importwallet({
                user_id               :  user_id,
                wallet_id             :  doc._id,
                login_status          :  'login',
                created_at            :  created_at,
                status                :  'active',
                deleted               :   '0'
             });
               ImportwalletData1.save(function (err,doc2) {
            if (err){
            req.flash('err_msg', 'Something went wrong.');
            res.redirect('/Create-wallet');
            } else 
            { 
              Importwallet.find({'user_id': user_id,'login_status':'login','_id': { '$ne':doc2._id }},function (err,doc3) {
              if (err){ console.log('Something is worng to find login status.') } 
              else 
              { 
                if(doc3 !="" && doc3 != undefined)
                {
                  Importwallet.updateMany({'user_id':user_id,'_id': { '$ne':doc2._id }}, {$set: { login_status: 'logout' }}, {upsert: true}, function(err,result){
                  if (err){ console.log(err); } 
                  else 
                  { console.log('login status update successfully2.'); }});
                }
             }});

               req.flash('success_msg', 'Your wallet Import successfully.');
              console.log("wallet import successfully for this user"); 
               res.redirect('/Import-wallet-success/'+Buffer.from(doc.wallet_address).toString('base64')+'/'+doc._id);
            } });
        }      
    }});   
}
else
{
  req.flash('err_msg', 'Please enter valid passphrase.');
  res.redirect('/Import-wallet');
}
}
});
});

//***************** get Wallet-success **************//
app.get('/Import-wallet-success/:wallet/:wallet_id',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var wallet_address="";
var wallet_id="";
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  if(req.params.wallet){
    wallet_address=Buffer.from(req.params.wallet, 'base64').toString('ascii');

  }else{
    wallet_address="";
  }
  if(req.params.wallet_id)
  {
      wallet_id=req.params.wallet_id;
  }else
  {
     wallet_id="";
  }
  res.render('front/wallet-import-success',{err_msg,success_msg,wallet_address,wallet_id,layout: false,session: req.session,});
}
});


//************post Wallet logout************//
app.post('/Wallet-logout',function(req,res){
var wallet_id=req.body.wallet_id.trim();
var user_id=req.session.re_us_id;   
Importwallet.update({'_id':wallet_id}, {$set: { login_status: 'logout' }}, {upsert: true}, function(err,response){
  if (err){ console.log(err); res.send('error'); } 
  else{ 
    // console.log(response.nModified); 
    if(response.nModified !="" && response.nModified > 0)
    {
      res.send('success'); 
    }
}}); 
});

//***************** get Send-rowan **************//
app.get('/Send-rowan/:walletid',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var walletid=req.params.walletid;
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
Userwallet.findOne({'_id':walletid},function (err,response) {
if (err){ console.log('Something is worng to find login status.') } 
else 
{ 
    if(response !="" && response!=undefined)
    {
      var walletdetails=response;
      res.render('front/send-rowan',{err_msg,success_msg,walletdetails,layout: false,session: req.session,});
    }
}});
}
});

/***************** post Submit-send-rowan **************/
app.post('/Submit-send-rowan',isUser,function(req,res){  
var user_id=req.session.re_us_id;
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');

var user_correct_passphrese=req.body.user_cr_pass.trim();
var entered_passphrese=req.body.enter_passphrase.trim();
var hashnew=crypto.createHash('sha256').update(entered_passphrese).digest('base64');

var sender_address=req.body.sender_address.trim();
var reciver_address=req.body.reciver_address.trim();
var amount=req.body.amount_send.trim();
var hex_amount=web3js.utils.toHex(amount);

var get_amount=amount*1000000000000000000;
var convert_amount_hex=web3js.utils.toHex(get_amount);


// console.log(convert_amount_hex);
var wallet_id=req.body.get_wallet_id.trim();
 var tokenContractABI ='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardEthBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"timeStampForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardTo","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targetForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"epochCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MAXIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"miningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"challengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"solutionForChallenge","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestDifficultyPeriodStarted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MINIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donation","type":"address"}],"name":"Donation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"donnationAddress","type":"address"}],"name":"DonationAddressOf","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"reward_amount","type":"uint256"},{"indexed":false,"name":"epochCount","type":"uint256"},{"indexed":false,"name":"newChallengeNumber","type":"bytes32"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getChallengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningDifficulty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"}],"name":"getMintDigest","outputs":[{"name":"digesttest","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"},{"name":"testTarget","type":"uint256"}],"name":"checkMintSolution","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"donationTo","outputs":[{"name":"donationAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"donationAddress","type":"address"}],"name":"changeDonation","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"},{"name":"donation","type":"address"}],"name":"transferAndDonateTo","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]'

       var user1=JSON.parse(tokenContractABI);

        var tokenContract = new web3js.eth.Contract(user1,"0x1EFF0daf114e87603Aa05defA5Ee2047784Acf43");
              // var contract = new web3js.eth.Contract(user, contractAddress);

var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  if(user_correct_passphrese==hashnew)
  {
    // ************ unloackaccount *************//
      var options = {  
        url: "http://192.168.1.14:8000",
        method: 'POST',
        headers:
        { 
         "content-type": "application/json"
        },
        body: JSON.stringify({"jsonrpc":"2.0","method":"personal_unlockAccount","params":[sender_address,entered_passphrese],"id":1})
      };
      request(options, function (error, response, body) {
       if (!error && response.statusCode == 200) {
        // console.log(body);
        var options1 = {  
        url: "http://192.168.1.14:8000",
        method: 'POST',
        headers:
        { 
        "content-type": "application/json"
        },
        body: JSON.stringify({"jsonrpc":"2.0","method":"eth_sendTransaction","params":[{'from':'0xBa9B4De55bfEf9B025AD7153Fa3e6f93590c0d28','to':'0x1EFF0daf114e87603Aa05defA5Ee2047784Acf43','gas':'0x10000','gasPrice':'0x430e23400','value': '0x0',"data": tokenContract.methods.transfer(reciver_address, amount * Math.pow(10, 10)).encodeABI()}],"id":1})

        };
        request(options1, function (error1, response1, body1) {
        if (!error1 && response1.statusCode == 200) {
          // console.log(body1+"it comes in body");
          var get_result=JSON.parse(body1);
          if(get_result.result !="" && get_result.result!=null)
          {
            // console.log('its inside result');
            var trans_hash=get_result.result;
          }
          if(get_result.error !="" && get_result.error!=null)
          {
            // console.log('its inside err');
            var if_error=get_result.error.message;
          }

          
          
          if(if_error !="" && if_error!=undefined && if_error!=null)
          {
            // console.log('it in if condition');
            if(if_error=='insufficient funds for gas * price + value')
            {
              var if_error1='Your transaction is failed because '+if_error;
              req.flash('err_msg', if_error1);
            }
            else
            {
              req.flash('err_msg', if_error);
            }  
              res.redirect('/Send-rowan/'+wallet_id);
          }
          else
          {
            // console.log("got tr hash"+trans_hash)
            if(trans_hash !="" && trans_hash!=null && trans_hash!=undefined)
            {
                var dt = dateTime.create();
                var d = dt.format('Y-m-d H:M:S');
                var currentDate = d;
                var created_at = currentDate;

                var TokendetailsData = new Tokendetails({
                user_id                    :  user_id,
                wallet_id                  :  wallet_id,
                sender_wallet_address      :  sender_address,
                receiver_wallet_address    :  reciver_address,
                hash                       :  trans_hash,
                amount                     :  amount,
                payment_status             :  'pending',
                created_at                 :  created_at,
                status                     :  'active',
                token_type                 :  'ETH',
                transaction_type           :  'Send'

                });
                TokendetailsData.save(function (err,doc) {
                if (err){ console.log('token data is not save.');
               } else {
                req.flash('success_msg', 'Your transaction in done.');
                res.redirect('/Transaction-history');
                }}); 
            }
          }   
               
        }else{
          console.log(error1);
          req.flash('err_msg', 'your transaction in decline.');
          res.redirect('/Error');
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
    req.flash('err_msg', 'Please enter valid passphrase.');
    res.redirect('/Send-rowan/'+wallet_id);
  }
}
});

//***************** get recive-rowan **************//
app.get('/Receive-rowan/:walletidd',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var walletidd=req.params.walletidd;
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  Userwallet.findOne({'_id':walletidd},function (err,response) {
if (err){ console.log('Something is worng to find login status.') } 
else 
{ 
    if(response !="" && response!=undefined)
    {
      var walletdetails=response;
      let qr_txt=walletdetails.wallet_address;
      var qr_png = qr.imageSync(qr_txt,{ type: 'png'})
      let qr_code_file_name = new Date().getTime() + '.png';
       fs.writeFileSync('./public/wallet_qr_image/' + qr_code_file_name, qr_png, (err) => { 
       if(err){ console.log(err); }});
      res.render('front/receive',{err_msg,success_msg,walletdetails,qr_code_file_name,layout: false,session: req.session,});
    }
}});
}
});

//***************** get Transaction-history **************//
app.get('/Transaction-history',isUser,function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var user_id=req.session.re_us_id;
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{

var user_id=req.session.re_us_id;
Importwallet.findOne({'user_id': user_id,'login_status':'login'},function(err,loginwallet){
if (err) {
  console.log("Something went wrong");
}
else{ 

    if(loginwallet !="" && loginwallet !=null && loginwallet!=undefined)
    {
      Userwallet.findOne({'_id':loginwallet.wallet_id},function (err,addresponse) {
      if (err){ console.log('Something is worng to Token details.') } 
      else 
      { 
        var user_wallet=addresponse.wallet_address;
        // 
  Tokendetails.find({ $or:[{'receiver_wallet_address':addresponse.wallet_address },{'sender_wallet_address':addresponse.wallet_address }]},function (err,response) {
      if (err){ console.log('Something is worng to Token details.') } 
      else 
      {  
      var all_transaction=response;
      res.render('front/transaction-table',{err_msg,success_msg,user_wallet,all_transaction,layout: false,session: req.session,dateFormat});

      }});
       }});

      }else
       {
      var user_wallet="";
      var all_transaction="";
      res.render('front/transaction-table',{err_msg,success_msg,user_wallet,all_transaction,layout: false,session: req.session,dateFormat});
       }
}});
}
});


//***************** get update ransaction status **************//
  var requestLoop = setInterval(function(){
  request({
  url: "http://localhost:2000",
  method: "GET",
  timeout:1000,
  followRedirect: true,
  maxRedirects: 10
  },function(error, response, body){
  if(!error && response.statusCode == 200){
   console.log('sucess!');
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
  }else{
  console.log('error' + response.statusCode);
  }
  });
  },60000);


//////////////////////////////

function check_tx_status(tx_hash,tx_id,callback){
var options = {  
url: "http://192.168.1.14:8000",
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

//***************** get update ransaction status **************//

//************post user-wallet-login-status************//
app.post('/user-wallet-login-status',function(req,res){
var user_id=req.body.get_user_id.trim();  
Importwallet.find({'user_id':user_id,'login_status':'login'},function(err,response){
  if (err){ console.log(err); res.send('error'); } 
  else{ 
    if(response !="" && response !=null && response!=undefined)
    {
      res.send('yes');
    }else
    {
      res.send('no');
    }
}}); 
});

module.exports = app;


app.get('/send_QSP', function(req, res) {


    // var myAddress = req.query.my_Address
    var sender_private_key = '0x53DC948B56BB29FFFC7EB49524F027F57F0C90AA07562767DAE11151DEDCD67B';
    // var pre_amount = req.query.amount;

    if (sender_private_key.length <= 64) {
        let student = {
            status: 1,
            message: "Invalid Private key.",
            txhash: ''

        };
        let data = JSON.stringify(student);
        res.send(student);
        console.log("first if");
    } else if (sender_private_key.length > 64) {
        var wallet_details = web3js.eth.accounts.privateKeyToAccount('0x53DC948B56BB29FFFC7EB49524F027F57F0C90AA07562767DAE11151DEDCD67B');
        if (wallet_details.address == '0xA9Aa54f007354b3C9B1BC2f9475A8336a836C7B5') {
            var pk = sender_private_key.slice(2);
            var privateKey = Buffer.from(pk, 'hex');
            // var toAddress = req.query.to_Address;
            var tokenContractABI ='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardEthBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"timeStampForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardTo","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targetForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"epochCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MAXIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"miningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"challengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"solutionForChallenge","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestDifficultyPeriodStarted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MINIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donation","type":"address"}],"name":"Donation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"donnationAddress","type":"address"}],"name":"DonationAddressOf","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"reward_amount","type":"uint256"},{"indexed":false,"name":"epochCount","type":"uint256"},{"indexed":false,"name":"newChallengeNumber","type":"bytes32"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getChallengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningDifficulty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"}],"name":"getMintDigest","outputs":[{"name":"digesttest","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"},{"name":"testTarget","type":"uint256"}],"name":"checkMintSolution","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"donationTo","outputs":[{"name":"donationAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"donationAddress","type":"address"}],"name":"changeDonation","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"},{"name":"donation","type":"address"}],"name":"transferAndDonateTo","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]'

       var user1=JSON.parse(tokenContractABI);

        var tokenContract = new web3js.eth.Contract(user1,"0x1EFF0daf114e87603Aa05defA5Ee2047784Acf43");
      //  var d =  contract.methods.balanceOf(myAddress).call();
            var count;

            web3js.eth.getTransactionCount('0xA9Aa54f007354b3C9B1BC2f9475A8336a836C7B5').then(function(v) {
                console.log("Count: " + v);
                count = v;
                var amount = 1;

                var rawTransaction = {
                    "from": '0xA9Aa54f007354b3C9B1BC2f9475A8336a836C7B5',
                    "gasPrice": web3js.utils.toHex(20 * 1e9),
                    "gasLimit": web3js.utils.toHex(200000),
                    "to": '0x1EFF0daf114e87603Aa05defA5Ee2047784Acf43',
                    "value": "0x0",
                    "data": tokenContract.methods.transfer('0xfe1c65ddfab992312e7fe38ec02d255b0067d43b', amount * Math.pow(10, 10)).encodeABI(),
                    "nonce": web3js.utils.toHex(count)
                }
                console.log(rawTransaction);


                var transaction = new Tx(rawTransaction);

                transaction.sign(privateKey);


                web3js.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'), (err, hash) => {
                    
                        if (hash) {
                            let student = {
                                status: 0,
                                txhash: hash,
                                message: 'success'

                            };
                            let data = JSON.stringify(student);
                            res.send(student);



                        } else if (err) {
                            let student1 = {
                                status: 2,
                                message: "Insufficient funds In Your account.",
                                txhash: ''

                            };
                            let data1 = JSON.stringify(student1);
                            // console.log(data1);
                            res.send(data1);
                            //res.redirect('/thankyou_msg')
                            // console.log(Error.error);
                            console.log(err);

                        }

                        //web3js.eth.getTransaction(hash)

                    })
                    .on('transactionHash');

                contract.methods.balanceOf('0xA9Aa54f007354b3C9B1BC2f9475A8336a836C7B5').call()
                    .then(function(balance) {
                        console.log("balance \n" + balance)
                    });
            });




        } else {
            let student1 = {
                status: 1,
                message: "Invalid Private key.",
                txhash: ''

            };
            let data1 = JSON.stringify(student1);
            // console.log(data1);
            res.send(data1);
      }

    }




});




/***************** post Submit-send-rowan **************/
app.post('/Submit-send-rowan',isUser,function(req,res){  
var user_id=req.session.re_us_id;
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');

var user_correct_passphrese=req.body.user_cr_pass.trim();
var entered_passphrese=req.body.enter_passphrase.trim();
var hashnew=crypto.createHash('sha256').update(entered_passphrese).digest('base64');

var sender_address=req.body.sender_address.trim();
var reciver_address=req.body.reciver_address.trim();
var amount=req.body.amount_send.trim();
// var hex_amount=web3js.utils.toHex(amount);

var get_amount=amount*1000000000000000000;
var convert_amount_hex=web3js.utils.toHex(get_amount);


// console.log(convert_amount_hex);
var wallet_id=req.body.get_wallet_id.trim();

var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  if(user_correct_passphrese==hashnew)
  {

    var datadir = '/home/amrita/private_poa/poa/node1/data/';
    var sen_address= sender_address;
    const sender_password = entered_passphrese;

    var keyObject = keythereum.importFromFile(sen_address, datadir);
    var sen_privateKey = keythereum.recover(sender_password, keyObject);
    var sender_private_key=sen_privateKey.toString('hex')
    // console.log(sender_private_key.toString('hex'));




    // ************ unloackaccount *************//

    var tokenContractABI ='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardEthBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"timeStampForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardTo","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targetForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"epochCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MAXIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"miningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"challengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"solutionForChallenge","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestDifficultyPeriodStarted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MINIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donation","type":"address"}],"name":"Donation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"donnationAddress","type":"address"}],"name":"DonationAddressOf","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"reward_amount","type":"uint256"},{"indexed":false,"name":"epochCount","type":"uint256"},{"indexed":false,"name":"newChallengeNumber","type":"bytes32"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getChallengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningDifficulty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"}],"name":"getMintDigest","outputs":[{"name":"digesttest","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"},{"name":"testTarget","type":"uint256"}],"name":"checkMintSolution","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"donationTo","outputs":[{"name":"donationAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"donationAddress","type":"address"}],"name":"changeDonation","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"},{"name":"donation","type":"address"}],"name":"transferAndDonateTo","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]'

       var user1=JSON.parse(tokenContractABI);

        var tokenContract = new web3js.eth.Contract(user1,"0x1EFF0daf114e87603Aa05defA5Ee2047784Acf43");
      var options = {  
        url: "http://192.168.1.14:8000",
        method: 'POST',
        headers:
        { 
         "content-type": "application/json"
        },
        body: JSON.stringify({"jsonrpc":"2.0","method":"personal_unlockAccount","params":[sender_address,entered_passphrese],"id":1})
      };
      request(options, function (error, response, body) {
       if (!error && response.statusCode == 200) {
        // console.log(body);
        var options1 = {  
        url: "http://192.168.1.14:8000",
        method: 'POST',
        headers:
        { 
        "content-type": "application/json"
        },
        // body: JSON.stringify({"jsonrpc":"2.0","method":"eth_sendTransaction","params":[{'from':sender_address,'to':reciver_address,'gas':'0x10000','gasPrice':'0x430e23400','value': convert_amount_hex}],"id":1})

        // };
         body: JSON.stringify({"jsonrpc":"2.0","method":"eth_sendTransaction","params":[{'from':'0xBa9B4De55bfEf9B025AD7153Fa3e6f93590c0d28','to':'0x1EFF0daf114e87603Aa05defA5Ee2047784Acf43','gas':'0x10000','gasPrice':'0x430e23400','value': '0x0',"data": tokenContract.methods.transfer(reciver_address, amount * Math.pow(10, 10)).encodeABI()}],"id":1})

        };
        request(options1, function (error1, response1, body1) {
        if (!error1 && response1.statusCode == 200) {
          // console.log(body1+"it comes in body");
          var get_result=JSON.parse(body1);
          if(get_result.result !="" && get_result.result!=null)
          {
            // console.log('its inside result');
            var trans_hash=get_result.result;
          }
          if(get_result.error !="" && get_result.error!=null)
          {
            // console.log('its inside err');
            var if_error=get_result.error.message;
          }

          
          
          if(if_error !="" && if_error!=undefined && if_error!=null)
          {
            // console.log('it in if condition');
            if(if_error=='insufficient funds for gas * price + value')
            {
              var if_error1='Your transaction is failed because '+if_error;
              req.flash('err_msg', if_error1);
            }
            else
            {
              req.flash('err_msg', if_error);
            }  
              res.redirect('/Send-rowan/'+wallet_id);
          }
          else
          {
            // console.log("got tr hash"+trans_hash)
            if(trans_hash !="" && trans_hash!=null && trans_hash!=undefined)
            {
                var dt = dateTime.create();
                var d = dt.format('Y-m-d H:M:S');
                var currentDate = d;
                var created_at = currentDate;

                var TokendetailsData = new Tokendetails({
                user_id                    :  user_id,
                wallet_id                  :  wallet_id,
                sender_wallet_address      :  sender_address,
                receiver_wallet_address    :  reciver_address,
                hash                       :  trans_hash,
                amount                     :  amount,
                payment_status             :  'pending',
                created_at                 :  created_at,
                status                     :  'active',
                token_type                 :  'ETH',
                transaction_type           :  'Send'

                });
                TokendetailsData.save(function (err,doc) {
                if (err){ console.log('token data is not save.');
               } else {
                req.flash('success_msg', 'Your transaction in done.');
                res.redirect('/Transaction-history');
                }}); 
            }
          }   
               
        }else{
          console.log(error1);
          req.flash('err_msg', 'your transaction in decline.');
          res.redirect('/Error');
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
    req.flash('err_msg', 'Please enter valid passphrase.');
    res.redirect('/Send-rowan/'+wallet_id);
  }
}
});