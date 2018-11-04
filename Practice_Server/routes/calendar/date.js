var express = require('express');
var router = express.Router();
const pool = require('../../config/dbPool');
const async = require('async');
const moment = require('moment');
const fs = require('fs');
var request = require('request');
var nodemailer = require('nodemailer');

// module.exports.transport = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'hyunho9304@gmail.com',
//         pass: 'tkfkd6749'
//     }
// });

// module.exports.option = {
//     from: 'hyunho9304@gmail.com',
//     to: 'hyunho9304@gmail.com',
//     subject: '테스트',
//     html: '<!DOCTYPE html><html><head><meta charset="utf-8"><title></title></head><body><div style="margin : 20px auto; border: 1px solid #cccccc; width:500px;">' +
//         '<div class="title" style="font-size: 30px; text-align: center; margin-top:15px">' +
//         '사업자 등록 인증 메일입니다.</div></div></body></html>'
// };

router.get('/', function(req, res) {

    let maxDate = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let day = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let dayHangle = ["월", "화", "수", "목", "금", "토", "일"];

    let currentYear = Number(moment().format("YYYY"));
    let currentMonth = Number(moment().format("MM"));
    let currentDateMinus1 = Number(moment().format("DD")) - 1;
    let currentDay = moment().format("dddd");

    //윤년계산
    if (currentYear % 4 == 0 && currentYear % 100 != 0 || currentYear % 400 == 0)
        maxDate[1] = 29;

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

            var url = 'http://api.visitkorea.or.kr/openapi/service/rest/KorService/searchStay';
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'; /* Service Key*/
            queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('22op4iVErXKCKm1jqNWSpzQ3Mo%2FoQYIIOquxrGwyyNSnC86o21TLuPaQGQ%2BH%2BLRT0hsvTo%2BG7UaPsBrMhmRZOg%3D%3D'); /* 공공데이터포털에서 발급받은 인증키 */
            queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /* 한 페이지 결과 수 */
            queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 현재 페이지 번호 */
            queryParams += '&' + encodeURIComponent('MobileOS') + '=' + encodeURIComponent('ETC'); /* IOS(아이폰),AND(안드로이드),WIN(원도우폰),ETC */
            queryParams += '&' + encodeURIComponent('MobileApp') + '=' + encodeURIComponent('AppTest'); /* 서비스명=어플명 */
            queryParams += '&' + encodeURIComponent('arrange') + '=' + encodeURIComponent('A'); /*(A=제목순,B=조회순,C=수정순,D=생성일순) 대표이미지가 반드시 있는 정렬 (O=제목순, P=조회순, Q=수정일순, R=생성일순) */
            queryParams += '&' + encodeURIComponent('listYN') + '=' + encodeURIComponent('Y'); /* 목록구분(Y=목록,N=개수) */
            queryParams += '&' + encodeURIComponent('areaCode') + '=' + encodeURIComponent(''); /* 지역코드 */
            queryParams += '&' + encodeURIComponent('sigunguCode') + '=' + encodeURIComponent(''); /* 시군구코드(areaCode 필수) */
            queryParams += '&' + encodeURIComponent('hanOk') + '=' + encodeURIComponent(''); /* 한옥 여부 */
            queryParams += '&' + encodeURIComponent('benikia') + '=' + encodeURIComponent(''); /* 베니키아 여부 */
            queryParams += '&' + encodeURIComponent('goodStay') + '=' + encodeURIComponent(''); /* 굿스테이 여부 */

            request({
                url: url + queryParams,
                method: 'GET'
            }, function(error, response, body) {
                console.log('Status', response.statusCode);
                console.log();
                console.log('Headers', JSON.stringify(response.headers));
                console.log();
                console.log('Reponse received', body );
                fs.writeFile(__dirname + "/test.xml", body, 'utf8', function(err) {
                    if (err) 
                    	console.log("error : " + err);
                    console.log();
                    callback(null, connection);
                });
            });
        },
        function(connection, callback) {
            var xml2js = require('xml2js');
            var parser = new xml2js.Parser();

            fs.readFile(__dirname + "/test.xml", function(err, data) {
                console.log(data);
                parser.parseString(data, function(err, result) {
                    console.log(result);
                    console.log(result.response);
                    console.log(result.response.body[0]);
                    for(let i = 0 ; i < result.response.body[0].items.length ; i++){
                    	console.log(result.response.body[0].items[i]);
                    }

                });
                callback(null, connection);
            });
        },

        function(connection, callback) {

            let twoWeeksYear = [];

            let twoWeeksMonth = [];
            var maxIndex = maxDate[currentMonth - 1];

            let twoWeeksDate = [];

            let twoWeeksDay = [];
            var dayIndex = -1;
            for (var i = 0; i < 7; i++) {
                if (day[i] == currentDay)
                    dayIndex = i;
            }

            //	계산
            for (var i = 0; i < 14; i++) {

                var tempDate = (currentDateMinus1 % maxIndex) + 1;
                if (currentDateMinus1 == maxIndex) {
                    currentMonth++;
                    if (currentMonth == 13) {
                        currentMonth = 1;
                        currentYear++;
                    }
                    maxIndex = maxDate[currentMonth - 1];
                    currentDateMinus1 = 0;
                }

                twoWeeksDay.push(dayHangle[dayIndex % 7]);
                twoWeeksDate.push(String(tempDate));
                twoWeeksMonth.push(String(currentMonth));
                twoWeeksYear.push(String(currentYear));

                dayIndex++;
                currentDateMinus1++;
            }

            connection.release();
            callback(null, twoWeeksDay, twoWeeksDate, twoWeeksMonth, twoWeeksYear);
        },

        function(listDay, listDate, listMonth, listYear, callback) {

            res.status(200).send({
                status: "success",
                data: {
                    twoWeeksYear: listYear,
                    twoWeeksMonth: listMonth,
                    twoWeeksDate: listDate,
                    twoWeeksDay: listDay
                },
                message: "successful get currentDay"
            });

            // real
            var nodemailer = require('nodemailer');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'hyunho9304@gmail.com',
                    pass: 'tkfkd6749'
                }
            });

            var mailOption = {
                from: '박현호 <hyunho9304@gmail.com>',
                to: '',
                subject: 'nodemailer test',
                html: '<h1>HTML 보내기 테스트</h1><p><img src="https://hyunho9304.s3.ap-northeast-2.amazonaws.com/1538040896397.jpg"/></p>'
            };

            let toMail = "gusgh1492@naver.com"

            mailOption.to = toMail;

            // transporter.sendMail(mailOption, function(err, info) {
            //  			if ( err ) {
            //      			console.error('Send Mail error : ', err);
            //  			}
            //  			else {
            //      			console.log('Message sent : ', info);
            //  			}
            // });

            callback(null, "successful get currentDay");
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