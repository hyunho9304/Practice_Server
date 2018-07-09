var express = require('express');
var router = express.Router();

//	duplicationVar/register
const register = require( './register' ) ;
router.use( '/register' , register ) ;

//	duplicationVar/load
const load = require( './load' ) ;
router.use( '/load' , load ) ;


module.exports = router;


