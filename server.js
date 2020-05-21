const express = require('express')
const path = require("path")
const routes = require('./routes/page')
const app = express();
const demoData = require("./demo");

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
                    demoData.demoContent,
                    'defaultImage',
                    'wrong title',
                    date.toISOString()                    
                    );

                    db.run("INSERT OR REPLACE INTO Pages (id, title, content, imagePath, modifiedReason, timestamp) VALUES (?,?,?,?,?,?)", `Title_${id}`,
                    `Title ${id} modified`,
                    demoData.demoContent,
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