var express = require('express');
var path = require('path');
var http = require('http');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');

// var passport = require('passport');

var fs = require('fs-extra');   
var path = require('path');

//Connect to db
mongoose.connect(config.database);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Init app
var app = express();
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
// Set global errors variable
app.locals.errors = null;


// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('view engine', 'hbs');
// Set public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());



var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');
 
app.use(cookieParser('keyboard cat'))
app.use(session({ 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    //cookie: { maxAge: 60000 }
}))
app.use(flash())

// Passport Config
// require('./config/passport')(passport);
//  Passport Middleware
// app.use(passport.initialize());
// app.use(passport.session());


app.get('*', function(req,res,next) {
   res.locals.cart  = req.session.cart;
   res.locals.user  = req.user || null;
   next();
});


// get routes 
var front = require('./routes/front.js');
// var admin = require('./routes/admin.js');
 var admin1 = require('./routes/signup.js');
const hbs = require('hbs');

hbs.registerPartials(__dirname + '/views/admin/admin-login/partials');

hbs.registerHelper('escape', function(variable) {
  
  return variable.toString().replace(/(['"])/g, '');

});
hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

hbs.registerHelper("increment_variable", function(value){
   
    return parseInt(value) + 1;
});

hbs.registerHelper('select', function( value, options ){

     return options.fn().split('\n').map(function (v) {
      
      var t = 'value="' + value + '"';
     
      return RegExp(t).test(v) ? v.replace(t, t + ' selected="selected"') : v;
    
    }).join('\n');

});

hbs.registerHelper('select1', function(value, id ){


	var array1 = value;

	var opt_val2 = '';
	
	//var sel_opts = '';

	array1.forEach(function(element) {

		if(element._id == id){

			sel_opts = 'selected';

			console.log(sel_opts);
	
		} else {

			console.log('wow');
			
			console.log(element._id );
			
			console.log(id);
			sel_opts = '';

		}
	  
	   opt_val2 += '<option value="'+element._id+'" '+sel_opts+'>'+element.country_name+'</option>';
	 
	  //var opt_val = opt_val+opt_val2;
	  

	});

	//console.log(opt_val2);
	// var all_option_value = '';

	// var sel_opts = '';
	
	// for (var i=0; i<value.length; i++) {

		
	// 	var all_option_value = all_option_value+'<option value="'+value[i]._id+'" '+sel_opts+'>'+value[i].country_name+'</option>';
           
	//      console.log(value[i]._id);
	//      console.log(id);
	//      console.log(sel_opts);

           
 //       }
	//console.log(all_option_value);
	//console.log(sel_opts);

	//console.log(value);
	//console.log(id);
    //  return options.fn().split('\n').map(function (v) {
      
    //   var t = 'value="' + value + '"';
     
    //   return RegExp(t).test(v) ? v.replace(t, t + ' selected="selected"') : v;
    
    // }).join('\n');

});


hbs.registerHelper("check_my_disabled", function(value){

	if(value=='Rejected' || value=='Verified'){

		return "disabled = 'disabled' ";

	}

});

hbs.registerHelper("check_image_exist", function(value,type){

	if(type==1){

		const pathw = 'assets/uploads/user_profile_images/'+value;

		try {
		  
		  if (fs.existsSync(pathw)) {
		    
		    return "/uploads/user_profile_images/"+value;
		  
		  } else {

		  	return "/images/faces-clipart/pic-1.png";

		  }

		} catch(err) {
		  
		  console.error(err)
		
		}
	} else if(type==2){

		const pathw = 'assets/uploads/team-member-profiles/'+value;

		try {
		  
		  if (fs.existsSync(pathw)) {
		    
		    return "/uploads/team-member-profiles/"+value;
		  
		  } else {

		  	return "/images/faces-clipart/pic-1.png";

		  }

		} catch(err) {
		  
		  console.error(err)
		
		}

	} else if(type==3){

		const pathw = 'assets/uploads/news-section/'+value;

		try {
		  
		  if (fs.existsSync(pathw)) {
		    
		    return "/uploads/news-section/"+value;
		  
		  } else {

		  	return "/images/faces-clipart/pic-1.png";

		  }

		} catch(err) {
		  
		  console.error(err)
		
		}

	}

	
});
// Use rout 
app.use('/', front);
app.use('/', admin1);



// app.use('/', admin1);


// Start the server
var port = 2300;
app.listen(port, function () {
    console.log('Server started on port ' + port);
});
   
