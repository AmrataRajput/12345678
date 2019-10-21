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
const Tx = require('ethereumjs-tx');
var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
var utils_helper = require('../helpers/helper');
// var pagination = require('pagination');
// const quorumjs = require("quorum-js"); //for web3 extends

web3js = new web3(new web3.providers.HttpProvider("http://45.252.190.5:8000"));


var dateTime = require('node-datetime');

var {Registration,Userwallet,Importwallet,Tokendetails} = require('../models/contact');

var isUser = auth.isUser;

var options = {  
    url: "http://45.252.190.5:8000",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_newAccount","params":['123456'],"id":1})
};
// var path ='http://vds16857-env-7015216.cloudjiffy.net/ethdata/keystore/';
// var mode = 0o755

 var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var currentDate=indiaTime.toLocaleString();
      console.log(currentDate);

request(options, function (error, response, body) {console.log(body)});
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

app.get('/Rowan_explorer',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');


  Tokendetails.find({},function (err,response) {
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
   
     if(send_resu!=null && send_resu!="" && send_resu!=undefined)
     {
        Tokendetails.updateOne({'_id':tx_id}, {$set: { 'payment_status': 'paid' ,'block_id':parseInt(send_resu.blockNumber)}}, {upsert: true}, function(err,result){
        if (err){ console.log(err); } 
        else 
        { 
             return callback(null,'tx success'+ parseInt(send_resu.blockNumber));
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


  Tokendetails.find({'payment_status':'paid'}).sort([['auto', -1]]).exec(function(err, response) { 

      if (err){ console.log('Something is worng to Token details.') } 
      else 
      {  
      var all_transaction=response;
      res.render('front/Rowan_explorer',{err_msg,success_msg,all_transaction,layout: false,session: req.session,dateFormat});

      }
    });
     
});

app.get('/block-details',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');

res.render('front/block_detail',{err_msg,success_msg,layout: false}); 

})  

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


app.get('/test_helper',async function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test == true) {
res.redirect('/Dashboard');
} else 
{
var result_cnt = await utils_helper.add('5d0ce0eaad82ad679609d480'); // call the add function which was exported by the module
// console.log(result_cnt); 
res.render('front/helper_signup_view',{err_msg,success_msg,utils_helper:utils_helper,result_cnt,layout: false,session: req.session,}); 
}
}) 


app.locals.someHelper = function(name) {
  
  return ("hello " + name);
}



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

   // var dt = dateTime.create();
   // var d = dt.format('Y-m-d H:M:S');
   // var currentDate = d;
   // var created_at = currentDate;

   var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var created_at=indiaTime.toLocaleString();
      // console.log(currentDate);

   // var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
   // var mystr = mykey.update(password, 'utf8', 'hex')
   //  mystr += mykey.final('hex');        
   Registration.find({'email': req.body.email},function(err,result){
    if (err) {
    req.flash('err_msg', 'Please enter valid email address.');
                res.redirect('/Signup')
    } else {
         if(result.length > 0)
         {
          req.flash('err_msg', 'Email already exists. Please enter another email.');
                res.redirect('/Signup')
         }
         else
         {

            const secret = speakeasy.generateSecret({
                      length: 10,
                      name: 'Rowan_Energy',
                      issuer: 'Rowan_Energy'
                  });
                  var url = speakeasy.otpauthURL({
                      secret: secret.base32,
                      label: 'Rowan_Energy',
                      issuer: 'Rowan_Energy',
                      encoding: 'base32'
                  });
              QRCode.toDataURL(url, (err, dataURL) => {
       
                 
                  // console.log(dataURL);
                  // console.log(secret.base32);
                  var secret_code = secret.base32;
                  var qrcode_data = dataURL

          // var RegistartionData = new Registration({
          //       name                  :  name,
          //       first_name            :  name,
          //       last_name             :  '',
          //       email                 :  email,
          //       password              :  mystr,
          //       created_at            :  created_at,
          //       email_varify_status   :  '',
          //       mobile_no             :  '',
          //       address               :  '', 
          //       user_address          :  '',
          //       country               :  '',
          //       state                 :  '',
          //       city                  :  '',
          //       status                :  'active',
          //       profile_image         :  '',
          //       dataURL               : dataURL,
          //       qr_secret             : secret_code,
          //       qr_status             : 'pending'

          //    })
      // RegistartionData.save(function (err,doc) {
        // if (err){
        // req.flash('err_msg', 'Please enter valid email address.');
        //         res.redirect('/Signup')
        // } else 
        // {
        //    // console.log(doc);
              
        //         req.session.success = true;
        //         req.session.re_us_id = doc._id;
        //         req.session.re_usr_name =doc.name;
        //         req.session.re_usr_email = doc.email;
             

        //            req.flash('success_msg', 'New account sign up done successfully.');
        //        res.redirect('/Registration-success')
                 // var  success_msg='New account sign up done successfully.';
                 var err_msg ='';
                 var success_msg  ='';
                   res.render('front/registration_success',{err_msg,success_msg,layout: false,session: req.session,secret_code,dataURL,name,email,password}) 

       
                                     
             // }
          // });
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

app.get('/Verify_account',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var test = req.session.is_user_logged_in;
if (test == true) {
res.redirect('/Dashboard');
} else 
{
 res.render('front/verify-account',{err_msg,success_msg,layout: false,session: req.session,})  
}
});

app.post('/Verify_account',function(req,res){
err_msg = req.flash('err_msg');
success_msg = req.flash('success_msg');
var user_token = req.body.authcode;
var email =   req.session.re_usr_email;
Registration.find({'email': email},function(err,result){
if (err) {
  req.flash('err_msg', 'Something went wrong.');
  res.redirect('/Verify_account')
}else{
  // console.log(result);
   console.log(result)
  secret_code = result[0].qr_secret;
  console.log(secret_code)
    var verified = speakeasy.totp.verify({ secret: secret_code,
                              encoding: 'base32',
                              token: user_token });
    console.log("verified" +verified);
    if (verified ==false) {
      req.flash('err_msg', 'Please enter correct secret code.');
       res.redirect('/Verify_account')
       
    }else{
        req.session.is_user_logged_in = true;
       res.redirect('/dashboard')
    }
    
}
});
});


//***************** post  login**************//
app.post('/submit-login',function(req,res){ 
// var mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
// var mystr1 = mykey1.update(req.body.password, 'utf8', 'hex')
// mystr1 += mykey1.final('hex');  
password = req.body.password.trim();
var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
           var mystr = mykey.update(password, 'utf8', 'hex')
            mystr += mykey.final('hex');
            console.log(mystr);
            console.log(req.body.email);
Registration.find({'email': req.body.email.trim(),'password':mystr},function(err,result){
if (err) {
req.flash('err_msg', 'Please enter valid Email address.');
res.redirect('/Login')
} else { 
  // console.log(result.length);
  // console.log(req.body.password);
  

  if(result.length > 0 && result.length==1 )
  {
    
    
                req.session.success = true;
                req.session.re_us_id = result[0]._id;
                req.session.re_usr_name =result[0].name;
                req.session.re_usr_email = result[0].email;
                // req.session.is_user_logged_in = true;
                res.redirect("Verify_account");
    
    
  }
  else
  {
    req.flash('err_msg', 'The username or password is incorrect.');
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
console.log(test)

    secret_code = req.body.secret_code;
    dataURL   = req.body.dataURL; 
   name   = req.body.name; 
   email   = req.body.email; 
   password   = req.query.password; 
   
    
  res.render('front/registration_success',{err_msg,success_msg,layout: false,session: req.session,secret_code,dataURL,name,email,password});
     
 

 



}); 


app.post('/submit_OTP',function(req,res){  
  user_token = req.body.authcode;
  secret_code = req.body.secret_code;
   dataURL   = req.body. dataURL;
   email = req.body.email;
   name= req.body.name;
   password = req.body.password.trim();
   console.log(password);
  var verified = speakeasy.totp.verify({ secret: secret_code,
                                      encoding: 'base32',
                                      token: user_token });
          console.log(verified);
          if (verified==false) {
            console.log("if");
            err_msg = 'The Verification code is  incorrect.';
            success_msg ='';
            res.render('front/registration_success',{err_msg,success_msg,layout: false,session: req.session,secret_code,dataURL}) 
            // req.flash('err_msg', 'The Verification code is  incorrect.');
            // res.redirect('Registration-success')


          }
          else{
          //    Registration.update({email:email}, {$set: { email_varify_status: 'verified',qr_status:'verified' }}, {upsert: true}, function(err){
          //   if (err){
          //    console.log(err);
          //    } else 
          //   { 
          //      req.session.is_user_logged_in = true;
          //       res.redirect('/Dashboard')
          //   }
          // })
         //   var dt = dateTime.create();
         //  var d = dt.format('Y-m-d H:M:S');
         // var currentDate = d;
         // var created_at = currentDate; 
          
      var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var created_at=indiaTime.toLocaleString();
      

          var mykey = crypto.createCipher('aes-128-cbc', 'mypass');
           var mystr = mykey.update(password, 'utf8', 'hex')
            mystr += mykey.final('hex');  
            console.log("OTP" +mystr) 
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
                dataURL               : dataURL,
                qr_secret             : secret_code,
                qr_status             : 'pending'

             })
      RegistartionData.save(function (err,doc) {
        if (err){
        // req.flash('err_msg', 'Please enter valid email address.');
                // res.redirect('/Registration-success')
                console.log(err);
        } else 
        {
             req.session.success = true;
                req.session.re_us_id = doc._id;
                req.session.re_usr_name =doc.name;
                req.session.re_usr_email = doc.email;
                req.session.is_user_logged_in = true;
          res.redirect('/Dashboard')
        }
       })
           
          }

});
/***************** get forgot pass **************/
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
req.flash('err_msg', 'Please enter registered Email address.');
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
         req.flash('success_msg', 'Password has been sent successfully to your registered email.');
         res.redirect('/Forgot-password')
          });
        }
      });
  }
  else
  {
    req.flash('err_msg', 'Please enter registered Email address.');
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
    req.flash('err_msg', 'Please enter registered Email address.');
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
 
   var profile_image=user_image.trim();
   var user_full_name=user_first_name;
   Registration.update({_id:user_id}, {$set: {first_name:user_first_name,profile_image:profile_image,name:user_full_name}}, {upsert: true}, function(err,result)
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

         req.flash('success_msg', 'Password changed successfully.');
         res.redirect('/Change-password');
        
        }
      });
    }
    else
    {
       req.flash('err_msg', 'New password should not be same as current password.');
       res.redirect('/Change-password');
    }    
  }
  else
  {
    req.flash('err_msg', 'Please enter correct current password.');
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
var rown_bal="";
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

       var tokenContractABI ='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardEthBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"timeStampForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardTo","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targetForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"epochCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MAXIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"miningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"challengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"solutionForChallenge","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestDifficultyPeriodStarted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MINIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"donation","type":"address"}],"name":"Donation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"donnationAddress","type":"address"}],"name":"DonationAddressOf","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"reward_amount","type":"uint256"},{"indexed":false,"name":"epochCount","type":"uint256"},{"indexed":false,"name":"newChallengeNumber","type":"bytes32"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getChallengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningDifficulty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"}],"name":"getMintDigest","outputs":[{"name":"digesttest","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"},{"name":"testTarget","type":"uint256"}],"name":"checkMintSolution","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"donationTo","outputs":[{"name":"donationAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"donationAddress","type":"address"}],"name":"changeDonation","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"},{"name":"donation","type":"address[]"},{"name":"admin","type":"address"}],"name":"transferAndDonateTo","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]'
      
        var options = {  
        url: "http://45.252.190.5:8000",
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

        

        var user1=JSON.parse(tokenContractABI);

        var tokenContract = new web3js.eth.Contract(user1,"0x53218739EdEa3857148C931E0644AAC0C1368305");

          tokenContract.methods.balanceOf(wallet_details.wallet_address).call().then(function (result) {
          
          var count_balance = parseInt(result);
          // console.log(result.toNumber());
         // console.log(web3js.utils.fromWei(result.toNumber()));
          console.log(count_balance);
          rown_bal=count_balance/Math.pow(10,10);
          res.render('front/dashboard',{err_msg,success_msg,wallet_details,import_wallet_id,balance,rown_bal,layout: false,session: req.session,crypto});
      
    });
       
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
    rown_bal="";
    res.render('front/dashboard',{err_msg,success_msg,wallet_details,import_wallet_id,rown_bal,layout: false,session: req.session,crypto});
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
    url: "http://45.252.190.5:8000",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_newAccount","params":[user_passphrase],"id":1})
};
// var path ='http://vds16857-env-7015216.cloudjiffy.net/ethdata/keystore/';
// var mode = 0o755



request(options, function (error, response, body) {
   if (!error && response.statusCode == 200) {
    var get_result=JSON.parse(body);
    var result=get_result.result;


   // var dt = dateTime.create();
   // var d = dt.format('Y-m-d H:M:S');
   // var currentDate = d;
   // var created_at = currentDate; 


      var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var created_at=indiaTime.toLocaleString();
      
     
    console.log(created_at);
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

                       req.flash('success_msg', 'Your wallet is successfully Imported.');
                        res.redirect('/Import-wallet-success/'+Buffer.from(doc.wallet_address).toString('base64')+'/'+doc._id);
                        
                      }});
              }
              else
             {  
              req.flash('success_msg', 'Your wallet is already Imported.');
              console.log('wallet is already login');
                res.redirect('/Import-wallet-success/'+Buffer.from(doc.wallet_address).toString('base64')+'/'+doc._id)
             } 

        }
        else
        {
          // var dt = dateTime.create();
          // var d = dt.format('Y-m-d H:M:S');
          // var currentDate = d;
          // var created_at = currentDate; 


      var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var created_at=indiaTime.toLocaleString();
      


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

               req.flash('success_msg', 'Your wallet is successfully Imported.');
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
var get_amount=req.body.amount_send.trim();

// console.log(convert_amount_hex);
var wallet_id=req.body.get_wallet_id.trim();

var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
  if(user_correct_passphrese==hashnew)
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
        // console.log(body);
        // console.log(sender_private_key);

        var options4 = {  
        url: "http://45.252.190.5:8000",
        method: 'POST',
        headers:
        { 
        "content-type": "application/json"
        },

        body: JSON.stringify({"jsonrpc":"2.0","method":"personal_listWallets","params":[],"id":1})
        };
        request(options4, function (error, response, body) {
        // console.log(body.result);
        // console.log(JSON.parse(body).result);
        var c = JSON.parse(body).result;
        // console.log(c);
        c.forEach(function(element) {
        // console.log(element.accounts);
        var accounts_details = element.accounts;
        accounts_details.forEach(function(element1) {
        // console.log(element1.address);
        if (element1.address==sender_address) {
        // console.log(element1.url)
        var parts = element1.url.split('/');
        var lastSegment = parts.pop() || parts.pop();  
        console.log(lastSegment);

          request.get('http://vds16857-env-7015216.cloudjiffy.net/ethdata/keystore/'+lastSegment, 
          function (error, response, body) {
          if (!error && response.statusCode == 200) {

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


          var csv = body;
          console.log(csv)  
          var c =  web3js.eth.accounts.decrypt(csv,entered_passphrese);
          console.log(c.privateKey);
          var pk = c.privateKey.slice(2);
          var sender_private_key=pk;
          var privateKey = Buffer.from(sender_private_key, 'hex');
        
            var tokenContractABI ='[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardEthBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"timeStampForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardTo","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"targetForEpoch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"epochCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MAXIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"miningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"challengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"solutionForChallenge","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastRewardAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestDifficultyPeriodStarted","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_MINIMUM_TARGET","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"donation","type":"address"}],"name":"Donation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"donnationAddress","type":"address"}],"name":"DonationAddressOf","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"reward_amount","type":"uint256"},{"indexed":false,"name":"epochCount","type":"uint256"},{"indexed":false,"name":"newChallengeNumber","type":"bytes32"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"}],"name":"mint","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getChallengeNumber","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningDifficulty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMiningReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"}],"name":"getMintDigest","outputs":[{"name":"digesttest","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"nonce","type":"uint256"},{"name":"challenge_digest","type":"bytes32"},{"name":"challenge_number","type":"bytes32"},{"name":"testTarget","type":"uint256"}],"name":"checkMintSolution","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"donationTo","outputs":[{"name":"donationAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"donationAddress","type":"address"}],"name":"changeDonation","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"},{"name":"donation","type":"address[]"},{"name":"admin","type":"address"}],"name":"transferAndDonateTo","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]'

             var user1=JSON.parse(tokenContractABI);
             var tokenContract = new web3js.eth.Contract(user1,"0x53218739EdEa3857148C931E0644AAC0C1368305");
             var count;

              tokenContract.methods.balanceOf(sender_address).call().then(function (result) {
            // console.log(result);
          var count_balance = parseInt(result);
          rown_bal=count_balance/Math.pow(10,10);
          console.log("total balance "+rown_bal);
          console.log("user enter amount "+get_amount)
          var gas_amount=parseFloat(get_amount)+parseFloat(0.0000005);
          console.log("add "+parseFloat(gas_amount));
          if(rown_bal >= gas_amount)
          { 
                web3js.eth.getTransactionCount(sender_address).then(function(v) {
                console.log("Count: " + v);
                count = v;
                var amount = get_amount;

                // var rawTransaction = {"from":myAddress, "gasPrice":web3.utils.toHex(2 * 1e9),"gasLimit":web3.utils.toHex(210000),"to":contractAddress,"value":"0x0","data":contract.methods.transfer(toAddress, amount).encodeABI(),"nonce":web3.utils.toHex(count)} 
                  var array_donation= all_validators;
      
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
                  if (err) 
                  // if(err)
                  {
                     // console.log(hash);
                         req.flash('err_msg', "Insufficient funds In Your account.");
                            res.redirect('/Send-rowan/'+wallet_id);  
                        } 

                        else { 

                          //   var dt = dateTime.create();
                          // var d = dt.format('Y-m-d H:M:S');
                          // var currentDate = d;
                          // var created_at = currentDate;

       var indiaTime = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
      var indiaTime = new Date(indiaTime);
      var created_at=indiaTime.toLocaleString();
      // console.log(currentDate);

           Tokendetails.count(function (err,respcount){
             var count_val=parseFloat(respcount)+parseFloat(1);



                          var TokendetailsData = new Tokendetails({
                          auto                       :  count_val,
                          user_id                    :  user_id,
                          wallet_id                  :  wallet_id,
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

                        var test="";
                          var requestLoop = setInterval(function(){
                          check_tx_status(doc.hash,doc._id,function(err,respo,next)
                          {
                          console.log('fri'+respo);
                          if(respo=="tx success")
                          {
                            clearInterval(requestLoop); // stop the interval
                            req.flash('success_msg', 'Your transaction in done.');

                            
                            res.redirect('/Transaction-history');
                           
                             
                          }
                          else
                          {
                          console.log(respo+"inside else");
                          }
                          }); },100);
                         
                          }});

                        });
                             
 
                             }
                    }).on('transactionHash');
         //   } 

         // });
              });
          }
          else
          {
                req.flash('err_msg', "Insufficient funds In Your account.");
                            res.redirect('/Send-rowan/'+wallet_id); 
          }
        });

      } 

         });
            
          }
          });

        }
        });

        });
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

//***************** get update ransaction status **************//





    if(loginwallet !="" && loginwallet !=null && loginwallet!=undefined)
    {
      Userwallet.findOne({'_id':loginwallet.wallet_id},function (err,addresponse) {
      if (err){ console.log('Something is worng to Token details.') } 
      else 
      { 
        var user_wallet=addresponse.wallet_address;
 
  Tokendetails.find({ $or:[{'receiver_wallet_address':addresponse.wallet_address },{'sender_wallet_address':addresponse.wallet_address }]}).sort([['auto', -1]]).exec(function(err, response) { 

      if (err){ console.log('Something is worng to Token details.') } 
      else 
      {  
       
      var all_transaction=response;
      res.render('front/transaction-table',{err_msg,success_msg,user_wallet,all_transaction,layout: false,session: req.session,dateFormat});

      }
    });
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

app.get('/terms-conditions',function(req,res){
res.render('front/terms-condition'); 
}); 

app.get('/exchange',isUser,function(req,res){
res.render('front/comingsoon'); 
}); 

app.get('/rowanvault',isUser,function(req,res){
res.render('front/comingsoon'); 
}); 





module.exports = app;









