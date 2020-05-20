var sqlite3 = require('sqlite3').verbose();

exports.getPage = (req, res) => {
  let pageId = req.params.id;
  let db = new sqlite3.Database('./temp/db.db');
  db.on("trace", s => console.log(s))
  db.get("SELECT * FROM Pages WHERE id = ? ORDER BY timestamp DESC", [pageId], (e, row) => {
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
  let page = req.body;
  if (page.id) {
    res.status(200).json(page);
  } else {
    const id = page.title.replace(" ", "_");
    console.log(id);

    db.run("INSERT INTO Pages (id, title, content, imagePath, modifiedReason, timestamp) VALUES (?,?,?,?,?,?)",
      [id, page.title, page.content, page.imagePath, null, new Date().toISOString()], (err) => {
        if (err) {
          res.status(500).json(err);
        }
      });
    res.status(200).json(id)
  }

  db.close();
}
