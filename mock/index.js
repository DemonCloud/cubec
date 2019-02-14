const bodyparser = require('body-parser');
const multer = require('multer');
const mock = require('mockjs');

const upload = multer();

module.exports = function(app) {
  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({ extended: true }));

  app.get('/mock1', (req, res) => {
    res.json(mock.mock({
      "a|1": '@range(6)'
    }));
  });

  app.get('/mock2', (req, res) => {
    res.json(mock.mock({
      "b|1": '@range(9,15)'
    }));
  });

  app.get('/mock3', (req, res) => {
    res.json({
      c: [9,10,11,12]
    });
  });

  app.post("/sync", upload.array(), (req, res) => {
    console.log("request method: "+ req.method);
    console.log("request data: "+ JSON.stringify(req.body));

    res.json({
      statusCode: 200,
      res: {
      }
    });
  });

};
