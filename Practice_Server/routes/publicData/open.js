const express = require('express');
const router = express.Router();
const pool = require('../../config/dbPool');
const async = require('async');
const moment = require('moment');

const fs = require('fs');
var request = require('request');

router.get('/', function(req, res) {

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

            var url = 'http://dataopen.kospo.co.kr/openApi/Conce/AirPollutant';
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'; /* Service Key*/
            queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'); /* 공공데이터포털에서 받은 인증키 */
            queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지번호 */
            queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /* 한 페이지 결과 수 */
            queryParams += '&' + encodeURIComponent('strSdate') + '=' + encodeURIComponent('201811'); /* 조회 시작월 */
            queryParams += '&' + encodeURIComponent('strEdate') + '=' + encodeURIComponent('201811'); /* 조회 종료월(최대 1년) */
            queryParams += '&' + encodeURIComponent('strOrgCd') + '=' + encodeURIComponent('5900'); /* 발전소 코드 */        //5100 하동
            queryParams += '&' + encodeURIComponent('strHoki') + '=' + encodeURIComponent('1'); /* 호기 코드 */

            request({
                url: url + queryParams,
                method: 'POST'
            }, function(error, response, body) {
                console.log('Status', response.statusCode);
                console.log('Headers', JSON.stringify(response.headers));
                console.log('Reponse received', body);

                fs.writeFile(__dirname + "/data.xml", body, 'utf8', function(err) {
                    if (err)
                        console.log("error : " + err);
                    callback(null, connection);
                });
            });
        } ,

        function(connection, callback) {

            res.status(201).send({
                status: "success",
                message: "successful get"
            });
            connection.release();
            callback(null, "successful get");
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