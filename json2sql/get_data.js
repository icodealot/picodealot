var https   = require('https');
var sqlite3 = require('sqlite3').verbose();

var db   = new sqlite3.Database('./test.db');
var url  = 'https://jsonplaceholder.typicode.com/todos';
var data = '';

/*
  Make an HTTPS request to the RESTful web service
*/
var req = https.request(url, (res) => {

  res.on('data', (d) => {
    data += d;
  });

  res.on('end', () => {
    var json = JSON.parse(data);

    create_table(json);

    /*
      verify the data made it into the table
    */
    db.each('select rowid, title '
          + 'from todo '
          + 'order by rowid asc', (err, row) => {
      console.log(row.rowid + ': ' + row.title);
    });
  });

});
req.end();

/*
  Create the table and insert the values from each JSON object.
*/
function create_table(json) {

  // hard coding is cheating, mostly... make it dynamic!

  db.serialize( () => {
    db.run('create table if not exists '
          + 'todo ('
          + 'id numeric primary key, '
          + 'userid numeric, '
          + 'title text, '
          + 'completed text)');

    db.run('delete from todo'); //or drop the table first..

    var stmt = db.prepare('insert into todo values (?,?,?,?)');

    json.forEach( (item) => {
      stmt.run([item.id, item.userid, item.title, item.completed]);
    });

    stmt.finalize();

  });

}
