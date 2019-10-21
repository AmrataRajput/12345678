// const session = require('express-session');
var {Registration} = require('../models/contact');

// var func = {
//               sayhi: function(user_id) { 
//               	var user_data="33";
//               	// Registration.findOne({'_id': user_id},function(err,result){ return(result);})
//                  return user_data;
//                }, 
// 				foo: function(date) {
// 				//do somethings
// 				}    
// };

// module.exports = func;

async function addTwoNumbers(num1)
{

var result= await Registration.findOne({'_id': num1});
  return result	
};
exports.add = addTwoNumbers; 