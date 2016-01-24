var http = require('http');
var url = require('url');
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './database/tellstick.db'
  }
});

var simulateVersion = '2.5.0';

http.createServer(function (req, res) {
  if (req.url.indexOf('favicon') == -1) {
    
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    res.writeHead(200, {'Content-Type': 'text/plain'});
    //console.log(query.status);
    switch(query.command) {
      case('resetdb'):
        console.log('Received request to reset the database.');
        reCreateDefaults(req,res,query.devices)
        break;
      case('devices'):
        switch(query.status) {
          case('on'):
            knex('devices').where('id', '=', query.id)
            .update({
              lastsentcommand: query.status
            }).then(function(done) {
              knex('devices').where('id', query.id).select().then(function (dbresult){console.log('Successfully send command ' + query.status + ' to device ' + dbresult[0].name + '.');res.end('Successfully send command ' + query.status + ' to device ' + dbresult[0].name + '.')})
            })
              
            break;
          case('off'):
            knex('devices').where('id', '=', query.id)
            .update({
              lastsentcommand: query.status
            }).then(function(done) {
              knex('devices').where('id', query.id).select().then(function (dbresult){console.log('Successfully send command ' + query.status + ' to device ' + dbresult[0].name + '.');res.end('Successfully send command ' + query.status + ' to device ' + dbresult[0].name + '.')})
            })
            
            break;
          default:
            res.end('Unknown status');
        }
        break;
      case('list-devices'):
        knex.select().from('devices').then(
            function (dbresult) {
              dbresult.forEach(function (object) {
                var row = ""
                for (var key in object) {
                  row += key + '=' + object[key] + '\t';
                }
                res.write(row + '\n');
              });
              console.log('Returned a list of devices.');
              res.end();
            });
        
        break;
      case('version'):
        console.log('Returned the current version.');
        res.end('Version: ' + simulateVersion);
        break;
      default:
        res.end('No command received.\n\nSupported commands are:\n resetdb - Creates new devices. By also providing devices=<number> you can decide how many.\n Example: ?command=resetdb&devices=10\n\n device - used to send commands to devices.');
    }

  } else {
    res.end();
  }
}).listen(8889);
console.log('Tellstick Virtualization started.');


// This function is used to reset the database into a clean state with a set of default devices.
function reCreateDefaults (req,res,numberOfDevices) {
  console.log('Started creating default devices.');
  res.write('Started creating default devices.\n');
  knex('devices').del().then(function(done) {

    if (typeof(numberOfDevices) == 'undefined') {
      numberOfDevices = 10;
    }
    var completedInserts = 0;
    for (var i=0; i<numberOfDevices; i++) {
      knex('devices').insert({id: i,name: 'DemoDevice_'+i,lastsentcommand: 'off',type: 'device'}).then(function(done) {
        console.log('Created DemoDevice_' + done);
        res.write('Created DemoDevice_' + done + '\n');
        completedInserts++;
        
        if (completedInserts == numberOfDevices) {
          console.log('Done creating default devices.');
          res.end('Done creating default devices.\n');
        }
      });
      
    }
    
  });
}
                             