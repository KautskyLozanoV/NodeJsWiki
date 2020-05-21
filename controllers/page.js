var sqlite3 = require('sqlite3').verbose();

exports.getPage = (req, res) => {
  let pageId = req.params.id;
  let db = new sqlite3.Database('./temp/db.db');
  db.get("SELECT * FROM Pages WHERE id = ? AND modifiedReason IS NULL ORDER BY timestamp DESC", [pageId], (e, row) => {
    if (row) {
      res.status(200).json(row)
    }
    else {
      res.status(404).json();
    }
  });
  db.close();
};

exports.searchPages = (req, res, next) => {
  let searchQuery = req.query.query;
  let db = new sqlite3.Database('./temp/db.db');
  let tokens = searchQuery.split(" ").map(t => t + '*');
  let query = tokens.join(" OR ");
  db.all("SELECT * FROM Pages WHERE modifiedReason IS NULL AND (title MATCH $query OR content MATCH $query) ORDER BY Rank", { $query: query },
    (e, rows) => {
      if (rows) {
        res.status(200).json(rows)
      }
      else {
        res.status(404).json();
      }
    });
  db.close();
};

exports.addPage = (req, res) => {
  let db = new sqlite3.Database('./temp/db.db');
  let newPage = req.body;

  const id = newPage.title.replace(" ", "_");

  getPageByTitle(newPage.title).then(foundPage => {
    if (foundPage) {
      res.status(409).json();
    } else {
      const now = new Date();
      db.run("INSERT INTO Pages (id, title, content, imagePath, modifiedReason, timestamp) VALUES (?,?,?,?,?,?)",
        [id, newPage.title, newPage.content, newPage.imagePath, null, now.toISOString()], (err) => {
          if (err) {
            res.status(500).json(err);
          } else {
            newPage.id = id;
            newPage.timestamp = now;
            res.status(200).json(newPage)
          }
          db.close();
        });
    }
  }, r => { res.status(500).json(r) });
}

function getPageByTitle(title) {
  return new Promise((resolve, reject) => {
    let db = new sqlite3.Database('./temp/db.db');
    db.get("SELECT * FROM Pages WHERE title = ? AND modifiedReason IS NULL ORDER BY timestamp DESC", [title], (e, row) => {
      if (e) {
        reject(e);
      } else {
        resolve(row);
      }
      db.close();
    });
  });
}