const { createMachine } = require("xstate");
const { assign } = require("@xstate/immer");

const config = {
  strict: true,
  id: "auth-machine",
  initial: "init",
  context: {
    attempts: 0,
  },
  states: {
    init: {
      meta: {
        input: {
          type: "object",
          required: ["event"],
          properties: {
            event: { enum: ["NEXT"] },
          },
        },
      },
      on: {
        NEXT: "login",
      },
    },
    login: {
      meta: {
        input: {
          type: "object",
          required: ["event", "password"],
          properties: {
            event: { enum: ["NEXT"] },
            password: { type: "string" },
          },
        },
      },
      on: {
        NEXT: [
          { target: "authenticationFailed", cond: "maxAttemptsReached" },
          { target: "authenticating" },
        ],
      },
    },
    authenticating: {
      invoke: {
        src: "authenticator",
        onDone: {
          target: "authenticated",
          actions: ["incrementAttempts"],
        },
        onError: {
          target: "login",
          actions: ["incrementAttempts"],
        },
      },
    },
    authenticated: {
      type: "final",
    },
    authenticationFailed: {
      type: "final",
    },
  },
};

// services
function authenticator(ctx, e) {
  const {
    data: { password },
  } = e;
  return new Promise((resolve, reject) =>
    password === "password" ? resolve() : reject()
  );
}

// actions
const incrementAttempts = assign((ctx) => ctx.attempts++);

// guards
function maxAttemptsReached(ctx, e) {
  const { attempts } = ctx;
  return attempts >= 3;
}

function getMachine() {
  const machine = createMachine(config, {
    services: { authenticator },
    actions: { incrementAttempts },
    guards: { maxAttemptsReached },
  });
  return machine;
}

module.exports = { getMachine };
