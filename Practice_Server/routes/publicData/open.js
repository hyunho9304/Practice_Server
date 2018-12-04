/*
    URL : /publicData/open
    Description : 자치구 리스트
    Content-type : x-www-form-urlencoded
    method : GET - query
*/

const express = require('express');
const router = express.Router();
const pool = require('../../config/dbPool');
const async = require('async');
const moment = require('moment');

const fs = require('fs');
var request = require('request');

router.get('/:powercode/:startdate/:enddate/:ho', function(req, res) {

    let task = [

        function(callback) {

            pool.getConnection(function(err, connection) {
                if (err) {
                    res.status(500).send({
                        status: "fail",
                        message: "internal server err"
                    });
                    callback("getConnection err");
                } else {
                    callback(null, connection);
                }
            });
        },

        function(connection, callback) {
            const powercode = req.params.powercode;
            const startdate = req.params.startdate;
            const enddate = req.params.enddate;
            const ho = req.params.ho;

            var tmpUrl1 = 'http://dataopen.kospo.co.kr/openApi/Conce/AirPollutant';
            var tmpUrl2 = 'http://dataopen.kospo.co.kr/openApi/Gene/GenInfoList';
            var tmpUrl3 = 'http://dataopen.kospo.co.kr/openApi/Conce/ardConcentration' ;

            var url = tmpUrl1;


//  tmpUrl1 => 배출농도
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'; /* Service Key*/
            queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'); /* 공공데이터포털에서 받은 인증키 */
            queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지번호 */
            queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('30'); /* 한 페이지 결과 수 */
            queryParams += '&' + encodeURIComponent('strSdate') + '=' + encodeURIComponent(startdate); /* 조회 시작월 */
            queryParams += '&' + encodeURIComponent('strEdate') + '=' + encodeURIComponent(enddate); /* 조회 종료월(최대 1년) */
            queryParams += '&' + encodeURIComponent('strOrgCd') + '=' + encodeURIComponent(powercode); /* 발전소 코드 */ //5100 하동
            queryParams += '&' + encodeURIComponent('strHoki') + '=' + encodeURIComponent(ho); /* 호기 코드 */

//  tmpUrl3 => 배출농도( 일별 )
            // var queryParams = '?' + encodeURIComponent('ServiceKey') + '=22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'; /* Service Key*/
            // queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'); /* 공공데이터포털에서 받은 인증키 */
            // queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지번호 */
            // queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100'); /* 한 페이지 결과 수 */
            // queryParams += '&' + encodeURIComponent('strSdate') + '=' + encodeURIComponent(startdate); /* 조회 시작월 */
            // queryParams += '&' + encodeURIComponent('strEdate') + '=' + encodeURIComponent(enddate); /* 조회 종료월(최대 1년) */
            // queryParams += '&' + encodeURIComponent('strOrgCd') + '=' + encodeURIComponent(powercode); /* 발전소코드 */
            // queryParams += '&' + encodeURIComponent('strSnumPos') + '=' + encodeURIComponent(ho); /* 지역코드 */


            request({
                url: url + queryParams,
                method: 'POST'
            }, function(error, response, body) {
                // console.log('Status', response.statusCode);
                // console.log('Headers', JSON.stringify(response.headers));
                // console.log('Reponse received', body);

                fs.writeFile(__dirname + "/data.xml", body, 'utf8', function(err) {
                    if (err)
                        console.log("error : " + err);
                    callback(null, connection);
                });
            });
        },

        function(connection, callback) {

            var xml2js = require('xml2js');
            var parser = new xml2js.Parser();

            fs.readFile(__dirname + "/data.xml", function(err, data) {
                console.log("here " + data);

                parser.parseString(data, function(err, result) {

                    var list = [];
                    var sumAvgair02 = 0;

                    if( result.response.header ) {

                        for (let i = 0; i < result.response.header.length; i++) {

                        sumAvgair02 += Number(result.response.header[i].avgair02[0]);

                        let data = {
                            orgNm: result.response.header[i].orgNm[0],
                            date: result.response.header[i].ym[0],
                            avgair01: result.response.header[i].avgair01[0],
                            avgair02: result.response.header[i].avgair02[0],
                            avgair03: result.response.header[i].avgair03[0]
                        }
                        list.push(data);
                        }

                    }
                    connection.release();
                    callback(null, list, sumAvgair02);
                });
            });
        },

        function(list, sumAvgair02, callback) {

            console.log("hehe " + list);
            fs.writeFile(__dirname + "/yearData.js", list, 'utf8', function(err) {
                if (err)
                    console.log("error : " + err);
                else {

                    res.status(200).send({
                        status: "success",
                        data: {
                            sumAvgair02: sumAvgair02,
                            datalist: list
                        },
                        message: "successful get publicdata"
                    });
                    callback(null, "successful get publicdata");
                }
            });
        }
    ];

    async.waterfall(task, function(err, result) {

        let logtime = moment().format('MMMM Do YYYY, h:mm:ss a');

        if (err)
            console.log(' [ ' + logtime + ' ] ' + err);
        else
            console.log(' [ ' + logtime + ' ] ' + result);
    }); //async.waterfall
});

module.exports = router;

