var data = require('./adjusted-data.json');
var jsonfile = require('jsonfile');
var file = './chart-data.json';

// https://data.cityofnewyork.us/api/views/25th-nujf/rows.json?accessType=DOWNLOAD
//columns fieldName: [:sid, :id, :position, :created_at, :created_meta, :updated_at, :updated_meta, :meta, brth_yr (8), gndr (9), ethcty (10), nm (11), cnt (12), rnk (13)]

//not efficient but you only have to do this once...
//translates adjusted json data into a json object for bubble chart
function createBubbleChartData() {
  var dataObj = {
    "name": "Popular Names By Ethnicity In NYC: 2011-2014",
    "children": []
  };
  var ethnicities = ["HISPANIC", "WHITE NON HISPANIC", "ASIAN AND PACIFIC ISLANDER", "BLACK NON HISPANIC"];
  var genders = ["FEMALE", "MALE"];
  var years = ["2011", "2012", "2013", "2014"];

  ethnicities.forEach(function(ethnicity) {
    var name = capitalizeWords(ethnicity);
    var ethnicityObj = { name, children: [] };

    //each ethnicity has years 2011-2014 of data, each year will have 2 genders
    years.forEach(function(year) {
      var yearObj= { name: year, children: [] };
      //each year must have two children -- Male/Female
      genders.forEach(function(gender) {
        var name = capitalizeWords(gender);
        var genderObj = { name, children: [] };
        data.data.forEach(function(item) {
          var [birthYear, itemGender, itemEthnicity, itemName, itemCount, itemRank] = [Number(item[8]), item[9],item[10], item[11], Number(item[12]), Number(item[13])];
          if(birthYear == year && itemGender == gender && itemEthnicity == ethnicity) {
            genderObj.children[itemRank] = { year, gender: name, count: itemCount, rank: itemRank, name: capitalizeWords(itemName) };
          }
        });
        genderObj.children.shift();
        //Push Male/Female data into year object
        yearObj.children.push(genderObj);
      });
      //Push year object with male/female data into ethnicity children
      ethnicityObj.children.push(yearObj);
    });
    dataObj.children.push(ethnicityObj);
  });

  jsonfile.writeFile(file, dataObj, {spaces: 2}, function(err) {
    console.error(err);
  });
};

function capitalizeWords(str) {
  return str.toLowerCase().replace(/([^a-z])([a-z])(?=[a-z]{2})|^([a-z])/g, function(_, g1, g2, g3) {
    return (typeof g1 === 'undefined') ? g3.toUpperCase() : g1 + g2.toUpperCase(); } );
};

createBubbleChartData();
