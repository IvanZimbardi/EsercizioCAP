const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const remote = await cds.connect.to("ZEX_ORDERS_SRV");

  this.on("READ", "Articles", async (req) => {
    let aData = await remote.run(req.query);

    if (req.query.SELECT.where) {
      const oCodArticoloFilter = req.query.SELECT.where.find((item) => item.ref && item.ref[0] === "CodArticolo");

      if (oCodArticoloFilter) {
        const sSearchValue = req.query.SELECT.where.find((item) => item.val)?.val;

        if (sSearchValue && Array.isArray(aData)) {
          return aData.filter((item) => item.CodArticolo == sSearchValue);
        }
      }
    }

    return aData;
  });

  this.on("CREATE", "Articles", async (req) => {
    return remote.run(req.query);
  });

  this.on("DELETE", "Articles", async (req) => {
    return remote.run(req.query);
  });

  this.on("READ", "Orders", async (req) => {
    return remote.run(req.query);
  });
});
