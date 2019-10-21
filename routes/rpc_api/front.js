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
// var auth = require('../config/auth');

// var transporter = auth.transporter;
// use current time // 
var dateTime = require('node-datetime');


// Get Users model //
// var {Country,Contact,NewsInfo,Product,ContactInquiry,Testimonials,Blockchain_services,Our_partner,OurProject,Blogs,Offices,OurExpertise,ProductFeatures,OurClient,OurServices,SubServices,ServicesFeatures,Industries,BlogComment,BlogCategoey,BlogLike} = require('../models/contact');


// var isUser = auth.isUser;

// var Prodata = auth.process;

// ************  create Account *************//
 app.get('/Create-new-account',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_newAccount","params":["123456"],"id":1})
};
request(options, function (error, response, body) {
	 if (!error && response.statusCode == 200) {
	 	 // res.writeHeader(200, {"Content-Type": "application/json"});
       res.write(res.statusCode.toString() + " " + body);
	 }else{
	 		// console.log(response.headers['content-type']);
      // res.writeHeader(response.statusCode, {"Content-Type": "application/json"});
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();	
});

})   

// ************ getAccountlist *************//
 app.get('/Get-all-account',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"eth_accounts","id":1})
};
request(options, function (error, response, body) {
	 if (!error && response.statusCode == 200) {
       res.write(res.statusCode.toString() + " " + body);
	 }else{
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();	
});

})    

// ************ unloackaccount *************//
 app.get('/unlock-account',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"personal_unlockAccount","params":["0xba9b4de55bfef9b025ad7153fa3e6f93590c0d28","123456"],"id":1})
};
request(options, function (error, response, body) {
	 if (!error && response.statusCode == 200) {
	 	 // res.writeHeader(200, {"Content-Type": "application/json"});
       res.write(res.statusCode.toString() + " " + body);
	 }else{
	 		// console.log(response.headers['content-type']);
      // res.writeHeader(response.statusCode, {"Content-Type": "application/json"});
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();	
});

})    

 // ************ get balance *************//
 app.get('/get-balance',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"eth_getBalance","params":["0xebfb0c43fa531b8e0c8fb993a141898c1b538463","latest"],"id":1})
};
request(options, function (error, response, body) {
	 if (!error && response.statusCode == 200) {
	 	 // res.writeHeader(200, {"Content-Type": "application/json"});
       res.write(res.statusCode.toString() + " " + body);
	 }else{
	 		// console.log(response.headers['content-type']);
      // res.writeHeader(response.statusCode, {"Content-Type": "application/json"});
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();	
});

}) 
 // ************ eth_mining *************//
 app.get('/eth_mining',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"eth_mining","params":[],"id":1})
};
request(options, function (error, response, body) {
	 if (!error && response.statusCode == 200) {
	 	 // res.writeHeader(200, {"Content-Type": "application/json"});
       res.write(res.statusCode.toString() + " " + body);
	 }else{
	 		// console.log(response.headers['content-type']);
      // res.writeHeader(response.statusCode, {"Content-Type": "application/json"});
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();	
});

}) 
 // ************ eth_syncing *************//
 app.get('/eth_syncing',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1})
};
request(options, function (error, response, body) {
	 if (!error && response.statusCode == 200) {
	 	 // res.writeHeader(200, {"Content-Type": "application/json"});
       res.write(res.statusCode.toString() + " " + body);
	 }else{
	 		// console.log(response.headers['content-type']);
      // res.writeHeader(response.statusCode, {"Content-Type": "application/json"});
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();	
});

}) 

  // ************ net_peerCount *************//
 app.get('/net_peerCount',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1})
};
request(options, function (error, response, body) {
   if (!error && response.statusCode == 200) {
     // res.writeHeader(200, {"Content-Type": "application/json"});
       res.write(res.statusCode.toString() + " " + body);
   }else{
      // console.log(response.headers['content-type']);
      // res.writeHeader(response.statusCode, {"Content-Type": "application/json"});
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();  
});

}) 

  // ************ net_version *************//
 app.get('/net_version',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"net_version","params":[],"id":1})
};
request(options, function (error, response, body) {
   if (!error && response.statusCode == 200) {
     // res.writeHeader(200, {"Content-Type": "application/json"});
       res.write(res.statusCode.toString() + " " + body);
   }else{
      // console.log(response.headers['content-type']);
      // res.writeHeader(response.statusCode, {"Content-Type": "application/json"});
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();  
});

}) 

 // ************ eth_sendTransaction *************//
 app.get('/eth_sendTransaction',function(req,res){
var options = {  
    url: "http://localhost:8501",
    method: 'POST',
    headers:
    { 
     "content-type": "application/json"
    },
    body: JSON.stringify({"jsonrpc":"2.0","method":"eth_sendTransaction","params":["from":"0xba9b4de55bfef9b025ad7153fa3e6f93590c0d28","to":"0xcb0fd475866cf2668ed3cbbc8214ad10420d2640","gas":"0x15f90","gasPrice":"0x430e23400","value":"1"],"id":1})
};
request(options, function (error, response, body) {
   if (!error && response.statusCode == 200) {
     // res.writeHeader(200, {"Content-Type": "application/json"});
       res.write(res.statusCode.toString() + " " + body);
   }else{
      // console.log(response.headers['content-type']);
      // res.writeHeader(response.statusCode, {"Content-Type": "application/json"});
      res.write(response.statusCode.toString() + " " + error);
    }
    res.end();  
});

}) 







app.get('/Login',function(req,res){
res.render('front/login') 
})  

app.get('/Forgot-password',function(req,res){
res.render('front/forgot-pass') 
})             


// ************ Contact us ************//
app.get('/contact-us',function(req,res){
//    OurServices.find({'deleted':'1','status':'active'},function(err,getData){ 
//       Product.find({deleted:'1','status':'active'},function(err,result){
//        Country.find({},function(err,condata){
//         res.render('front/contact_us',{
//          errors : "",
//          productData : result,
//          countryData : condata,
//          serGetDta  : getData
//       })
//     })    
//    }) 
// }) 
     
})

// ************ Submit contact us Contact us ************//
app.post('/submit-contact',function(req,res){
 

   // var name       = req.body.name;
   // var email      = req.body.email;
   // var mobile     = req.body.mobile;
   // var message    = req.body.message;
  
   // var dt = dateTime.create();
   // var d = dt.format('Y-m-d H:M:S');
   // var currentDate = d;
   // var created_at = currentDate;

  
   //  req.checkBody('name', 'Name is required!').notEmpty();
   //  req.checkBody('email', 'Email is required!').notEmpty();
   //  req.checkBody('mobile', 'Mobile is required!').notEmpty();
    
   //  var errors = req.validationErrors();
	
   //  if(errors){
     
   //    res.render('front/contact_us',{
   //      errors : errors,
   //   })

   //  }else{
     
   //             var contactData = new Contact({
   //              name           :  name,
   //              email          :  email,
   //              mobile         :  mobile,
   //              message        :  message,
   //              created_at     :  created_at
   //            })
   
   //               contactData.save(function (err) {
   //                          if (err) {
   //                          	res.send(err);
   //                          } else {
                
   //                              res.send('1');
   //                        }
   //                      });
   //       }
})

// ************ Submit Newsletter  ************//
app.post('/submit-newsletter',function(req,res){
 
  
 //   var email      = req.body.email;
   
 //   var dt = dateTime.create();
 //   var d = dt.format('Y-m-d H:M:S');
 //   var currentDate = d;
 //   var created_at = currentDate;

 //    NewsInfo.findOne({email:email},function(err,user){
 
 //       if (err)
 //              console.log(err);
                
 //        if(user){
 //                  res.send('0');

 //        }else{
 //           var NewsData = new NewsInfo({
 //                email           :  email,
 //                created_at     :  created_at
 //              })
   
 //                 NewsData.save(function (err) {
 //                            if (err) {
 //                            	res.send(err);
 //                            } else {
 //                  //******************* send email newsletter  ********************** // 
                              
 //                  //******************* send email newsletter ********************** //
 //                                res.send('1');
 //                          }
 //                        })
 //        }
 // })
})


// ************ Submit Blog comment ************//
app.post('/submit-blog-comment',function(req,res){
 

   // var name       = req.body.name;
   // var email      = req.body.email;
   // var subject     = req.body.subject;
   // var message    = req.body.message;
   // var blog_id    = req.body.blog_id;
   
  
   // var dt = dateTime.create();
   // var d = dt.format('Y-m-d H:M:S');
   // var currentDate = d;
   // var created_at = currentDate;

   //  var postData = new BlogComment({
   //              name           :  name,
   //              email          :  email,
   //              subject        :  subject,
   //              message        :  message,
   //              blog_id        :  blog_id,
   //              created_at     :  created_at
   //            })
   
   //               postData.save(function (err) {
   //                          if (err) {
   //                            res.send(err);
   //                          } else {
   //               //******************* send email Contact ********************** //             
   //                //******************* send email Contact ********************** //
   //                              res.send('1');
   //                        }
   //                      });
     
})


// ************ Submit Blog Like details  ************//
app.post('/submit-blog-like',function(req,res){
 

 //   var name       = req.body.name;
 //   var email      = req.body.email;
  
 //   var blog_id    = req.body.blog_id;
   
  
 //   var dt = dateTime.create();
 //   var d = dt.format('Y-m-d H:M:S');
 //   var currentDate = d;
 //   var created_at = currentDate;

 //    BlogLike.findOne({email:email,'status':'active','deleted':'1'},function(err,user){
 //    	if (err)
 //               return res.send(err);
                
 //        if(user){
 //                res.send('0');

 //        }else{
 //        	 var postData = new BlogLike({
 //                name           :  name,
 //                email          :  email,
 //                blog_id        :  blog_id,
 //                created_at     :  created_at
 //              })
   
 //                 postData.save(function (err) {
 //                            if (err) {
 //                              res.send(err);
 //                            } else {
 //                 //******************* send email Contact ********************** //             
 //                  //******************* send email Contact ********************** //
 //                                res.send('1');
 //                          }
 //                        });
 //        }

 // })    
})



// ************ Industies  ************//
app.get('/industies',function(req,res){
    // Industries.find({'deleted':'1','status':'active'}).sort({"_id":-1}).limit(8).exec(function(err,indstData) {
    //   OurServices.find({'deleted':'1','status':'active'},function(err,getData){ 
			 // Product.find({deleted:'1','status':'active'},function(err,result){
		  //      Country.find({},function(err,condata){
		  //     res.render('front/industies',{
		  //        errors : "",
		  //        productData : result,
		  //        countryData : condata,
    //              serGetDta   : getData,
    //               industData : indstData
		  //     })
		  //     })
    //          }) 
		  //  }) 
		  // }) 
 })


 




// ************ Industies -education  ************//
app.get('/industies-education',function(req,res){
 
 // OurServices.find({'deleted':'1','status':'active'},function(err,getData){ 
 //  OurProject.find({deleted:'1','status':'active'},function(err,projetcdata){ 
	
	//    Product.find({deleted:'1','status':'active'},function(err,result){
	// 	       Country.find({},function(err,condata){
	// 	      res.render('front/industies_education',{
	// 	         errors : "",
	// 	         productData : result,
	// 	         countryData : condata,
	// 	         projectData : projetcdata,
 //             serGetDta   : getData
	// 	       })
 //          })
	// 	   }) 
	// 	  }) 
	//    }) 
})


// ************ Services  ************//
app.get('/services/:id',function(req,res){
 //  services_id  = req.params.id;
 
 // OurServices.find({'deleted':'1','status':'active'},function(err,getData){ 
 //    SubServices.find({deleted:'1','status':'active','services_id':services_id},function(err,Subdata){  
	//    Product.find({deleted:'1','status':'active'},function(err,result){
	// 	       Country.find({},function(err,condata){
	// 	        res.render('front/inner_bitcoin',{ 
	// 	         errors : "",
	// 	         productData : result,
	// 	         countryData : condata,
	// 	         subSerdata : Subdata,
 //             serGetDta  : getData
	// 	         }) 
 //            }) 
	// 	     })
	// 	   }) 
	// 	  }) 
 })


// ************ Inner - bitcoin  ************//
app.get('/bitcoin',function(req,res){
  // OurServices.find({'deleted':'1','status':'active'},function(err,getData){ 
  //   Blockchain_services.find({deleted:'1','status':'active'},function(err,services){  
	 //   Product.find({deleted:'1','status':'active'},function(err,result){
		//        Country.find({},function(err,condata){
		//         res.render('front/inner_bitcoin',{ 
		//          errors : "",
		//          productData : result,
		//          countryData : condata,
		//          servicesDta : services,
		//          serGetDta  : getData

  //            }) 
  //           }) 
		//      })
		//    }) 
		//   }) 
 })

// ************ Inner - Crypto  ************//
app.get('/ethereum',function(req,res){
  // OurServices.find({'deleted':'1','status':'active'},function(err,getData){ 
	 //  Product.find({deleted:'1','status':'active'},function(err,result){
		//        Country.find({},function(err,condata){
		//           res.render('front/inner_ethereum',{
		//          errors : "",
		//          productData : result,
		//          countryData : condata,
  //            serGetDta   : getData
		//        })
  //         })
		//    }) 
		//   }) 
 })

// ************ Inner - Crypto  ************//
app.get('/ico',function(req,res){
  // OurServices.find({'deleted':'1','status':'active'},function(err,getData){
	 // Product.find({deleted:'1','status':'active'},function(err,result){
		//        Country.find({},function(err,condata){
		//            res.render('front/inner_ico',{
		//          errors : "",
		//          productData : result,
		//          countryData : condata,
  //            serGetDta  : getData
		//        })
  //         })
		//    }) 
		//   }) 
 })

// ************ Services   ************//
app.get('/services-deatails/:id',function(req,res){
// service_features_id = req.params.id;

// ServicesFeatures.find({'deleted':'1','status':'active','sub_services_id':service_features_id},function(err,serfData){
//   OurServices.find({'deleted':'1','status':'active'},function(err,getData){
//    Product.find({deleted:'1','status':'active'},function(err,result){
//            Country.find({},function(err,condata){
//                res.render('front/services_deatils',{
//              errors : "",
//              productData : result,
//              countryData : condata,
//              serGetDta   : getData,
//              featGetDta  : serfData
//             })
//            })
//           })
//        }) 
//       }) 
 })


// ************ Inner - Wallet  ************//
app.get('/wallet',function(req,res){
 //    Offices.find({status:'active',deleted:"1"})
 //            .populate('country','name')
 //            .exec(function(error, officeData) {
 //  OurServices.find({'deleted':'1','status':'active'},function(err,getData){            
	// Product.find({deleted:'1','status':'active'},function(err,result){
	// 	       Country.find({},function(err,condata){
	// 	            res.render('front/inner_wallet',{
	// 	         errors : "",
	// 	         productData : result,
	// 	         countryData : condata,
	// 	         officeData  : officeData,
 //              serGetDta  : getData

	// 	        })
 //          })
	// 	   }) 
	// 	  }) 
	//    }) 
  })


// ************ Inner - Wallet  ************//
app.get('/crypto',function(req,res){
 // OurServices.find({'deleted':'1','status':'active'},function(err,getData){  
	// Product.find({deleted:'1','status':'active'},function(err,result){
	// 	       Country.find({},function(err,condata){
	// 	            res.render('front/inner_crypto',{
	// 	         errors : "",
	// 	         productData : result,
	// 	         countryData : condata,
 //              serGetDta  : getData
	// 	       })
 //          })
	// 	   }) 
	// 	  }) 
  })


// ************ Our Partner  ************//
app.get('/our-partner',function(req,res){
 // OurServices.find({'deleted':'1','status':'active'},function(err,getData){ 
 //  OurProject.find({deleted:'1','status':'active'},function(err,projetcdata){
 //   Our_partner.find({deleted:'1','status':'active'},function(err,partnerresult){
	//  Product.find({deleted:'1','status':'active'},function(err,result){
	// 	       Country.find({},function(err,condata){
	// 	           res.render('front/our_partner',{
	// 	         errors : "",
	// 	         productData : result,
	// 	         countryData : condata,
 //             partnerData :partnerresult,
 //             projectData :projetcdata,
 //              serGetDta  : getData
	// 	       })
 //          })
	// 	    }) 
	// 	   }) 
 //      }) 
 //    })
   })

// ************ Our Partner  ************//
app.get('/product',function(req,res){
 // OurServices.find({'deleted':'1','status':'active'},function(err,getData){ 
	// Product.find({deleted:'1','status':'active'},function(err,result){
	// 	       Country.find({},function(err,condata){
	// 	             res.render('front/product',{
	// 	         errors : "",
	// 	         productData : result,
	// 	         countryData : condata,
 //              serGetDta  : getData
	// 	      })
 //          })
	// 	   }) 
	// 	  }) 
  })

// ************ About us    ************//
app.get('/about-us',function(req,res){
 // OurServices.find({'deleted':'1','status':'active'},function(err,getData){
	// Product.find({deleted:'1','status':'active'},function(err,result){
	// 	       Country.find({},function(err,condata){
	// 	             res.render('front/about_us',{
	// 	         errors : "",
	// 	         productData : result,
	// 	         countryData : condata,
 //             serGetDta  : getData
	// 	       })
 //          })
	// 	   }) 
	// 	  }) 
  })




// ************ Blog listing  category wise page     ************//
app.get('/category-blog-list/:cat_id',function(req,res){
// var cat_id = req.params.cat_id;	
// BlogCategoey.find({'deleted':'1','status':'active'},function(err,blogcatData){  
// Blogs.find({'deleted':'1','status':'active','blog_cat_id':cat_id}).sort({"_id":-1}).limit(3).exec(function(err, recblogData) {
// Blogs.find({'deleted':'1','status':'active','blog_cat_id':cat_id},function(err,GetblogData){
//  OurServices.find({'deleted':'1','status':'active'},function(err,getData){
//   Product.find({deleted:'1','status':'active'},function(err,result){
//            Country.find({},function(err,condata){
          
  
//                 res.render('front/blog_list',{
//              errors : "",
//              productData : result,
//              countryData : condata,
//              serGetDta   : getData,
//              Blogdata    : GetblogData,
//              RecBlogData : recblogData,
//              blogcatData : blogcatData,
//              })
//              })
//             })
//            })
//           })
//        }) 
//       }) 
  })


// ************ Blog listing page     ************//
app.get('/blog-details/:blog_id',function(req,res){
// var blog_id = req.params.blog_id; 

// BlogLike.count({'deleted':'1','status':'active','blog_id':blog_id},function(err,likecount){ 
// BlogLike.findOne({'deleted':'1','status':'active','blog_id':blog_id}).sort({"_id":-1}).limit(1).exec(function(err, likeData) {
// 	//console.log(likeData);

// BlogCategoey.find({'deleted':'1','status':'active'},function(err,blogcatData){  

// BlogComment.find({'deleted':'1','status':'active','blog_id':blog_id},function(err,blogcommentData){
//   Blogs.find({}).sort({"_id":-1}).limit(3).exec(function(err, recblogData) {

// // get Nextdata //
// Blogs.findOne({_id: {$gt: blog_id}}).sort({"_id":1}).limit(1).exec(function(err, nextData) {
    
 
// // get Privious data //
//  Blogs.findOne({_id: {$lt: blog_id}}).sort({"_id":-1}).limit(1).exec(function(err, beforData) {
     
 

// Blogs.findOne({'deleted':'1','status':'active','_id':blog_id},function(err,GetblogData){

//  OurServices.find({'deleted':'1','status':'active'},function(err,getData){
//   Product.find({deleted:'1','status':'active'},function(err,result){
//            Country.find({},function(err,condata){
//                  res.render('front/blog_details',{
// 	             errors : "",
// 	             productData : result,
// 	             countryData : condata,
// 	             serGetDta   : getData,
// 	             Blogdata    : GetblogData,
// 	             Blogcomment : blogcommentData,
// 	             RecBlogData : recblogData,
// 	             blogcatData : blogcatData,
// 	             likecount   : likecount,
// 	             likeData    : likeData,
// 	             nextData    : nextData,
// 	             beforData    : beforData,
             
//                    })
//                   })
//                 })
//                })
//               })
//               })
//              })
//             })
//            })
//           })
//        }) 
//       }) 
  })



// ************ Product details     ************//
app.get('/product-details/:id',function(req,res){
 // product_id = req.params.id;
 
 //   ProductFeatures.find({status:'active',deleted:"1","product_id":product_id})
 //            .populate('product_id','product_name')
 //            .exec(function(error, profetureData) {
 //  OurClient.find({deleted:'1','status':'active',"product_id":product_id},function(err,ClientData){            
 //  OurServices.find({'deleted':'1','status':'active'},function(err,getData){          
	// Product.find({deleted:'1','status':'active'},function(err,result){
	// 	       Country.find({},function(err,condata){
	// 	             res.render('front/product_details',{
	// 	         errors : "",
	// 	         productData   : result,
	// 	         countryData   : condata,
 //             profetureData : profetureData,
 //             clientdata    : ClientData,
 //              serGetDta    : getData
 //              })
 //              })
 //             })     
	// 	      })
	// 	   }) 
	// 	  }) 
  })



// ************ Submit contact inquiry   ************//

 app.post('/contact-inquiry',function(req,res){
    // var imageFile = typeof req.files.myFile !== "undefined" ? req.files.myFile.name : "";

    // var product_id       = req.body.product_intrest;
    // var email            = req.body.email;
    // var phone_number     = req.body.phone_number;
    // var company_name     = req.body.company_name;
    // var country_id       = req.body.country;
    // var first_name       = req.body.first_name;
    // var last_name        = req.body.last_name;
    // var full_name        = req.body.first_name+" "+req.body.last_name;
    // var comment          = req.body.comment;

    // var dt = dateTime.create();
    // var d = dt.format('Y-m-d H:M:S');
    // var currentDate = d;
   
    
    //     if(imageFile!=""){
    //             image  = imageFile;
    //            }else{
    //             image  = "";
    //            }

    //            inquiryData = new ContactInquiry({
    //                product_id   : product_id,
    //                email        : email,
    //                phone_number : phone_number,
    //                company_name : company_name,
    //                country_id   : country_id,
    //                first_name   : first_name,
    //                last_name    : last_name,
    //                full_name    : full_name,
    //                comment      : comment,
    //                attact_file  : image,
    //                created_at   : currentDate,
                 
    //            })


    //             inquiryData.save(function(err,result){

    //               if(err){
    //               	res.send('0');
    //                // req.flash('error', err);
    //                 //res.redirect('/front');
                  
    //               }else{
    //                  mkdirp('public/attach_file/', function (err) {
                      
    //                 });

    //                if (imageFile != "") {
                      
    //                     var imgpath = 'public/attach_file/'+ imageFile;
                   
    //                     req.files.myFile.mv(imgpath, function (err) {
                      

    //                     });
    //                 }
    //                 //res.send('1');
    //                 //************* Send Mail  START ***************//
    //                  var str = fs.readFileSync('/Quest_glt/public/email_template/template.ejs', 'utf8'); 
    //                  var messageHtml = ejs.render(str,
    //                  	{
    //                  		name:full_name,
    //                  		email:email,
    //                  		phone_number:phone_number,
    //                  		comment:comment,
    //                  	}
    //                  	)
    //                  var data = send_mail(messageHtml,"anitpatel@pwavetech.com","Contact Inquiry"); 
    //                  if(data){
    //                      res.send('1');
    //                  }else{
    //                       res.send('0');
    //                  }
    //                 //************* Send Mail   END ***************//
    //                 //res.send('1');
                   
 
    //               }

    //             })
      
})

 app.get('/testdata',function(req,res){
 
     // var str = fs.readFileSync('/Quest_glt/public/email_template/template.ejs', 'utf8'); 
     // var messageHtml = ejs.render(str,{title:"Test"})
     // var data = send_mail(messageHtml,"anitpatel@pwavetech.com","Contact Inquiry");  
   })
     
 

// Send mail use mail template // 

	// function send_mail(messageHtml,toemail,subject){
 //        var mailOptions = {
 //        from: 'questtestmail@gmail.com',
 //        to : 'anitpatel@pwavetech.com',
 //        subject : subject,
 //        html : messageHtml,
 //     };
 //     transporter.sendMail(mailOptions, function (error, response) {
 //        if (error) {
 //            return 0
 //          }else {
 //           return 1
 //       }
 //      });
	// }


app.get('/testQuesry',function(req,res){
 

     
/*BlogCategoey.aggregate([
   // {$group : {_id : {blog_cat_id: "$blog_cat_id"},total: { $sum: 1}}},
    //{$group : {_id : {blog_cat_id: "$blog_cat_id"}}},
    {$lookup: {from: "blogs", localField: "blog_cat_id", foreignField: "_id.blog_cat_id", as: "details"}},
    
    // {$match: {details: {$blog_cat_id: '$_id.$blog_cat_id'}}}
   // { "$unwind": { "path" : "$details" } },
    
], function (err, result) {
        if (err) {
           //console.log(err);
        } else {
        	 res.send(result);
            console.log(result);
        }
    });*/


// BlogCategoey.aggregate([
//      //{$group : {_id : {blog_cat_id: "$blog_cat_id"},total: { $sum: 1}}},
//     {
//         $lookup:
//         {
//             from: 'blogs',
//             localField: "_id",
//             foreignField: "_id.blog_cat_id",
//             as: 'Data'
//         },
      
//     },
     
//     {
//         $project:
//         {
//             _id: 1,
//             name: 1,
//             number_of_product: { $size: "$Data" },
//             blogs: "$Data"
//         }
//     }
// ], function (err, result) {
//         if (err) {
//            console.log(err);
//         } else {
//         	 res.send(result);
//             console.log(result);
//         }
//     });

});
function getJedisPromise(){
   // var promise = Blogs.find({}).exec();
   // return promise;
}

// ************  create Account *************//
// app.get('/start-geth',function(req,res){
//   var options = {  
//     url: "http://192.168.1.34:8000",
//     method: 'POST',
//     headers:
//     { 
//      "content-type": "application/json"
//     },
//     body: JSON.stringify({"jsonrpc":"2.0","method":"miner_start","params":[],"id":1})
// };
// request(options, function (error, response, body) {
// if (!error && response.statusCode == 200) {
//     console.log(body)      
// }else{
//       res.write(response.statusCode.toString() + " " + error);
//     }
//     res.end();  
// });

// });   


app.get('/testAgain',function(req,res){

	 // var nedata = Prodata;

});



 module.exports = app;