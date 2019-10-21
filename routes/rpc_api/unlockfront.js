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


// var transporter = auth.transporter;
// use current time // 
var dateTime = require('node-datetime');

// Get Users model //
// var {Country,Contact,NewsInfo,Product,ContactInquiry,Testimonials,Blockchain_services,Our_partner,OurProject,Blogs,Offices,OurExpertise,ProductFeatures,OurClient,OurServices,SubServices,ServicesFeatures,Industries,BlogComment,BlogCategoey,BlogLike} = require('../models/contact');
var {Registration,Userwallet} = require('../models/contact');

var isUser = auth.isUser;


// var datadir = "/home/amrita/machine1/ethdata/";
// var address= "0x706acd3689976f6c69d561eed9872dcfc3b27b68";
// const password = "Abc@1234";

// var keyObject = keythereum.importFromFile(address, datadir);
// var privateKey = keythereum.recover(password, keyObject);
// console.log(privateKey.toString('hex'));

// var datadir = "/home/amrita/machine1/ethdata/";
// encrypted_key = keyfile.read(datadir);
// private_key = w3.eth.account.decrypt(encrypted_key, 'your keyfile password')


/**api to create passphrase start**/
// app.get('/wallet_passphrase',(req,res) =>{

//  var mnemonic=bip39.generateMnemonic();

//  if(mnemonic)
//  {
//    let response={success:1,secret:mnemonic};  
//     let data1 = JSON.stringify(response); 
//     res.send(data1);
//  }
//  else
//  {
//    let response2={ success:0}; 
//    let data2 = JSON.stringify(response2); 
//    res.send(data2);
//  }


// });
/**api to create passphrase end**/







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
//************ to get user data on header using session **********//


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
var test = req.session.is_user_logged_in;
if (test != true) {
res.redirect('/Login');
} else 
{
 var user_id=req.session.re_us_id;
Userwallet.findOne({'user_id': user_id,'login_status':'login'},function(err,result){
if (err) {
  console.log("Something went wrong");
}
else
{
  var wallet_details=result;
  // console.log(wallet_details);
  res.render('front/dashboard',{err_msg,success_msg,wallet_details,layout: false,session: req.session});
}
});

}

});

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
if(user_passphrase == check_passphrase){

var options = {  
    url: "http://192.168.1.34:8000",
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
                login_status          :  'login',
                created_at            :  created_at,
                status                :  'active',
                deleted               :   '0'
             });

            Userwallet.updateMany({user_id:user_id}, {$set: { login_status: 'logout' }}, {upsert: true}, function(err,reslt){
            if (err){ console.log(err); } else 
            { console.log(reslt) }});


            UserwalletData.save(function (err,doc) {
            if (err){
            req.flash('err_msg', 'Something went wrong.');
            res.redirect('/Create-wallet');
            } else 
            { 

            // var datadir = "/home/amrita/machine1/ethdata/";
            // var address= result;
            // const password = user_passphrase;
            // var keyObject = keythereum.importFromFile(address, datadir);
            // var privateKey = keythereum.recover(password, keyObject);
            // var private_key=privateKey.toString('hex')
            // console.log(private_key);  
            res.redirect('/Create-wallet-success/'+Buffer.from(result).toString('base64'));
            } 
            });
   }else{
      res.write(response.statusCode.toString() + " " + error);
    }
    // res.end();  
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
var Passphrase=req.body.Passphrase;
Userwallet.find({'user_id': user_id},function (err,doc) {
if (err){
req.flash('err_msg', 'Something went wrong.');
res.redirect('/Create-wallet');
} 
else 
{ 
  // miner_start(function(err,response) {console.log(response);});

     //  console.log(doc);
            //  { "carrier.state": { $ne: "NY" } }
            //  Userwallet.updateMany({user_id:user_id,}, {$set: { login_status: 'logout' }}, {upsert: true}, function(err,reslt){
            // if (err){ console.log(err); }});
            // var datadir = "/home/amrita/machine1/ethdata/";
            // var address= result;
            // const password = user_passphrase;
            // var keyObject = keythereum.importFromFile(address, datadir);
            // var privateKey = keythereum.recover(password, keyObject);
            // var private_key=privateKey.toString('hex')
            // console.log(private_key); 



  var wallets_length=doc.length;
  var nu_count="";
  for (i = 0; i < doc.length; i++) { 
  check_account(Passphrase,doc[i].wallet_address,doc[i]._id,function(err,response) {
    //if(err) return console.log(err);
    //response is here
    if(response!=undefined)
    {

     // console.log('response'+doc[i].wallet_address+'val i'+i);
      return res.redirect(response);
    }
    // else 
    //   // if(response == undefined && wallets_length==i)
    // {
    //      console.log('else');
    // }
});
  // console.log(Passphrase);
  // console.log(doc[i].wallet_address);

  // if(valid_account==true)
  // {
  //   console.log(valid_account);
  //   console.log('yes');
  // }
  // else{
  //   console.log(valid_account);
  //   console.log('no');
  // }
   }
}
});
});


function check_account(Passphrase,wallet_address,wallet_id,callback){

  var Passphrase=Passphrase;
  var wallet_address=wallet_address;

   var options = {  
    url: "http://192.168.1.34:8000",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_unlockAccount","params":[wallet_address,Passphrase],"id":1})
};
request(options, function (error, response, body) {
   if (!error && response.statusCode == 200) {

        var get_result=JSON.parse(body);
        var result=get_result.result;

       if(result==true)
       {
         return callback(null,'/Import-wallet-success/'+Buffer.from(wallet_address).toString('base64')+'/'+wallet_id);
       }
       else
       {
         return callback(null,result);
       }
   }else{
    return callback(null,error);
    }
    });
}

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
      //wallet_id=Buffer.from(req.params.wallet_id, 'base64').toString('ascii');
  }else
  {
     wallet_id="";
  }
  res.render('front/wallet-import-success',{err_msg,success_msg,wallet_address,wallet_id,layout: false,session: req.session,});
}
});


//************post Wallet logout************//
app.post('/Wallet-logout',function(req,res){
var wallet_id=req.body.wallet_id;
var user_id=req.session.re_us_id;   
// Userwallet.update({_id:wallet_id,user_id:user_id}, {$set: { login_status: 'logout'}}, {upsert: true}, function(err,doc){
//     if (err){
//            console.log(err);
//             res.send('0');
//     } else {
//       console.log(doc);
//           res.send('1');
//     }
//   });     

// Userwallet.update({_id:wallet_id,user_id:user_id}, {$set: {login_status: 'logout' }}, {upsert: true}, function(err){
// if (err){
//          res.send('0');
// } else { 
//       res.send('1');
// }});                   
});





module.exports = app;

function check_account(Passphrase,wallet_address,wallet_id,callback){

  var Passphrase=Passphrase;
  var wallet_address=wallet_address;

   var options = {  
    url: "http://192.168.1.34:8000",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_unlockAccount","params":[wallet_address,Passphrase],"id":1})
};
request(options, function (error, response, body) {
   if (!error && response.statusCode == 200) {

        var get_result=JSON.parse(body);
        var result=get_result.result;

       if(result==true)
       {
         return callback(null,'/Import-wallet-success/'+Buffer.from(wallet_address).toString('base64')+'/'+wallet_id);
       }
       else
       {
         return callback(null,result);
       }
   }else{
    return callback(null,error);
    }
    });
}


Importwallet.find({'user_id': user_id,'login_status':'login'},function (err,doc) {
              if (err){
              req.flash('err_msg', 'Something went wrong.');
              res.redirect('/Create-wallet');
              } 
              else 
              { 
                Importwallet.updateMany({user_id:user_id}, {$set: { login_status: 'logout' }}, {upsert: true}, function(err,res){
                if (err){ console.log(err); } else 
                { console.log(res) }});
 
              }
              });



app.get('/qrcode', (req, res, next) => {
   // Get the text to generate QR code
   let qr_txt = "123456";
   
   // Generate QR Code from text
   var qr_png = qr.imageSync(qr_txt,{ type: 'png'})
   // Generate a random file name 
   let qr_code_file_name = new Date().getTime() + '.png';

   fs.writeFileSync('./public/qr/' + qr_code_file_name, qr_png, (err) => {
       
       if(err){
           console.log(err);
       }
       
   })
   // Send the link of generated QR code
   res.send({
       'qr_img': "qr/" + qr_code_file_name
   });
});