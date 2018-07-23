var express = require('express');
var router = express.Router();

//	하나의 변수에 여러개의 값 업로드 처리
const duplicationVar = require( './duplicationVar/index' ) ;
router.use( '/duplicationVar' , duplicationVar ) ;

const calendar = require( './calendar/index' ) ;
router.use( '/calendar' , calendar ) ;

module.exports = router;


