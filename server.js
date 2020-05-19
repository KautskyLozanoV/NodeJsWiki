const express = require('express')
const app = express();
const path = require("path")

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./temp/db.db');

db.serialize(function () {
    db.run("CREATE TABLE if not exists Pages (id TEXT PRIMARY KEY, title TEXT, content TEXT, imagePath TEXT)");

    for (var i = 0; i < 10; i++) {
        let id = i + 1;
        db.run("INSERT OR REPLACE INTO Pages (id, title, content, imagePath) VALUES (?,?,?,?)", `Title_${id}`,
            `Title ${id}`,
            `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna.
      Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci.
      Aenean nec lorem. In porttitor. Donec laoreet nonummy augue.
      Suspendisse dui purus, scelerisque at, vulputate vitae, pretium mattis, nunc. Mauris eget neque at sem venenatis eleifend. Ut nonummy.
      Fusce aliquet pede non pede. Suspendisse dapibus lorem pellentesque magna. Integer nulla.
      Donec blandit feugiat ligula. Donec hendrerit, felis et imperdiet euismod, purus ipsum pretium metus, in lacinia nulla nisl eget sapien. Donec ut est in lectus consequat consequat.
      Etiam eget dui. Aliquam erat volutpat. Sed at lorem in nunc porta tristique.
      Proin nec augue. Quisque aliquam tempor magna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
      Nunc ac magna. Maecenas odio dolor, vulputate vel, auctor ac, accumsan id, felis. Pellentesque cursus sagittis felis.`,
            'defaultImage');
    }
});

db.close();

function dbError(err) {
    if(err) console.log(`path: ${req.path} \n error: ${err}`);
}

function getError(e, row) {
    dbError(err);
    return row;
}

app.use("/images", express.static(path.join("images")))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS,PUT');
  next();
});

app.get('/api/pages/:id', (req, res) => {
    let pageId = req.params.id;
    let db = new sqlite3.Database('./temp/db.db');
    db.get("SELECT * FROM Pages where id = ?", [pageId], (e, row) => {
        if (row) { 
            res.status(200).json(row)            
        }
        else { 
            dbError(e)
            res.status(404).json();
        }
    });  
    db.close(); 
})

app.listen(3000)