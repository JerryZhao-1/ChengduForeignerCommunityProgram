"use strict";

class AI {}

class Bot {}

const models = {};
const utils = {};
const createAI = () => new AI();

module.exports = {
  AI,
  Bot,
  models,
  utils,
  createAI,
  createAi: createAI,
  registerAi: () => undefined,
  SimpleChatModel: class {}
};
