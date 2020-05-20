const express = require('express')
const path = require("path")
const routes = require('./routes/page')
const app = express();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./temp/db.db');
db.on("error", err => console.log("db error: " + err));

db.serialize(function () {
    db.run("CREATE VIRTUAL TABLE IF NOT EXISTS Pages USING fts5 (id, title, content, imagePath, modifiedReason, timestamp)");
    let promiseGetFoo = new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as total FROM Pages", (err, row) => {
            if (err) {
                reject(err)
            } else {
                resolve(row);
            }
        })
    });

    promiseGetFoo.then((row) => {
        let total = Number.parseInt(row.total)
        if (total < 10) {
            const date = new Date();
            const endDate = new Date();
            endDate.setHours(2);
            for (let i = total; i < 10; i++) {
                let id = i + 1;
                db.run("INSERT OR REPLACE INTO Pages (id, title, content, imagePath, modifiedReason, timestamp) VALUES (?,?,?,?,?,?)", `Title_${id}`,
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
                    'defaultImage',
                    'wrong title',
                    date.toISOString()                    
                    );

                    db.run("INSERT OR REPLACE INTO Pages (id, title, content, imagePath, modifiedReason, timestamp) VALUES (?,?,?,?,?,?)", `Title_${id}`,
                    `Title ${id} modified`,
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
                    'defaultImage',
                    null,
                    endDate.toISOString(),
                    );
            }
            db.close()
        }
    });

});

app.use("/images", express.static(path.join("images")))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS,PUT');
    next();
});

app.use('/api/pages', routes)

app.listen(3000)