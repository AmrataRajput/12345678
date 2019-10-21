var mongoose = require('mongoose');

const validator = require('validator');

/**********RegistrationSchema**********/
var RegistrationSchema = mongoose.Schema({
   
    name:{
        type:String
    },
    first_name:{
        type:String
    },

   last_name:{
        type:String
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        validate:{

            validator:validator.isEmail,
            message:'{VALUE} Entered Invalid Email'
        }

    },
    email_varify_status:{

        type:String

    },
    mobile_no:{

        type:String,
        default:null
    },
    address:{

        type:String,
        default:null
    },
    user_address:{

        type:String,
        default:null
    },
    country:{

        type:String,
        default:null
    },
    state:{

        type:String,
        default:null
    },
    city:{

        type:String,
        default:null
    },
    password:{
        type:String,
        
    },

    created_at: { 
                    type: String
                },
    deleted_at: { 
                    type: String,
                    default: null 
                },
    deleted_by: {

            type:String,
            default: null 
    },

    updated_at: {

            type: String,
            default: null
    },
    status:{

        type:String,
        enum: ['active', 'inactive'],
        default:'active'

    },
    deleted:{

         type:String,
         enum: ['0', '1'],
         default:'0'
    },
    profile_image:{

        type:String,

    },
     dataURL:{

        type:String,

    },
     qr_secret:{

        type:String,

    },
     qr_status:{

        type:String,

    },
    // link_status:{
    //     type:String,

    // }
    // tokens:[{
    //         access:{
    //             type: String,
    //             required: true
    //         },
    //         token:{

    //             type: String,
    //             required: true
    //         }

    //     }]
});

var Registration =  mongoose.model('User_registration', RegistrationSchema);


/**********UserwalletSchema**********/
var Userwalletschema = mongoose.Schema({
   
    user_id:{
        type:String
    },
    wallet_address:{
        type:String
    },
    passphrase:{
        type:String
    },
    created_at: { 
                    type: String
                },
    deleted_at: { 
                    type: String,
                    default: null 
                },
    deleted_by: {

            type:String,
            default: null 
    },

    updated_at: {

            type: String,
            default: null
    },
    status:{

        type:String,
        enum: ['active', 'inactive'],
        default:'active'

    },
    deleted:{

         type:String,
         enum: ['0', '1'],
         default:'0'
    },
});

var Userwallet =  mongoose.model('User_wallet', Userwalletschema);

/**********ImportwalletSchema**********/
var ImportwalletSchema = mongoose.Schema({
   
    user_id:{
        type:String
    },
    wallet_id:{
        type:String
    },
   login_status:{
        type:String
    },
    created_at: { 
                    type: String
                },
    deleted_at: { 
                    type: String,
                    default: null 
                },
    deleted_by: {

            type:String,
            default: null 
    },

    updated_at: {

            type: String,
            default: null
    },
    status:{

        type:String,
        enum: ['active', 'inactive'],
        default:'active'

    },
    deleted:{

         type:String,
         enum: ['0', '1'],
         default:'0'
    },
});

var Importwallet =  mongoose.model('import_wallet', ImportwalletSchema);

/**********ImportwalletSchema**********/
var TokendetailsSchema = mongoose.Schema({

    auto: {
        type: Number,
        required: true,
        unique: true,
        integer: true
    },
    user_id:{
        type:String
    },
    wallet_id:{
        type:String
    },
    sender_wallet_address:{
        type:String
    },
    receiver_wallet_address:{
        type:String
    },
    hash:{
        type:String
    },
    amount:{
        type:String
    },
    payment_status:{
        type:String
    },
    token_type:{
        type:String
    },
  	block_id:{
        type:String,
         default: null 
    },
    transaction_type:{
        type:String
    },
    created_at: { 
                    type: String
                },
    deleted_at: { 
                    type: String,
                    default: null 
                },
    deleted_by: {

            type:String,
            default: null 
    },

    updated_at: {

            type: String,
            default: null
    },
    status:{

        type:String,
        enum: ['active', 'inactive'],
        default:'active'

    },
    deleted:{

         type:String,
         enum: ['0', '1'],
         default:'0'
    },
});

var Tokendetails =  mongoose.model('token_details', TokendetailsSchema);


module.exports = {
    Registration : Registration,
    Userwallet   : Userwallet,
    Importwallet : Importwallet,
    Tokendetails : Tokendetails
 };



