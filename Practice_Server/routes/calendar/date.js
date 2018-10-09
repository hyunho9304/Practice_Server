var express = require('express');
var router = express.Router();
const pool = require('../../config/dbPool');
const async = require('async');
const moment = require( 'moment' ) ;

var nodemailer = require('nodemailer');

module.exports.transport = nodemailer.createTransport({  
    service: 'gmail',
    auth: {
        user: 'hyunho9304@gmail.com',
        pass: 'tkfkd6749'
    }
});

module.exports.option = {  
    from: 'hyunho9304@gmail.com',
    to: 'hyunho9304@gmail.com',
    subject: '테스트',
    html:'<!DOCTYPE html><html><head><meta charset="utf-8"><title></title></head><body><div style="margin : 20px auto; border: 1px solid #cccccc; width:500px;">'+
    '<div class="title" style="font-size: 30px; text-align: center; margin-top:15px">'+
    '사업자 등록 인증 메일입니다.</div></div></body></html>'
};

router.get( '/' , function( req, res ) {

	let maxDate = [ 31 , 28 , 31 , 30 , 31 , 30 , 31 , 31 , 30 , 31 , 30 , 31 ] ;
	let day = [ "Monday" , "Tuesday" , "Wednesday" , "Thursday" , "Friday" , "Saturday" , "Sunday" ] ;
	let dayHangle = [ "월" , "화" , "수" , "목" , "금" , "토" , "일" ] ;

	let currentYear = Number(moment().format( "YYYY" )) ;
	let currentMonth = Number(moment().format( "MM")) ;
	let currentDateMinus1 = Number( moment().format( "DD" )) - 1 ;
	let currentDay = moment().format( "dddd" ) ;

	//윤년계산
	if( currentYear % 4 == 0 && currentYear % 100 != 0 || currentYear % 400 == 0 )
		maxDate[1] = 29 ;

	let task = [

		function( callback ) {

			pool.getConnection(function(err , connection ) {
				if(err) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					});
					callback( "getConnection err" );
				} else {
					callback( null , connection ) ;
				}
			});
		} ,

		function( connection , callback ) {

			let twoWeeksYear = [] ;
			
			let twoWeeksMonth = [] ;
			var maxIndex = maxDate[currentMonth - 1] ;

			let twoWeeksDate = [] ;
			
			let twoWeeksDay = [] ;
			var dayIndex = -1 ;
			for( var i = 0 ; i < 7 ; i++ ) {
				if( day[i] == currentDay )
					dayIndex = i ;
			}

			//	계산
			for( var i = 0 ; i < 14 ; i++ ) {

				var tempDate = ( currentDateMinus1 % maxIndex ) + 1 ;
				if( currentDateMinus1 == maxIndex ){
					currentMonth++ ;
					if( currentMonth == 13 ){
						currentMonth = 1 ;
						currentYear++ ;
					}
					maxIndex = maxDate[ currentMonth - 1 ] ;
					currentDateMinus1 = 0 ;
				}

				twoWeeksDay.push( dayHangle[ dayIndex % 7]) ;
				twoWeeksDate.push( String(tempDate)) ;
				twoWeeksMonth.push( String(currentMonth )) ;
				twoWeeksYear.push( String(currentYear )) ;

				dayIndex++ ;
				currentDateMinus1++ ;
			}

			connection.release() ;
			callback( null , twoWeeksDay , twoWeeksDate , twoWeeksMonth , twoWeeksYear ) ;
		} ,

		function( listDay , listDate , listMonth , listYear , callback ) {

			res.status(200).send({
				status : "success" ,
				data : {
					twoWeeksYear : listYear ,
					twoWeeksMonth : listMonth ,
					twoWeeksDate : listDate ,
					twoWeeksDay : listDay
				} ,
				message : "successful get currentDay"
			}) ;

      		// let option = nodemailer.option ;
      		// let transport = nodemailer.transport ;

      		// transport.sendMail( option , function( err , response ) {
        // 		if( err ) {
        //   			transport.close() ;
        //   			callback( null , "fail" ) ;
        // 		} else {
        //   			transport.close() ;
        //   			callback( null , "successMail" ) ;
        // 		}
      		// }) ;

      		var nodemailer = require('nodemailer');
			var transporter = nodemailer.createTransport( {
    			service:'gmail',
    			auth: {
        			user : 'hyunho9304@gmail.com',
        			pass : 'tkfkd6749'
    			}
			});

			var mailOption = {
    			from : '박현호 <hyunho9304@gmail.com>',
    			to : '',
    			subject : 'nodemailer test',
    			html:'<h1>HTML 보내기 테스트</h1><p><img src="https://hyunho9304.s3.ap-northeast-2.amazonaws.com/1538040896397.jpg"/></p>'
			};

			let toMail = "gusgh1492@naver.com"

			mailOption.to = toMail ;

			transporter.sendMail(mailOption, function(err, info) {
    			if ( err ) {
        			console.error('Send Mail error : ', err);
    			}
    			else {
        			console.log('Message sent : ', info);
    			}
			});

			callback( null , "successful get currentDay" ) ;
		}
	] ;

	async.waterfall(task, function(err, result) {
		
		let logtime = moment().format('MMMM Do YYYY, h:mm:ss a');

		if (err)
			console.log(' [ ' + logtime + ' ] ' + err);
		else
			console.log(' [ ' + logtime + ' ] ' + result);
	}); //async.waterfall
}) ;

module.exports = router;