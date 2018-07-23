var express = require('express');
var router = express.Router();

const date = require( './date' ) ;
router.use( '/date' , date ) ;

module.exports = router;


