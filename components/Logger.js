import {React, useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {Platform} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import {getDevice} from 'react-native-device-info';
import SyncStorage from 'sync-storage';
import axios from 'react-native-axios';
import base64 from 'react-native-base64'
var db = openDatabase(
  {name: 'tech_data', location: 'default'},
  () => {},
  error => {
    console.log('ERROR: ' + error);
  },
);
let id = 0;

export const Init = async (endPoint, user) => {
  try {
    //setting offset
    SyncStorage.set('offset', 0);
    // setting device platform...
    Platform.OS === 'android'
      ? SyncStorage.set('device_platform', 'android')
      : SyncStorage.set('device_platform', 'ios');
    // setting endpoint of api...
    SyncStorage.set('endPoint', endPoint);
    // setting device name...
    let device_name = null;
    device_name = await getDevice()._j;
    if(device_name) SyncStorage.set('device_name', device_name);
    // setting user ...
    SyncStorage.set('current_user', user);
    // creating table name(table_logger) if not exist...

    let promise = new Promise((resolve, reject) => {
      db.transaction(async function (txn) {
        txn.executeSql(
          "SELECT * FROM sqlite_master WHERE type='table' AND name='table_logger'",
          [],
          async function (tx, res) {
            console.log('item length:', res.rows.length);
            if (res.rows.length == 0) {
              txn.executeSql('DROP TABLE IF EXISTS table_logger', []);
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS table_logger(log_id INTEGER PRIMARY KEY AUTOINCREMENT, filename VARCHAR(20), device_platform VARCHAR(20), device_name VARCHAR(20), currentuser VARCHAR(255), log_sent_status VARCHAR(100), message VARCHAR(255), created_at VARCHAR(255), updated_at VARCHAR(255))',
                [],
                function (tx, res) {
                  console.log('table is created', res);
                  return resolve({tx, status: 200});
                },
              );
            }
            err => {
              console.log(err);
              return reject();
            };
          },
        );
      });
    });
   let table_response = await promise;
   console.log("table created response",table_response );
      if (table_response.status == 200) {
        return {status: 200};
      }
  } catch (err) {
    console.log(err.message);
  }
};
export const setComponentName = (route = null) => {
  try {
    if(route){
    console.log('component name', route.name);
    }else{
       route = useRoute();
    }
    SyncStorage.set('fileName', route.name);
  } catch (err) {
    console.log(err.message);
  }
};
export const sendLog = async () => {
  try {
    let promise = new Promise((resolve, reject) => {
      let offset = SyncStorage.get('offset') ? SyncStorage.get('offset') : 0;
      // Getting records from db
      db.transaction(async function (txn) {
        txn.executeSql(
          `SELECT * FROM table_logger WHERE log_sent_status = 'PENDING' LIMIT 1000 OFFSET ${offset}`,
          [],
          async (tx, results) => {
            var temp = [];
            id = SyncStorage.get('first_id') ? SyncStorage.get('first_id') : 0;
            SyncStorage.set('last_id', id);
            for (let i = 0; i < results.rows.length; ++i) {
              delete results.rows.item(i)['log_sent_status'];
              id = results.rows.item(i).log_id;
              temp.push(results.rows.item(i));
            }
            SyncStorage.set('first_id', id);
            console.log('rows length:', results.rows.length);
            offset = SyncStorage.get('offset') + 1000;
            // setting new offsets ...
            SyncStorage.set('offset', offset);
            console.log('all fetched rows from table', temp);
            try {
              if (
                results.rows.length != 0 &&
                SyncStorage.get('endPoint') != null
              ) {
                console.log(
                  'sending logs to backend on http://192.168.100.41:3001/' +
                    SyncStorage.get('endPoint') +
                    ' url',
                );
                var username = 'form_data';
                var password = 'a_p_creds';
                const token = `${username}:${password}`;
                const encodedToken = base64.encode(token);
                //sending logs to backend...
                let response = await axios.post(
                  `http://192.168.100.41:3001/${SyncStorage.get('endPoint')}`,
                  {temp},
                  {
                    headers: {
                      'Authorization': 'Basic '+ encodedToken
                    },
                  },
                );

                console.log('status:', response.status);

                return resolve({tx, status: response.status});
              }
              return resolve({tx, status: null});
            } catch (err) {
              console.log(err.message);
              return reject();
            }
          },
        );
      });
    });

    promise.then(response => {
      console.log('response status:', response.status);
      if (response && response.status && response.status == 200) {
        console.log('id of last row', SyncStorage.get('last_id'));
        //updating rows
        db.transaction(async function (txn) {
          txn.executeSql(
            `UPDATE table_logger SET log_sent_status = ? WHERE log_id <= ${id} AND log_id >${SyncStorage.get(
              'last_id',
            )}`,
            ['COMPLETED'],
            async (tx, results) => {
              if (results.rowsAffected > 0) {
                console.log(
                  'all rows updated in table_logger',
                  results.rowsAffected,
                );
              }
            },
          );
        });
      }
    });
  } catch (err) {
    console.log(err.message);
  }
};
export const Log = async message => {
  try {
  
    console.log('checking table is created...', SyncStorage.get('device_platform'));
    if (SyncStorage.get('device_platform') == undefined) {
     let init_response = await Init('form_submit', 'JONE');
      console.log('Init function called', init_response);
    }
    console.log(SyncStorage.get('device_platform'))
    if (SyncStorage.get('device_platform') != undefined) {
      let Log = {
        endPoint: SyncStorage.get('endPoint')
          ? SyncStorage.get('endPoint')
          : null,
        file_name: SyncStorage.get('fileName')
          ? SyncStorage.get('fileName')
          : null,
        device_platform: SyncStorage.get('device_platform')
          ? SyncStorage.get('device_platform')
          : null,
        device_name: SyncStorage.get('device_name')
          ? SyncStorage.get('device_name')
          : null,
        current_user: SyncStorage.get('current_user')
          ? SyncStorage.get('current_user')
          : null,
        log_send_status: 'PENDING',
        message: message ? message : null,
        current_Time: Date().valueOf(),
        updated_Time: Date().valueOf(),
      };
      console.log('consoling Log...', Log);
      delete Log.endPoint;
      let insertArray = Object.values(Log);
      if (
        Log.file_name &&
        Log.device_platform &&
        Log.current_user &&
        Log.message
      ) {
        
        console.log('inserting data...', insertArray);
        db.transaction(function (txn) {
          txn.executeSql(
            'INSERT INTO table_logger (filename, device_platform, device_name, currentuser, log_sent_status, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            insertArray,
            (tx, res) => {
              console.log(res.rowsAffected);
              if (res.rowsAffected > 0) {
                console.log('row has been inserted`', res.rows);
              } else {
                console.log('row has not been inserted`', res);
              }
            },
            err => {
              console.log(err);
            },
          );
        });
      } else {
        console.log('some fields of the table is null');
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};
