/*
	URL : /duplicationVar/register
	Description : 하나의 변수에 여러개의 값 업로드 처리
	Content-type : x-www-form-urlencoded
	method : POST - Body
	Body = {
		noun_list : String
	}
*/

var express = require('express');
var router = express.Router();
const pool = require('../../config/dbPool');
const async = require('async');
const moment = require( 'moment' ) ;


router.post('/', function(req, res) {

	let noun_list = req.body.noun_list ;

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

			let insertPractice1Query = 'INSERT INTO Practice1 VALUES( ? , ? , ? , ? , ? , ? )' ;

			let queryArr = [] ;
			queryArr.push( null ) ;

			for( let i = 0 ; i < noun_list.length ; i++ ) {
				queryArr.push( noun_list[i] ) ;
			}

			for( let i = noun_list.length ; i < 6 ; i++ ) {
				queryArr.push( null ) ;
			}

			connection.query( insertPractice1Query , queryArr , function( err , result ) {
				if(err) {
					res.status(500).send({
						status : "fail" ,
						message : "internal server err"
					}) ;
					connection.release() ;
					callback( "insertPractice1Query err") ;
				} else {
					res.status(201).send({
						status : "success" , 
						message : "successful Practice1 upload"
					}) ;
					connection.release() ;
					callback( null , "successful Practice1 upload" ) ;
				}
			}) ;
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