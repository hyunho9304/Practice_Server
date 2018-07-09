var express = require('express');
var router = express.Router();

//	하나의 변수에 여러개의 값 업로드 처리
const duplicationVarUpload = require( './duplicationVarUpload/index' ) ;
router.use( '/duplicationVarUpload' , duplicationVarUpload ) ;

module.exports = router;


