# serverless-fhir

This post outlines a simple FHIR API that I put together using AWS Lambda and Serverless.com framework.

Safe Harbor Statement

I have a tendency to over simplify things but I believe that the simplest solution is almost always the best. Having quoted that, this is just a basic reference implementation and it needs little more work to make it production worthy. Here we go:

What is FHIR

For those of you who are not familiar with FHIR, it's a spec (next-gen HL7) for data format that enables interoperability between healthcare entities (hospital systems, EHRs etc.).

In FHIR speak, data is classified as Resources. For eg. Allergies, Prescriptions, Observations etc. And these resources are tied to a Patient. For eg. Allergies of John Smith are grouped as FHIR Records. Once again this is my simple speak and the FHIR spec is pretty complicated.

The Idea

The idea is to implement an API that exposes two operations (get and create) on the FHIR Resources. These two functions are resource agnostic and take the PatientID and Resource Name as parameters and store/retrieve the data in JSON format.

GET /allergies/Tbt3KuCY0B5PSrJvCu2j (returns FHIR JSON data)

POST /allergies/Tbt3KuCY0B5PSrJvCu2j (stores FHIR JSON data)

where Tbt3KuCY0B5PSrJvCu2j is some kind of an Id that represents patient.

And the FHIR resource record is stored as JSON in the back-end database.

The API

Serveless.com framework an easy way to define the AWS Lambda functions and events that are deployed on AWS API Gateway using the serverless.yaml file. See below.

functions:
  create:
    handler: handler.create
    events:
      - http:
          path: /{resourceName}/{patientId}
          method: post
          cors: true
  get:
    handler: handler.get
    events:
      - http:
          path: /{resourceName}/{patientId}
          method: get
          cors: true
Both the API functions take Patient Id and Resource Name as parameters thus supporting any type of FHIR resource. The 'create' function expects the FHIR JSON data in the request body.

The Lambda code for these two functions is in handler.js.

The FHIR JSON Storage

This API stores the FHIR JSON data in AWS DynamoDB. A FHIR-Table is created with a a primary(partition key) that is a concatenation of Patient Id and the Resource Name.

e.g Key: Tbt3KuCY0B5PSrJvCu2j-Observations

The DynamoDB config can also be defined using the serverless.yaml file as shown below.

  DynamoDbTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: FHIR-Table
        AttributeDefinitions:
          - AttributeName: PatientId-ResourceName
            AttributeType: S
          - AttributeName: Timestamp
            AttributeType: S
        KeySchema:
          - AttributeName: PatientId-ResourceName
            KeyType: HASH
          - AttributeName: Timestamp
            KeyType: RANGE
DynamoDB supports storing of the entire JSON-formatted documents as single item attribute.

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
      TableName:'FHIR-Table',
      Item:{
          "PatientId-ResourceName":patientIdResourceName,
          "Timestamp": timestamp,
          "FHIR-Resource-Data": fhirDataJSON
      }
};

docClient.put(params, function(err, data) {}
Use Cases

A Patient using a Mobile app can post the health care data like vitals to a back-end storage using this API
A doctor using Mobile app can view the vitals uploaded by the patient.
An EHR can ingest the FHIR data using this API
Gotchas

The above mobile app use case is pretty simple as we are pushing the burden of dealing with the FHIR JSON to the consumer of the API. But in a real world the data is actually stored in hospital systems and EHRs and below are couple of ideas on how to FHIR enable them.

EHR FHIR Enablement:

Real Time:

EHR can trigger events in case of new data (allergies, prescriptions etc.)
An Integration tool can subscribe to these events and build FHIR JSON from the event and use our FHIR API to post the data to DynamoDB
Batch:

A scheduled batch job can pull the chunks of data from EHR and format them into FHIR JSON and post them to DynamoDB using our API.
TODO

As mentioned above this requires little more work to make it production worthy and here are some todo items:

Implement Security on the AWS API Gateway functions using AWS Cognito
Enhance the GET function to take date time as the range for the query.
REPO

The code and config is available here. Feel free to download and play with it. You may need to install Serverless.com framework prior to that.

Please reach out to me if you have some ideas that you want to collaborate and/or elaborate on this. We are working on some cool stuff at Hura and this is one of the building blocks!
