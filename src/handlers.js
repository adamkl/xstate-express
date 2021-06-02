const { StatusCodes } = require("http-status-codes");
const { execute } = require("./stateMachine");

function postMachine(req, res) {
  const machineId = req.headers["x-machine"];
  const state = req.session[machineId];
  const { event, data } = req.body;
  execute(machineId, { event, data }, { currentState: state })
    .then((result) => {
      const { value, context, done } = result;
      req.session[machineId] = done ? null : { value, context };
      res.status(StatusCodes.OK).send(result);
    })
    .catch((err) => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: err.message, stack: err.stack });
    });
}

function getMachine(req, res) {
  const machineId = req.headers["x-machine"];
  const { value, context } = req.session[machineId] || {};
  res.status(StatusCodes.OK).send({ value, context });
}

module.exports = { postMachine, getMachine };
