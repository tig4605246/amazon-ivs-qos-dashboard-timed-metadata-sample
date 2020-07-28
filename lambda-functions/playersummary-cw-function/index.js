'use strict';
/**
 * This shows how to use standard Apollo client on Node.js
 */
/**
 * This shows how to use standard Apollo client on Node.js
 */

require('es6-promise').polyfill();
require('isomorphic-fetch');
const URL = require('url');
const AWS = require('aws-sdk');
// Create CloudWatch service object
var cw = new AWS.CloudWatch({ apiVersion: '2010-08-01' });

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
const DASHBOARD_NAME = process.env.DASHBOARD_NAME;

console.log('Loading function');
exports.handler = (event, context, callback) => {
    let success = 0;
    let failure = 0;
    console.log("Event :%j", event);

    const output = event.records.map((record) => {
        /* Data is base64 encoded, so decode here */
        console.log("record :%j", record);
        const recordData = Buffer.from(record.data, 'base64');
        const jsonData = JSON.parse(recordData);
        console.log("data :%j", jsonData);

        const uri = URL.parse(GRAPHQL_ENDPOINT);
        console.log(uri.href);
        console.log("Region ", process.env.AWS_REGION);

        // Create parameters JSON for putMetricData
        var params = {
            MetricData: [{
                MetricName: jsonData.METRIC_TYPE.trim(),
                Dimensions: [
                //     {
                //     Name: 'ChannelName',
                //     Value: jsonData.CHANNEL_WATCHED,
                // },
                {
                    Name: 'ClientPlatform',
                    Value: jsonData.CLIENT_PLATFORM.trim()
                } ],
                // 'Timestamp': new Date().toISOString(),
                Unit: jsonData.METRIC_UNIT.trim(),
                Value: jsonData.SUMMARY
            }, ],
            Namespace: DASHBOARD_NAME+'/PlayerSummary2'
        };

        cw.putMetricData(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            }
            else {
                console.log("Success put metric in CW", JSON.stringify(data));
            }
        });

        return {
            recordId: record.recordId,
            result: 'Ok',
        };
    });

    callback(null, {
        records: output,
    });
};