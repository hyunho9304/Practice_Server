var express = require('express');
var router = express.Router();

//	접근 처리
const open = require( './open' ) ;
router.use( '/open' , open ) ;

module.exports = router;


