# serverless-fhir
A simple FHIR API Implementation using AWS Lambda and Serverless

The repo contains the lambda code for the API and the yaml for the Serverless framework (serverless.com). 

The Lambda handler has two functions: Get and Create both are configured as http events so they are deployed in AWS API Gateway.

The API depends on AWS Dynamo database and the table configuratin is defined in the serverless.yaml.
