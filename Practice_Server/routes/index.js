var express = require('express');
var router = express.Router();

//	하나의 변수에 여러개의 값 업로드 처리
const duplicationVar = require( './duplicationVar/index' ) ;
router.use( '/duplicationVar' , duplicationVar ) ;

//	달력 처리
const calendar = require( './calendar/index' ) ;
router.use( '/calendar' , calendar ) ;

//	공공데이터 접근 처리
const publicData = require( './publicData/index' ) ;
router.use( '/publicData' , publicData ) ;

module.exports = router;


