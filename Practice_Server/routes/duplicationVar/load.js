/*
	URL : /duplicationVar/load
	Description : 하나의 변수에 여러개의 값 로드 처리
	Content-type : x-www-form-urlencoded
	method : GET - query
	query = /?practice1_index={ table row값 index }
*/

var express = require('express');
var router = express.Router();
const pool = require('../../config/dbPool');
const async = require('async');
const moment = require( 'moment' ) ;


router.get('/', function(req, res) {

	let practice1_index = req.query.practice1_index ;

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

			let selectPractice1Query = 'SELECT * FROM Practice1 WHERE practice1_index = ?' ;

			connection.query( selectPractice1Query , [ practice1_index ] , function( err , result ) {
				if(err) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "selectPractice1Query err") ;
				} else {
					
					tmp = [] ;

					tmp.push( result[0].first ) ;
					tmp.push( result[0].second ) ;
					tmp.push( result[0].third ) ;
					tmp.push( result[0].fourth ) ;
					tmp.push( result[0].fifth ) ;

					list = [] ;
					for( let i = 0 ; i < tmp.length ; i++ ) {

						if( tmp[i] == null ) {
							break ;
						}

						list.push( tmp[i] ) ;
					}
					
					connection.release() ;
					callback( null , list ) ;
				}
			}) ;
		} ,

		function( list , callback ) {

			res.status(200).send({
				status : "success" ,
				data : list ,
				message : "successful get list"
			}) ;
			callback( null , "successful get list") ;
		}
	] ;

	async.waterfall(task, function(err, result) {
		
		let logtime = moment().format('MMMM Do YYYY, h:mm:ss a');

		if (err)
			console.log(' [ ' + logtime + ' ] ' + err);
		else
			console.log(' [ ' + logtime + ' ] ' + result);
	}); //async.waterfall
});

module.exports = router;