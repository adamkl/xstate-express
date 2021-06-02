const authMachine = require("./machines/authMachine");

const machineIds = {
  AUTH_MACHINE: "AUTH_MACHINE",
};

const machineFactory = {
  [machineIds.AUTH_MACHINE]: authMachine.getMachine,
};

module.exports = { machineIds, machineFactory };
