var sqlite3 = require('sqlite3').verbose();

exports.getPage = (req, res) => {
  let pageId = req.params.id;
  let version = req.query.version;
  let db = new sqlite3.Database('./temp/db.db');
  db.get("SELECT * FROM Pages WHERE id MATCH ? AND modifiedReason IS NULL ORDER BY timestamp DESC", [pageId], (err, row) => {
    if (err) {
      res.status(500).json(err);
    } else if (row) {
      res.status(200).json(row)
    } else {
      res.status(404).json();
    }
  });
  db.close();
};

exports.getPageVersion = (req, res) => {
  let pageId = req.params.id;
  let version = req.params.version;
  let next = req.params.next;

  if (next === "next") {
    getPageNextVersion(pageId, version).then(page => {
      res.status(200).json(page);
    }, err => res.status(500).json(err));
  } else {
    let db = new sqlite3.Database('./temp/db.db');
    db.get("SELECT * FROM Pages WHERE id MATCH ? AND TIMESTAMP = ? ORDER BY timestamp DESC",
      [pageId, version], (err, row) => {
        if (err) {
          res.status(500).json(err);
        } else if (row) {
          res.status(200).json(row)
        } else {
          res.status(404).json();
        }
      });
    db.close();
  }
};

exports.searchPages = (req, res) => {
  let ids = req.query.ids;
  
  if (ids) {        
    getPagesByIds(ids).then(pages => {
      res.status(200).json(pages);
    }, err => {
      res.status(500).json(err);
    })
  } else {
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
  }
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
      db.run("INSERT INTO Pages (id, title, content, modifiedReason, timestamp) VALUES (?,?,?,?,?)",
        [id, newPage.title, newPage.content, null, now.toISOString()], (err) => {
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

exports.updatePage = (req, res) => {
  let db = new sqlite3.Database('./temp/db.db');
  let existingPage = req.body;

  getPageByTitle(existingPage.title).then(foundPage => {
    if (foundPage.id !== existingPage.id) {
      res.status(409).json();
    } else {
      const now = new Date();
      const updatePromise = new Promise((resolve, reject) => {
        db.run("UPDATE Pages SET modifiedReason = ? WHERE id = ? AND timestamp = ?", [existingPage.modifiedReason, foundPage.id, foundPage.timestamp], err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      })

      updatePromise.then(() => {
        db.run("INSERT INTO Pages (id, title, content, modifiedReason, timestamp) VALUES (?,?,?,?,?)",
          [foundPage.id, existingPage.title, existingPage.content, null, now.toISOString()], (err) => {
            if (err) {
              res.status(500).json(err);
            } else {
              res.status(200).json(existingPage)
            }
            db.close();
          });
      }, (err) => {
        res.status(500).json(err);
      })
    }
  }, err => { res.status(500).json(err) });
}

exports.getPageHistory = (req, res) => {
  let pageId = req.params.id;
  let db = new sqlite3.Database('./temp/db.db');
  db.all("SELECT * FROM Pages WHERE id MATCH ? AND modifiedReason IS NOT NULL ORDER BY timestamp DESC", [pageId], (err, rows) => {
    if (err) {
      res.status(500).json(err);
    } else if (rows) {
      res.status(200).json(rows)
    } else {
      res.status(404).json();
    }
  });
  db.close();
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

function getPagesByIds(ids) {
  let db = new sqlite3.Database('./temp/db.db');
  let idsCollection = ids.split(',');

  return new Promise((resolve, reject) => {
    const sql = `SELECT id FROM Pages WHERE (id MATCH '${idsCollection.join("' OR id MATCH '")}') AND modifiedReason IS NULL ORDER BY timestamp DESC`;
    db.all(sql,
      (err, rows) => {
        if (err) {
          reject(err)
        }
        else {
          resolve(rows)
        }
        db.close();
      });
  })
}

function getPageNextVersion(id, version) {
  let db = new sqlite3.Database('./temp/db.db');

  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Pages WHERE id MATCH ? ORDER BY timestamp DESC";
    db.all(sql, [id],
      (err, rows) => {
        if (err) {
          reject(err)
        }
        else {
          const currentIndex = rows.findIndex(page => page.timestamp === version);
          const nextIndex = currentIndex - 1;

          resolve(rows[nextIndex])
        }
        db.close();
      });
  })
}