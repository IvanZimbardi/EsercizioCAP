const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const remote = await cds.connect.to("ZEX_ORDERS_SRV");

  this.on("READ", "Orders", async (req) => {
    console.log("Chiamata al MiniSAP per la lista ordini...");
    return remote.run(req.query);
  });

  this.on("READ", "Articles", async (req) => {
    return remote.run(req.query);
  });

  this.on("CREATE", "Articles", async (req) => {
    return remote.run(req.query);
  });
});
