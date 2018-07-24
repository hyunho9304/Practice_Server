var express = require('express');
var router = express.Router();
const pool = require('../../config/dbPool');
const async = require('async');
const moment = require( 'moment' ) ;

router.get( '/' , function( req, res ) {

	//	윤년 29 수정해야함
	let maxDate = [ 31 , 28 , 31 , 30 , 31 , 30 , 31 , 31 , 30 , 31 , 30 , 31 ] ;
	

	let day = [ "Monday" , "Tuesday" , "Wednesday" , "Thursday" , "Friday" , "Saturday" , "Sunday" ] ;

	let currentYear = Number(moment().format( "YYYY" )) ;
	let currentMonth = Number(moment().format( "MM")) ;
	let currentDateMinus1 = Number( moment().format( "DD" )) - 1 ;
	let currentDay = moment().format( "dddd" ) ;

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

				twoWeeksDay.push( day[ dayIndex % 7]) ;


				//	28	24
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

				twoWeeksDate.push( tempDate) ;
				twoWeeksMonth.push( currentMonth ) ;
				twoWeeksYear.push( currentYear ) ;

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
					twoWeeksDay : listDay ,
					twoWeeksDate : listDate ,
					twoWeeksMonth : listMonth ,
					twoWeeksYear : listYear
				} ,
				message : "successful get currentDay"
			}) ;
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