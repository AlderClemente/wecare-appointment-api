const xml2js = require("xml2js");
const js2xmlparser = require("js2xmlparser");

const parseXML = async (xml) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  return parser.parseStringPromise(xml);
};

const sendResponse = (req, res, data) => {
  const accept = req.headers.accept;

  if (accept === "application/xml") {
    res.set("Content-Type", "application/xml");
    res.send(js2xmlparser.parse("response", data));
  } else {
    res.json(data);
  }
};

module.exports = { parseXML, sendResponse };
