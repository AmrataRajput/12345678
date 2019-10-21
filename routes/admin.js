var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var path = require('path');
var passport = require('passport');
var nodemailer = require('nodemailer');

var dateTime = require('node-datetime');


// Get Users model
var Admin = require('../models/admin');

// var {Country,Contact,NewsInfo,Product,ContactInquiry,Testimonials,Blockchain_services,Our_partner,OurProject,Blogs,Offices,OurExpertise,ProductFeatures,OurClient,OurServices,SubServices,ServicesFeatures,Industries,BlogCategoey} = require('../models/contact');
var {Registration,Userwallet,Importwallet,Tokendetails} = require('../models/contact');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
// app.set('view engine', 'ejs');
// app.use(bodyParser.json());



// ************  Index pages *************//
 app.get('/',function(req,res){
    
     res.render('admin/login',{
     errors : "",
     })
})

app.post('/login', function (req, res, next) {
//  return res.send(req.body);
   passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin',
        failureFlash: true,
        badRequestMessage: 'Invalid Email or Password.',
    })(req, res, next);
  
});

// ************  Admin dasboard pages *************//
 app.get('/dashboard',isAdmin,function(req,res){
    res.render('admin/index',{
       errors : "",  
   })
})

 // ************  Admin dasboard pages *************//
 app.get('/profile',isAdmin,function(req,res){
    res.render('admin/profile',{
       errors : "",  
   })
})

 // ************  Admin Update profile *************//

 
app.post('/update-profile',isAdmin,function(req,res){
    var imageFile = typeof req.files.profile_image !== "undefined" ? req.files.profile_image.name : "";
     var name          = req.body.name;
     //var email         = req.body.email;
     var mobile        = req.body.mobile;
     var address       = req.body.address;
    
        if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.profile_image_post;
               }


                updateData = {name:name,mobile:mobile,address:address,image:image};
              //  return res.send(product);
                Admin.findByIdAndUpdate(req.user.id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/profile');
                  }else{
                     mkdirp('public/profile_images/' + req.user.id, function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/profile_images/' + req.user.id + '/' + imageFile;
                   
                        req.files.profile_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Profile update successfully.");
                    res.redirect('/admin/profile'); 
                  }

                })
       })



 //****************** Admin logout ****************//
app.get('/logout',isAdmin, function (req, res) {
     req.logout();
     req.flash('success', 'You are logged out!');
     res.redirect('/admin');

});


//**************** Contact list ************//

 app.get('/contact-list',isAdmin,function(req,res){
        Contact.find({deleted:1,status:'active'},function(err,result){
           res.render('admin/contact_list',{
           errors      : "", 
           contactData : result,  
       })
     })
   
})


//**************** Newsletter list ************//

 app.get('/newsletter-list',isAdmin,function(req,res){
        NewsInfo.find({deleted:1},function(err,result){
           res.render('admin/email_list',{
           errors      : "", 
           emailData : result,  
       })
     })
   
})


 //**************** product  list ************//

 app.get('/product-list',isAdmin,function(req,res){
        
        Product.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {
            res.render('admin/product_list',{
                    errors      : "", 
                    productData : result, 
                  })
    })

})

 //**************** Add product  ************//

 app.get('/add-product',isAdmin,function(req,res){
        res.render('admin/add_product',{
           errors      : "", 
       })
})


 //**************** Submit  product  ************//

 app.post('/submit-product',isAdmin,function(req,res){
    var imageFile = typeof req.files.product_image !== "undefined" ? req.files.product_image.name : "";
    var product_name       = req.body.product_name;
    var description         = req.body.description;
    var demo_url            = req.body.demo_url;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
   
    
        if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               productData = new Product({
                   product_name : product_name,
                   description  : description,
                   product_image: imageFile,
                   demo_url     : demo_url,
                   created_at   : currentDate,
                   created_by   : req.user.id,
                
               })


                productData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-product');
                  }else{
                     mkdirp('public/product_images/' + productData._id, function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/product_images/' + productData._id + '/' + imageFile;
                   
                        req.files.product_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Product Added successfully.");
                    res.redirect('/admin/product-list'); 
                  }

                })
      
})

// **************  Edit product ***************//


 app.get('/edit-product/:id',isAdmin,function(req,res){
     product_id = req.params.id;
     Product.findOne({deleted:"1",_id:product_id},function(err,result){
            res.render('admin/edit_product',{
            errors      : "", 
            productData : result, 
         })
     });
       
})

 app.post('/update-product',isAdmin,function(req,res){
    var imageFile = typeof req.files.product_image !== "undefined" ? req.files.product_image.name : "";
    var product_name       = req.body.product_name;
    var description         = req.body.description;
    var demo_url            = req.body.demo_url;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
   
    
        if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.product_image_post;
               }

               updateData = {
                   product_name : product_name,
                   description  : description,
                   demo_url     : demo_url,
                   product_image: image,
                   created_at   : currentDate,
                   created_by   : req.user.id,
                
               }


                Product.findByIdAndUpdate(req.body.product_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-product/'+req.body.product_id);
                  }else{
                     mkdirp('public/product_images/' + req.body.product_id, function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/product_images/' + req.body.product_id + '/' + imageFile;
                   
                        req.files.product_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Product Update successfully.");
                    res.redirect('/admin/product-list'); 
                  }

                })
      
})


  app.get('/delete-product/:id',isAdmin,function(req,res){
     product_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   


     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                
               }


                Product.findByIdAndUpdate(product_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could Not delete try after sometime ");
                      res.redirect('/admin/product-list');
                  }else{
                     req.flash('success', "Product deleted successfully.");
                     res.redirect('/admin/product-list'); 
                  }
                });
     
       
})

/// ****************  Get Contact Inquiry list **********************//

app.get('/inquiry-list',isAdmin,function(req,res){
  
     ContactInquiry.find({status:'active',deleted:"1"})
            .populate('product_id','product_name')
            .populate('country_id','name')
            .exec(function(error, result) {
                  
            res.render('admin/inquiry_list',{
                    errors      : "", 
                    inquiryData : result, 
                  })
    })
     
}) 


// *************************  Strat Testimonials section ******************************//

//**************** Testimonials   list ************//

 app.get('/testimonial-list',isAdmin,function(req,res){
        
        Testimonials.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {
            res.render('admin/testimonial_list',{
                    errors      : "", 
                    productData : result, 
                  })
    })

})

//**************** Add Testimonials  ************//

 app.get('/add-testimonial',isAdmin,function(req,res){
        res.render('admin/add_testimonial',{
           errors      : "", 
       })
}) 


/// *******************   submit testimonial ***********************  //



app.post('/submit-testimonial',isAdmin,function(req,res){

  
    var imageFile = typeof req.files.profile_image !== "undefined" ? req.files.profile_image.name : "";
    var name              = req.body.name;
    var designation       = req.body.designation;
    var description       = req.body.description;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               testimoData = new Testimonials({
                   name         : name,
                   designation  : designation,
                   description  : description,
                   profile_image: imageFile,
                   created_at   : currentDate,
                   created_by   : req.user.id,
                
               })


                testimoData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-testimonial');
                  }else{
                     mkdirp('public/testimonial_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/testimonial_images/' + imageFile;
                   
                        req.files.profile_image.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Testimonial Added successfully.");
                    res.redirect('/admin/testimonial-list'); 
                  }

                })
      
})


// **************  Edit product ***************//


 app.get('/edit-testimonial/:id',isAdmin,function(req,res){
     testimo_id = req.params.id;
     Testimonials.findOne({deleted:"1",_id:testimo_id},function(err,result){
            res.render('admin/edit_testimonial',{
            errors      : "", 
            testimoData : result, 
         })
     });
       
})

 app.post('/update-testimonial',isAdmin,function(req,res){
    var imageFile = typeof req.files.profile_image !== "undefined" ? req.files.profile_image.name : "";
    var name              = req.body.name;
    var designation       = req.body.designation;
    var description       = req.body.description;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.profile_image_post;;
               }

               testimoData =  {
                   name         : name,
                   designation  : designation,
                   description  : description,
                   profile_image: image,
                   updated_at   : currentDate,
                   updated_by   : req.user.id,
                
               }

        Testimonials.findByIdAndUpdate(req.body.testimo_id,{$set:testimoData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-testimonial/'+req.body.testimo_id);
                  }else{
                     mkdirp('public/testimonial_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/testimonial_images/' + imageFile;
                   
                        req.files.profile_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Testimonial Update successfully.");
                    res.redirect('/admin/testimonial-list'); 
                  }

                })
      
})


  app.get('/delete-testimonial/:id',isAdmin,function(req,res){
     product_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                
               }

       Testimonials.findByIdAndUpdate(product_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could Not delete try after sometime ");
                     res.redirect('/admin/testimonial-list'); 
                  }else{
                     req.flash('success', "Testimonial deleted successfully.");
                    res.redirect('/admin/testimonial-list'); 
                  }
                });
     
       
})


//*************  End Testimonials section ****************//

// ***************  Start blockchain service section **********//


app.get('/blockchain-services-list',isAdmin,function(req,res){
        
        Blockchain_services.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {
            res.render('admin/blockchain_services_list',{
                    errors      : "", 
                    servicesData : result, 
                  })
    })

})

//**************** Add Testimonials  ************//

 app.get('/add-blockchain_services',isAdmin,function(req,res){
        res.render('admin/add_blockchain_services',{
           errors      : "", 
       })
}) 


/// *******************   submit testimonial ***********************  //



app.post('/submit-blockchain_services',isAdmin,function(req,res){

  
    var imageFile = typeof req.files.services_image !== "undefined" ? req.files.services_image.name : "";
    var name              = req.body.services_name;
    
    var description       = req.body.description;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               submitData = new Blockchain_services({
                   name         : name,
                   description  : description,
                   services_image: imageFile,
                   created_at   : currentDate,
                   created_by   : req.user.id,
                
               })


                submitData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-blockchain_services');
                  }else{
                     mkdirp('public/blockchainservices_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/blockchainservices_images/' + imageFile;
                   
                        req.files.services_image.mv(imgpath, function (err) {
                        
                        });
                    }
                  req.flash('success', "Blockchain services Added successfully.");
                    res.redirect('/admin/blockchain-services-list'); 
                  }

                })
      
})


// **************  Edit product ***************//


 app.get('/edit-blockchain_services/:id',isAdmin,function(req,res){
     services_id = req.params.id;
     Blockchain_services.findOne({deleted:"1",_id:services_id},function(err,result){
            res.render('admin/edit_blockchain_services',{
            errors      : "", 
            servicesData : result, 
         })
     });
       
})

 app.post('/update-blockchain_services',isAdmin,function(req,res){
    var imageFile = typeof req.files.services_image !== "undefined" ? req.files.services_image.name : "";
    var name              = req.body.services_name;
    var description       = req.body.description;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.services_image_post;;
               }

               servicesData =  {
                   name         : name,
                   description  : description,
                   services_image: image,
                   updated_at   : currentDate,
                   updated_by   : req.user.id,
                
               }

        Blockchain_services.findByIdAndUpdate(req.body.services_id,{$set:servicesData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-blockchain_services/'+req.body.services_id);
                  }else{
                     mkdirp('public/blockchainservices_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/blockchainservices_images/' + imageFile;
                   
                        req.files.services_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Blockchain services Update successfully.");
                    res.redirect('/admin/blockchain-services-list'); 
                  }

                })
      
})


  app.get('/delete-blockchain_services/:id',isAdmin,function(req,res){
     services_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                
               }

       Blockchain_services.findByIdAndUpdate(services_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could Not delete try after sometime ");
                     res.redirect('/admin/blockchain-services-list'); 
                  }else{
                     req.flash('success', "Blockchain deleted successfully.");
                     res.redirect('/admin/blockchain-services-list'); 
                  }
                });
     
       
})

// *****************  Start Our Partner section **********************//


//**************** Our Partner list  ************//

 app.get('/our-partner-list',isAdmin,function(req,res){
        
        Our_partner.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {

            res.render('admin/our_partner_list',{
                    errors      : "", 
                    partnerData : result, 
                  })
    })

})

//**************** Add our partner   ************//

 app.get('/add-our-partner',isAdmin,function(req,res){
        res.render('admin/add_our_partner',{
           errors      : "", 
       })
}) 


/// *******************   submit our partner  ***********************  //



app.post('/submit-our-partner',isAdmin,function(req,res){

 
    var imageFile = typeof req.files.logo_image !== "undefined" ? req.files.logo_image.name : "";
    var partner_name      = req.body.partner_name;
    var description       = req.body.description;
    var website_url       = req.body.website_url;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               partnerData = new Our_partner({
                   partner_name : partner_name,
                   description  : description,
                   website_url  : website_url,
                   image        : imageFile,
                   created_at   : currentDate,
                   created_by   : req.user.id,
                
               })


                partnerData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-our-partner');
                  }else{
                     mkdirp('public/our_partner_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/our_partner_images/' + imageFile;
                   
                        req.files.logo_image.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Our partner added successfully.");
                    res.redirect('/admin/our-partner-list'); 
                  }

                })
      
})


// **************  Edit our partner  ***************//


 app.get('/edit-our-partner/:id',isAdmin,function(req,res){
     partner_id = req.params.id;
     Our_partner.findOne({deleted:"1",_id:partner_id},function(err,result){
            res.render('admin/edit_our_partner',{
            errors      : "", 
            partnerData : result, 
         })
     });
       
})

 app.post('/update-our-partner',isAdmin,function(req,res){
    var imageFile = typeof req.files.logo_image !== "undefined" ? req.files.logo_image.name : "";
    var partner_name      = req.body.partner_name;
    var description       = req.body.description;
    var website_url       = req.body.website_url;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.logo_image_post;;
               }

               updateData =  {
                   partner_name : partner_name,
                   description  : description,
                   profile_image: image,
                   updated_at   : currentDate,
                   updated_by   : req.user.id,
                
               }

        Our_partner.findByIdAndUpdate(req.body.partner_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-our-partner/'+req.body.partner_id);
                  }else{
                     mkdirp('public/our_partner_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/our_partner_images/' + imageFile;
                   
                        req.files.logo_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Our partner update successfully.");
                    res.redirect('/admin/our-partner-list'); 
                  }

                })
      
})


  app.get('/delete-our-partner/:id',isAdmin,function(req,res){
     partner_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       Our_partner.findByIdAndUpdate(partner_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/our-partner-list'); 
                  }else{
                     req.flash('success', "Our partner deleted successfully.");
                    res.redirect('/admin/our-partner-list'); 
                  }
                });
     
       
})


  // *****************  Start Our Related project  section **********************//


//**************** Our project list  list  ************//

 app.get('/our-project-list',isAdmin,function(req,res){
        
        OurProject.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {

            res.render('admin/our_project_list',{
                    errors      : "", 
                    projectData : result, 
                  })
    })

})

//**************** Add Our partner  ************//

 app.get('/add-our-project',isAdmin,function(req,res){
        res.render('admin/add_our_project',{
           errors      : "", 
       })
}) 


/// *******************   submit testimonial ***********************  //



app.post('/submit-our-project',isAdmin,function(req,res){

 
    var imageFile = typeof req.files.logo_image !== "undefined" ? req.files.logo_image.name : "";
    
    var website_url       = req.body.website_url;
    var project_name      = req.body.project_name;
    var description       = req.body.description;

    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               projectData = new OurProject({
                 
                   website_url  : website_url,
                   project_name : project_name,
                   description  : description,
                   image        : imageFile,
                   created_at   : currentDate,
                   created_by   : req.user.id,
                
               })


                projectData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-our-project');
                  }else{
                     mkdirp('public/our_project_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/our_project_images/' + imageFile;
                   
                        req.files.logo_image.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Our Project added successfully.");
                    res.redirect('/admin/our-project-list'); 
                  }

                })
      
})


// **************  Edit product ***************//


 app.get('/edit-our-project/:id',isAdmin,function(req,res){
     project_id = req.params.id;
     OurProject.findOne({deleted:"1",_id:project_id},function(err,result){
            res.render('admin/edit_our_project',{
            errors      : "", 
            projectData : result, 
         })
     });
       
})

 app.post('/update-our-project',isAdmin,function(req,res){
    var imageFile = typeof req.files.logo_image !== "undefined" ? req.files.logo_image.name : "";
   
    var website_url       = req.body.website_url;
    var project_name      = req.body.project_name;
    var description       = req.body.description;

    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.logo_image_post;;
               }

               updateData =  {
                   
                   image        : image,
                   website_url  : website_url,
                   project_name : project_name,
                   description  : description,
                   updated_at   : currentDate,
                   updated_by   : req.user.id,
                
               }

        OurProject.findByIdAndUpdate(req.body.project_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-our-project/'+req.body.project_id);
                  }else{
                     mkdirp('public/our_project_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/our_project_images/' + imageFile;
                   
                        req.files.logo_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Our partner update successfully.");
                    res.redirect('/admin/our-project-list'); 
                  }

                })
      
})


  app.get('/delete-our-project/:id',isAdmin,function(req,res){
     project_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       OurProject.findByIdAndUpdate(project_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/our-project-list'); 
                  }else{
                     req.flash('success', "Our Project deleted successfully.");
                    res.redirect('/admin/our-project-list'); 
                  }
                });
     
       
})


   // *****************  Start Our Blog and News **********************//


//****************  Blogs list    ************//

 app.get('/blogs-list',isAdmin,function(req,res){
        
        Blogs.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {

            res.render('admin/blogs_list',{
                    errors      : "", 
                    blogsData : result, 
                  })
    })

})

//**************** Add Blog  ************//

 app.get('/add-blogs',isAdmin,function(req,res){
  
  BlogCategoey.find({'status':"active",'deleted':'1'},function(err,catData){
        res.render('admin/add_blogs',{
           errors      : "",
           Catdata      : catData, 
        })
       })
}) 


/// *******************   submit Blogs ***********************  //



app.post('/submit-blogs',isAdmin,function(req,res){

 
    var imageFile = typeof req.files.blogimage !== "undefined" ? req.files.blogimage.name : "";
    var blog_cat_id      =  req.body.blog_cat_id;
    var heading           = req.body.heading;
    var description       = req.body.description;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var post_date = dt.format('Y-m-d');
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               bData = new Blogs({
                 
                   heading      : heading,
                   blog_cat_id  : blog_cat_id,
                   description  : description,
                   image        : imageFile,
                   post_date    : post_date,
                   created_at   : currentDate,
                   created_by   : req.user.id,
                
               })


                bData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-blogs');
                  }else{
                     mkdirp('public/blogs_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/blogs_images/' + imageFile;
                   
                        req.files.blogimage.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Blogs added successfully.");
                    res.redirect('/admin/blogs-list'); 
                  }

                })
      
})


// **************  Edit Blogs ***************//


 app.get('/edit-blogs/:id',isAdmin,function(req,res){
     blogs_id = req.params.id;
     BlogCategoey.find({'status':"active",'deleted':'1'},function(err,catData){
     Blogs.findOne({deleted:"1",_id:blogs_id},function(err,result){
            res.render('admin/edit_blogs',{
            errors      : "", 
            blogsData : result,
            Catdata      : catData,  
          })
         })
     });
})

 app.post('/update-blogs',isAdmin,function(req,res){
    var imageFile = typeof req.files.blogimage !== "undefined" ? req.files.blogimage.name : "";
    var blog_cat_id      =  req.body.blog_cat_id;
    var heading           = req.body.heading;
    var description       = req.body.description;

    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
    var post_date = dt.format('Y-m-d');

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.blogimage_post;;
               }

               updateData =  {
                   
                   image        : image,
                   heading      : heading,
                   blog_cat_id  : blog_cat_id,
                   description  : description,
                   post_date    : post_date,
                   updated_at   : currentDate,
                   updated_by   : req.user.id,
                
               }

        Blogs.findByIdAndUpdate(req.body.blogs_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-blogs/'+req.body.blogs_id);
                  }else{
                     mkdirp('public/blogs_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/blogs_images/' + imageFile;
                   
                        req.files.blogimage.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Blogs update successfully.");
                    res.redirect('/admin/blogs-list'); 
                  }

                })
      
})

 //**************** delete blogs *************//

  app.get('/delete-blogs/:id',isAdmin,function(req,res){
     blogs_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       Blogs.findByIdAndUpdate(blogs_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/blogs-list'); 
                  }else{
                     req.flash('success', "Blogs deleted successfully.");
                    res.redirect('/admin/blogs-list'); 
                  }
                });
     
       
})


// *****************  Start Our Offices Section  **********************//


//****************  Office list    ************//

 app.get('/office-list',isAdmin,function(req,res){
        
        Offices.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .populate('country','name')
            .exec(function(error, result) {

            res.render('admin/office_list',{
                    errors      : "", 
                    officeData : result, 
                  })
    })

})

//**************** Add Ofiice  ************//

 app.get('/add-office',isAdmin,function(req,res){
   Country.find({},function(err,condata){
        res.render('admin/add_office',{
           errors      : "", 
           countryData      : condata, 
          })
      })
}) 


/// *******************   submit Blogs ***********************  //



app.post('/submit-office',isAdmin,function(req,res){

 
    var imageFile = typeof req.files.officeimage !== "undefined" ? req.files.officeimage.name : "";
    
    var address           = req.body.address;
    var phone_no          = req.body.phone_no;
    var email             = req.body.email;
    var country_id             = req.body.country_id;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               OfficeData = new Offices({
                 
                   address      : address,
                   phone_no     : phone_no,
                   email        : email,
                   country      : country_id,
                   image        : imageFile,
                   created_at   : currentDate,
                   created_by   : req.user.id,
                
               })


                OfficeData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-office');
                  }else{
                     mkdirp('public/office_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/office_images/' + imageFile;
                   
                        req.files.officeimage.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Office added successfully.");
                    res.redirect('/admin/office-list'); 
                  }

                })
      
})


// **************  Edit Office details  ***************//


 app.get('/edit-office/:id',isAdmin,function(req,res){
     office_id = req.params.id;
     Offices.findOne({deleted:"1",_id:office_id},function(err,result){
      Country.find({},function(err,condata){
            res.render('admin/edit_office',{
            errors      : "", 
            officeData : result, 
            countryData : condata, 
          })
        })
    });
       
})

 app.post('/update-office',isAdmin,function(req,res){
    var imageFile = typeof req.files.officeimage !== "undefined" ? req.files.officeimage.name : "";
   
   var  address           = req.body.address;
    var phone_no          = req.body.phone_no;
    var email             = req.body.email;
    var country_id        = req.body.country_id;

    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.officeimage_post;;
               }

               updateData =  {
                   
                   image        : image,
                   address      : address,
                   phone_no     : phone_no,
                   email        : email,
                   country      : country_id,
                   updated_at   : currentDate,
                   updated_by   : req.user.id,
                
               }

        Offices.findByIdAndUpdate(req.body.office_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-office/'+req.body.office_id);
                  }else{
                     mkdirp('public/office_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/office_images/' + imageFile;
                   
                        req.files.officeimage.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Office update successfully.");
                    res.redirect('/admin/office-list'); 
                  }

                })
      
})

 //**************** delete blogs *************//

  app.get('/delete-office/:id',isAdmin,function(req,res){
     office_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       Offices.findByIdAndUpdate(office_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/office-list'); 
                  }else{
                     req.flash('success', "Office deleted successfully.");
                    res.redirect('/admin/office-list'); 
                  }
                });
    
       
})


  // *****************  Start Our Expertise Section  **********************//


//****************  Expertise list    ************//

 app.get('/expertise-list',isAdmin,function(req,res){
        
        OurExpertise.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .populate('country','name')
            .exec(function(error, result) {

            res.render('admin/expertise_list',{
                    errors      : "", 
                    ExData : result, 
                  })
    })

})

//**************** Add Expertise  ************//

 app.get('/add-expertise',isAdmin,function(req,res){
   
        res.render('admin/add_expertise',{
           errors      : "", 
           })
   
}) 


/// *******************   submit Expertise ***********************  //



app.post('/submit-expertise',isAdmin,function(req,res){

 
    var imageFile = typeof req.files.officeimage !== "undefined" ? req.files.officeimage.name : "";
    
    var field_name        = req.body.field_name;
    var description       = req.body.description;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               ExData = new OurExpertise({
                 
                   field_name      : field_name,
                   description     : description,
                   image           : imageFile,
                   created_at      : currentDate,
                   created_by      : req.user.id,
                
               })


                ExData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-expertise');
                  }else{
                     mkdirp('public/expertise_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/expertise_images/' + imageFile;
                   
                        req.files.officeimage.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Expertise added successfully.");
                    res.redirect('/admin/expertise-list'); 
                  }

                })
      
})


// **************  Edit Expertise details  ***************//


 app.get('/edit-expertise/:id',isAdmin,function(req,res){
    expertise_id = req.params.id;
     OurExpertise.findOne({deleted:"1",_id:expertise_id},function(err,result){
        res.render('admin/edit_expertise',{
            errors      : "", 
            experData : result, 
           })
        })
})

 app.post('/update-expertise',isAdmin,function(req,res){
    var imageFile = typeof req.files.officeimage !== "undefined" ? req.files.officeimage.name : "";
   
    var field_name        = req.body.field_name;
    var description       = req.body.description;

    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.officeimage_post;;
               }

               updateData =  {
                   
                   field_name   : field_name,
                   address      : description,
                   image        : image,
                   updated_at   : currentDate,
                   updated_by   : req.user.id,
                
               }

        OurExpertise.findByIdAndUpdate(req.body.expertise_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-expertise/'+req.body.expertise_id);
                  }else{
                     mkdirp('public/expertise_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/expertise_images/' + imageFile;
                   
                        req.files.officeimage.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Expertise update successfully.");
                    res.redirect('/admin/expertise-list'); 
                  }

                })
      
})

 //**************** delete blogs *************//

  app.get('/delete-expertise/:id',isAdmin,function(req,res){
     expertise_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       Offices.findByIdAndUpdate(expertise_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/office-list'); 
                  }else{
                     req.flash('success', "Expertise deleted successfully.");
                    res.redirect('/admin/expertise-list'); 
                  }
                });
    
       
})


  // *****************  Start Product features   **********************//


//****************  Product features list    ************//

 app.get('/product-features-list',isAdmin,function(req,res){
        
        ProductFeatures.find({status:'active',deleted:"1"})
            .populate('product_id','product_name')
            .populate('created_by','name')
            .exec(function(error, result) {
              
             res.render('admin/product_features_list',{
                    errors      : "", 
                    proData : result, 
                 })
    })

})

//**************** Add Expertise  ************//

 app.get('/add-product-features',isAdmin,function(req,res){
    Product.find({deleted:'1','status':'active'},function(err,result){
        res.render('admin/add_product_features',{
           errors      : "", 
           productData :result,
           })
  }) 
}) 


/// *******************   submit Expertise ***********************  //



app.post('/submit-product-features',isAdmin,function(req,res){

 
    var imageFile = typeof req.files.featuresimage !== "undefined" ? req.files.featuresimage.name : "";
    var product_id        = req.body.product_id;
    var heading           = req.body.heading;
    var description       = req.body.description;
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               ExData = new ProductFeatures({
                 
                   product_id       : product_id,
                   heading         : heading,
                   description     : description,
                   features_image  : imageFile,
                   created_at      : currentDate,
                   created_by      : req.user.id,
                
               })


                ExData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-product-features');
                  }else{
                     mkdirp('public/product_features_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/product_features_images/' + imageFile;
                   
                        req.files.featuresimage.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Product features added successfully.");
                    res.redirect('/admin/product-features-list'); 
                  }

                })
      
})


// **************  Edit Expertise details  ***************//


 app.get('/edit-product-features/:id',isAdmin,function(req,res){
    features_id = req.params.id;
    Product.find({deleted:'1','status':'active'},function(err,productlist){
     ProductFeatures.findOne({deleted:"1",_id:features_id},function(err,result){
       res.render('admin/edit_product_features',{
            errors      : "", 
            proData     : result, 
            productData : productlist, 
            product_id : result.product_id, 
           })
         })
      })
})

 

 app.post('/update-product-features',isAdmin,function(req,res){
    var imageFile = typeof req.files.featuresimage !== "undefined" ? req.files.featuresimage.name : "";
   
    var product_id        = req.body.product_id;
    var heading           = req.body.heading;
    var description       = req.body.description;

    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.featuresimage_post;;
               }

               updateData =  {
                   
                   product_id      : product_id,
                   heading         : heading,
                   description     : description,
                   features_image  : imageFile,
                   updated_at      : currentDate,
                   updated_by      : req.user.id,
                
               }

        ProductFeatures.findByIdAndUpdate(req.body.features_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-product-features/'+req.body.features_id);
                  }else{
                     mkdirp('public/product_features_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/product_features_images/' + imageFile;
                   
                        req.files.featuresimage.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Product features update successfully.");
                    res.redirect('/admin/product-features-list'); 
                  }

                })
      
})

 //**************** delete blogs *************//

  app.get('/delete-product-features/:id',isAdmin,function(req,res){
     features_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       ProductFeatures.findByIdAndUpdate(features_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/product-features-list'); 
                  }else{
                     req.flash('success', "Product features deleted successfully.");
                    res.redirect('/admin/product-features-list'); 
                  }
                });
    
       
})


  // *****************  Start Our client section (Product wise )   **********************//


//****************  Client  list    ************//

 app.get('/client-list',isAdmin,function(req,res){
        
        OurClient.find({status:'active',deleted:"1"})
            .populate('product_id','product_name')
            .populate('created_by','name')
            .exec(function(error, result) {
            
             res.render('admin/client_list',{
                    errors      : "", 
                    clientData : result, 
                 })
    })

})

//**************** Add Client   ************//

 app.get('/add-client',isAdmin,function(req,res){
  OurClient.find({deleted:'1','status':'active'},function(err,clientlist){
    Product.find({deleted:'1','status':'active'},function(err,result){
        res.render('admin/add_client',{
           errors      : "", 
           productData : result,
           clientData  : clientlist,
           })
        })
   }) 
}) 


/// *******************   submit Client  ***********************  //

app.post('/submit-client',isAdmin,function(req,res){

 
    var imageFile = typeof req.files.clientimage !== "undefined" ? req.files.clientimage.name : "";
    var product_id        = req.body.product_id;
    var client_name       = req.body.client_name;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               clientData = new OurClient({
                 
                   product_id      : product_id,
                   client_name     : client_name,
                   image           : imageFile,
                   created_at      : currentDate,
                   created_by      : req.user.id,
                
               })


                clientData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-client');
                  }else{
                     mkdirp('public/client_images/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/client_images/' + imageFile;
                   
                        req.files.clientimage.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Client added successfully.");
                    res.redirect('/admin/client-list'); 
                  }

                })
      
})


// **************  Edit Client  ***************//


 app.get('/edit-client/:id',isAdmin,function(req,res){
    client_id = req.params.id;
    Product.find({deleted:'1','status':'active'},function(err,productlist){
     OurClient.findOne({deleted:"1",_id:client_id},function(err,result){
       res.render('admin/edit_client',{
            errors      : "", 
            clientData  : result, 
            productData : productlist, 
            product_id : result.product_id, 
           })
         })
      })
})

 

 app.post('/update-client',isAdmin,function(req,res){
    var imageFile = typeof req.files.clientimage !== "undefined" ? req.files.clientimage.name : "";
   
    var product_id        = req.body.product_id;
    var client_name       = req.body.client_name;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.clientimage_post;;
               }

               updateData =  {
                   
                   product_id      : product_id,
                   client_name     : client_name,
                   
                   image           : image,
                   updated_at      : currentDate,
                   updated_by      : req.user.id,
                
               }

        OurClient.findByIdAndUpdate(req.body.client_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-client/'+req.body.client_id);
                  }else{
                     mkdirp('public/client_images/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/client_images/' + imageFile;
                   
                        req.files.clientimage.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Client  update successfully.");
                    res.redirect('/admin/client-list'); 
                  }

                })
      
})

 //**************** delete client  *************//

  app.get('/delete-client/:id',isAdmin,function(req,res){
     client_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       OurClient.findByIdAndUpdate(client_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/client-list'); 
                  }else{
                     req.flash('success', "Client deleted successfully.");
                    res.redirect('/admin/client-list'); 
                  }
                });
    
})

    // *****************  Start Our Services  section **********************//


//****************  Services  list    ************//

 app.get('/services-list',isAdmin,function(req,res){
        
        OurServices.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {
            
             res.render('admin/services_list',{
                    errors      : "", 
                    servicesData : result, 
                 })
    })

})

//**************** Add Services  ************//

 app.get('/add-services',isAdmin,function(req,res){
  
    Product.find({deleted:'1','status':'active'},function(err,result){
        res.render('admin/add_services',{
           errors      : "", 
           productData : result,
          
           })
        })
   }) 
 


/// *******************   submit Services  ***********************  //

app.post('/submit-services',isAdmin,function(req,res){

 
    var imageFile = typeof req.files.serviceimage !== "undefined" ? req.files.serviceimage.name : "";
    
    var services_name       = req.body.services_name;
    var description         = req.body.description;
    
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

               serviceData = new OurServices({
                 
                 
                   services_name   : services_name,
                   description     : description,
                   services_image  : imageFile,
                   created_at      : currentDate,
                   created_by      : req.user.id,
                
               })


                serviceData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-services');
                  }else{
                     mkdirp('public/services_image/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/services_image/' + imageFile;
                   
                        req.files.serviceimage.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Services added successfully.");
                    res.redirect('/admin/services-list'); 
                  }

                })
      
})


// **************  Edit Services  ***************//


 app.get('/edit-services/:id',isAdmin,function(req,res){
    services_id = req.params.id;
   
     OurServices.findOne({deleted:"1",_id:services_id},function(err,result){
       res.render('admin/edit_services',{
            errors      : "", 
            servicesData  : result, 
           })
         })
 })

 

 app.post('/update-services',isAdmin,function(req,res){
    var imageFile = typeof req.files.serviceimage !== "undefined" ? req.files.serviceimage.name : "";
   
    var services_name       = req.body.services_name;
    var description         = req.body.description;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.serviceimage_post;
               }

               updateData =  {
                   
                   services_name   : services_name,
                   description     : description,
                   services_image  : image,
                   updated_at      : currentDate,
                   updated_by      : req.user.id,
                
               }

        OurServices.findByIdAndUpdate(req.body.services_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-services/'+req.body.services_id);
                  }else{
                     mkdirp('public/services_image/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/services_image/' + imageFile;
                   
                        req.files.serviceimage.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Services  update successfully.");
                    res.redirect('/admin/services-list'); 
                  }

                })
      
})

 //**************** delete blogs *************//

  app.get('/delete-services/:id',isAdmin,function(req,res){
     services_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       OurClient.findByIdAndUpdate(services_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/services-list'); 
                  }else{
                     req.flash('success', "Services deleted successfully.");
                    res.redirect('/admin/services-list'); 
                  }
                });
    
})


  // *****************  Start Our Sub Services  section **********************//


//****************  Sub Services  list    ************//

 app.get('/sub-services-list',isAdmin,function(req,res){
        
        SubServices.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .populate('services_id','services_name')
            .exec(function(error, result) {
             res.render('admin/sub_services_list',{
                    errors      : "", 
                    servicesData : result, 
                 })
    })

})

//**************** Add Services  ************//

 app.get('/add-sub-services',isAdmin,function(req,res){
   OurServices.find({deleted:'1','status':'active'},function(err,services){
    Product.find({deleted:'1','status':'active'},function(err,result){
        res.render('admin/add_sub_services',{
           errors       : "", 
           productData  : result,
           servicesData : services,
         
            })
           })
        })
   }) 
 

/// *******************  submit Services  ***********************  //

app.post('/submit-sub-services',isAdmin,function(req,res){

    var imageFile = typeof req.files.sub_services_image !== "undefined" ? req.files.sub_services_image.name : "";
    var services_id       = req.body.services_id;
    var sub_services_name  = req.body.sub_services_name;
    var description        = req.body.description;
    
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

                Data = new SubServices({
                 
                   services_id      : services_id,
                   sub_services_name:sub_services_name,
                   description      : description,
                   subservices_image: imageFile,
                   created_at       : currentDate,
                   created_by       : req.user.id,
                
               })


                Data.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-sub-services');
                  }else{
                     mkdirp('public/sub_services_image/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/sub_services_image/' + imageFile;
                   
                        req.files.sub_services_image.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Sub Services added successfully.");
                    res.redirect('/admin/sub-services-list'); 
                  }

                })
      
})


// **************  Edit Services  ***************//


 app.get('/edit-sub-services/:id',isAdmin,function(req,res){
    sub_services_id = req.params.id;
     OurServices.find({deleted:'1','status':'active'},function(err,services){
     SubServices.findOne({deleted:"1",_id:sub_services_id},function(err,result){
       res.render('admin/edit_sub_services',{
            errors          : "", 
            servicesData    : services, 
            SubservicesData : result, 
           })
         })
      })
 })

 

 app.post('/update-sub-services',isAdmin,function(req,res){
    var imageFile = typeof req.files.sub_services_image !== "undefined" ? req.files.sub_services_image.name : "";
    var services_id       = req.body.services_id;
    var sub_services_name       = req.body.sub_services_name;
    var description         = req.body.description;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.sub_services_image_post;
               }

               updateData =  {
                   
                   services_id      : services_id,
                   sub_services_name:sub_services_name,
                   description      : description,
                   subservices_image: image,
                   updated_at       : currentDate,
                   updated_by       : req.user.id,
                
               }

        SubServices.findByIdAndUpdate(req.body.sub_services_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-sub-services/'+req.body.sub_services_id);
                  }else{
                     mkdirp('public/sub_services_image/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/sub_services_image/' + imageFile;
                   
                        req.files.sub_services_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Sub Services update successfully.");
                    res.redirect('/admin/sub-services-list'); 
                  }

                })
      
})

 //**************** delete blogs *************//

  app.get('/delete-sub-services/:id',isAdmin,function(req,res){
     sub_services_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       SubServices.findByIdAndUpdate(sub_services_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/sub-services-list'); 
                  }else{
                     req.flash('success', "Sub Services deleted successfully.");
                     res.redirect('/admin/sub-services-list'); 
                  }
                });
    
})


   // *****************  Start Services Features   section **********************//


   // ************  Get state data  *************//
 app.post('/getsubservices',isAdmin,function(req,res){
  SubServices.find({services_id:req.body.services_id},function(err,data){
      res.send(data);
  })
 })


//****************   Services features   list    ************//

 app.get('/services-features-list',isAdmin,function(req,res){
        
        ServicesFeatures.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .populate('services_id','services_name')
            .populate('sub_services_id','sub_services_name')
            .exec(function(error, result) {
              console.log(result);
             res.render('admin/services_features_list',{
                    errors       : "", 
                    featuresData : result, 
                 })
    })

})

//**************** Add Services  ************//

 app.get('/add-services-features',isAdmin,function(req,res){
   OurServices.find({deleted:'1','status':'active'},function(err,services){
       res.render('admin/add_services_features',{
           errors       : "", 
           servicesData : services,
           })
        })
   }) 
 

/// *******************  submit Services  ***********************  //

app.post('/submit-services-features',isAdmin,function(req,res){

    var imageFile = typeof req.files.features_image !== "undefined" ? req.files.features_image.name : "";
    var services_id        = req.body.services_id;
    var sub_services_id    = req.body.sub_services_id;
    var features_name      = req.body.features_name;
    var description        = req.body.description;
    
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

                Data = new ServicesFeatures({
                 
                   services_id      : services_id,
                   sub_services_id  : sub_services_id,
                   features_name    : features_name,
                   description      : description,
                   features_image   : imageFile,
                   created_at       : currentDate,
                   created_by       : req.user.id,
                
               })


                Data.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-services-features');
                  }else{
                     mkdirp('public/services_features_image/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/services_features_image/' + imageFile;
                   
                        req.files.features_image.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Services features added successfully.");
                    res.redirect('/admin/services-features-list'); 
                  }

                })
      
})


// **************  Edit Services  ***************//


 app.get('/edit-services-features/:id',isAdmin,function(req,res){
    services_features_id = req.params.id;
     OurServices.find({deleted:'1','status':'active'},function(err,services){
       SubServices.find({deleted:'1','status':'active'},function(err,subservices){
         ServicesFeatures.findOne({deleted:"1",_id:services_features_id},function(err,result){
       res.render('admin/edit_services_features',{
            errors          : "", 
            servicesData    : services, 
            subservicesData : subservices, 
            servicesfeaturesData : result, 
             })
           })
         })
      })
 })

 

 app.post('/update-services-features',isAdmin,function(req,res){
    var imageFile = typeof req.files.features_image !== "undefined" ? req.files.features_image.name : "";
    var services_id        = req.body.services_id;
    var sub_services_id    = req.body.sub_services_id;
    var features_name      = req.body.features_name;
    var description        = req.body.description;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.features_image_post;
               }

               updateData =  {
                   
                   services_id      : services_id,
                   sub_services_id  : sub_services_id,
                   features_name    : features_name,
                   description      : description,
                   features_image   : image,
                   updated_at       : currentDate,
                   updated_by       : req.user.id,
                
               }

        ServicesFeatures.findByIdAndUpdate(req.body.services_features_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-services-features/'+req.body.services_features_id);
                  }else{
                     mkdirp('public/services_features_image/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/services_features_image/' + imageFile;
                   
                        req.files.features_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Sub Services update successfully.");
                    res.redirect('/admin/services-features-list'); 
                  }

                })
      
})

 //**************** delete blogs *************//

  app.get('/delete-services-features/:id',isAdmin,function(req,res){
     services_features_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       ServicesFeatures.findByIdAndUpdate(services_features_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/services-features-list'); 
                  }else{
                     req.flash('success', "Services Features deleted successfully.");
                     res.redirect('/admin/services-features-list'); 
                  }
                });
    
})


  //****************   Industries    list    ************//

 app.get('/industries-list',isAdmin,function(req,res){
        
        Industries.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {
             res.render('admin/industries_list',{
                    errors       : "", 
                    industData : result, 
                 })
    })

})

//**************** Add Services  ************//

 app.get('/add-industries',isAdmin,function(req,res){
  
       res.render('admin/add_industries',{
           errors       : "", 
           })
    }) 
 

/// *******************  submit Services  ***********************  //

app.post('/submit-industries',isAdmin,function(req,res){

    var imageFile = typeof req.files.industries_image !== "undefined" ? req.files.industries_image.name : "";
    
    var name               = req.body.name;
    var description        = req.body.description;
    
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = "";
               }

                Data = new Industries({
                 
                   name             : name,
                   description      : description,
                   image            : imageFile,
                   created_at       : currentDate,
                   created_by       : req.user.id,
                
               })


                Data.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-industries');
                  }else{
                     mkdirp('public/industries_image/', function (err) {
                       // return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/industries_image/' + imageFile;
                   
                        req.files.industries_image.mv(imgpath, function (err) {
                        
                        });
                    }
                    req.flash('success', "Industries added successfully.");
                    res.redirect('/admin/industries-list'); 
                  }

                })
      
})


// **************  Edit Industries  ***************//


 app.get('/edit-industries/:id',isAdmin,function(req,res){
    industries_id = req.params.id;
    
         Industries.findOne({deleted:"1",_id:industries_id},function(err,result){
            res.render('admin/edit_industries',{
            errors          : "", 
            industData      : result,
           })
      })
 })

 
 app.post('/update-industries',isAdmin,function(req,res){
    var imageFile = typeof req.files.industries_image !== "undefined" ? req.files.industries_image.name : "";
  
    var name               = req.body.name;
    var description        = req.body.description;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

      if(imageFile!=""){
                image  = imageFile;
               }else{
                image  = req.body.industries_image_post;
               }

               updateData =  {
                   
                  
                   name             : name,
                   description      : description,
                   image            : image,
                   updated_at       : currentDate,
                   updated_by       : req.user.id,
                
               }

        Industries.findByIdAndUpdate(req.body.industries_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-industries/'+req.body.industries_id);
                  }else{
                     mkdirp('public/industries_image/', function (err) {
                        return console.log(err);
                    });

                   if (imageFile != "") {
                      
                        var imgpath = 'public/industries_image/' + imageFile;
                   
                        req.files.industries_image.mv(imgpath, function (err) {
                         console.log(err);

                        });
                    }
                    req.flash('success', "Industries update successfully.");
                    res.redirect('/admin/industries-list'); 
                  }

                })
      
})

 //**************** delete Industries *************//

  app.get('/delete-industries/:id',isAdmin,function(req,res){
     industries_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       Industries.findByIdAndUpdate(industries_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/industries-list'); 
                  }else{
                     req.flash('success', "Industries deleted successfully.");
                     res.redirect('/admin/industries-list'); 
                  }
                });
    
})


  //****************Blog category  list  ************//

 app.get('/blog-category-list',isAdmin,function(req,res){
        
        BlogCategoey.find({status:'active',deleted:"1"})
            .populate('created_by','name')
            .exec(function(error, result) {
             res.render('admin/blog_category_list',{
                    errors       : "", 
                    catData : result, 
                 })
    })

})

//**************** Add blog category  ************//

 app.get('/add-blog-category',isAdmin,function(req,res){
  
       res.render('admin/add_blog_category',{
           errors       : "", 
           })
    }) 
 

/// *******************  submit Blog category   ***********************  //

app.post('/submit-blog-category',isAdmin,function(req,res){

    var name               = req.body.name;
    var description        = req.body.description;
    
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
   
    var currentDate = d;
      
                postData = new BlogCategoey({
                 
                   name             : name,
                   description      : description,
                   created_at       : currentDate,
                   created_by       : req.user.id,
                
               })


                postData.save(function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/add-blog-category');
                  }else{
                     
                    req.flash('success', "Blog Category  added successfully.");
                    res.redirect('/admin/blog-category-list'); 
                  }

                })
      
})


// **************  Edit Blog Category  ***************//


 app.get('/edit-blog-category/:id',isAdmin,function(req,res){
    cate_id = req.params.id;
    
         BlogCategoey.findOne({deleted:"1",_id:cate_id},function(err,result){
            res.render('admin/edit_blog_category',{
            errors          : "", 
            catData      : result,
           })
      })
 })


 app.post('/update-blog-category',isAdmin,function(req,res){
   
    var name               = req.body.name;
    var description        = req.body.description;
    
    var dt = dateTime.create();
    var d = dt.format('Y-m-d H:M:S');
    var currentDate = d;
  

     
               updateData =  {
                   name             : name,
                   description      : description,
                   updated_at       : currentDate,
                   updated_by       : req.user.id,
                
               }

        BlogCategoey.findByIdAndUpdate(req.body.cat_id,{$set:updateData},function(err,result){

                  if(err){
                    req.flash('error', err);
                    res.redirect('/admin/edit-blog-category/'+req.body.cat_id);
                  }else{
                   
                    req.flash('success', "Blog category update successfully.");
                    res.redirect('/admin/blog-category-list'); 
                  }

                })
      
})

 //**************** delete Blog category  *************//

  app.get('/delete-blog-category/:id',isAdmin,function(req,res){
     cat_id = req.params.id;
      var dt = dateTime.create();
      var d = dt.format('Y-m-d H:M:S');
      var currentDate = d;
   
     updateData = {
                   deleted : "0",
                   deleted_at   : currentDate,
                   deleted_by   : req.user.id,
                }

       BlogCategoey.findByIdAndUpdate(cat_id,{$set:updateData},function(err,result){
                  if(err){
                     req.flash('error', "Could not delete try after sometime ");
                     res.redirect('/admin/blog-category-list'); 
                  }else{
                     req.flash('success', "Blog category deleted successfully.");
                     res.redirect('/admin/blog-category-list'); 
                  }
                });
    
})


 module.exports = app;