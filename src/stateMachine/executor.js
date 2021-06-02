const { interpret } = require("xstate");
const { machineFactory } = require("./machineFactory");

function execute(machineId, { event, data }, { currentState }) {
  return new Promise((resolve, reject) => {
    // safety net for long running processes
    const timeout = setTimeout(() => reject("timeout"), 5000);

    // load machine
    const getMachine = machineFactory[machineId];
    if (!getMachine) {
      reject(`invalid machine id: ${machineId}`);
    }

    const machine = getMachine();

    // rehydrate and start machine
    const { value, context } = currentState || machine.initialState;
    const service = interpret(machine.withContext(context))
      .start(value)
      .onTransition((state) => {
        if (state.changed) {
          const { activities, value, context, done, meta = {} } = state;
          const currentMeta = meta[`${machineId}.${value}`] || {};
          const runningActivities =
            Object.values(activities).length > 0 &&
            !Object.values(activities).every((a) => a === false);

          // we don't want to respond if there are running activities (e.g. invoked services)
          // we need to wait for those to complete and transition to a static node
          // before returning control back to the client
          if (!runningActivities) {
            clearTimeout(timeout);
            service.stop();
            resolve({
              //stateObj: state,
              value,
              context,
              done,
              ...currentMeta,
            });
          }
        }
      });

    service.send(event, { data });
  });
}

module.exports = { execute };
