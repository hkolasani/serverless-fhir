  'use strict';
  const AWS = require('aws-sdk');

  module.exports.get = (event, context, callback) => {

    var patientId = event.pathParameters.patientId;
    var resourceName = event.pathParameters.resourceName;
    var patientIdResourceName = patientId + "-" + resourceName;

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName:'FHIR-Table',
        KeyConditionExpression: "#patientresourcekey = :patientResourceValue",
        ExpressionAttributeNames:{
            "#patientresourcekey": "PatientId-ResourceName"
        },
        ExpressionAttributeValues: {
            ":patientResourceValue": patientIdResourceName
        }
    };

    docClient.query(params, function(err, data) {
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
          callback(null, {
            statusCode: err.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t fetch the resources',
          });
      }
      else {
          console.log("Query succeeded for:" + patientIdResourceName);
          data.Items.forEach(function(item) {
              console.log(item);
          });
          const response = {
            statusCode: 200,
            body: JSON.stringify(data.Items)
          };
          callback(null, response);
      }
    });

  };

  module.exports.create = (event, context, callback) => {

    var patientId = event.pathParameters.patientId;
    var resourceName = event.pathParameters.resourceName;
    var patientIdResourceName = patientId + "-" + resourceName;
    var date = new Date();
    var timestamp = date.toISOString();
    var fhirData = JSON.parse(event.body);

    var docClient = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName:'FHIR-Table',
        Item:{
            "PatientId-ResourceName":patientIdResourceName,
            "Timestamp": timestamp,
            "FHIR-Resource-Data": fhirData
        }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            var errMsg = JSON.stringify(err, null, 2);
            console.error("Unable to add item. Error JSON:", errMsg);
            callback(null, {
              statusCode: err.statusCode || 501,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({"error": errMsg })
            });
        } else {
            console.log("Inserted FHIR Resource :", JSON.stringify(data, null, 2));
            const response = {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: '{"message":"Inserted FHIR Resource"}'
            };
            callback(null, response);
        }
    });

  };
