"use strict";

class WxRequest {
  post() {
    return Promise.reject(new Error("wx_mp adapter is unavailable in Node."));
  }
  get() {
    return Promise.reject(new Error("wx_mp adapter is unavailable in Node."));
  }
  upload() {
    return Promise.reject(new Error("wx_mp adapter is unavailable in Node."));
  }
  download() {
    return Promise.reject(new Error("wx_mp adapter is unavailable in Node."));
  }
}

class WxMpWebSocket {}

const wxMpStorage = {
  setItem: () => undefined,
  getItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined
};

const parseQueryString = () => ({});

module.exports = {
  default: {
    genAdapter: () => ({}),
    isMatch: () => false,
    runtime: "wx_mp"
  },
  WxRequest,
  WxMpWebSocket,
  wxMpStorage,
  parseQueryString,
  genAdapter: () => ({}),
  isMatch: () => false,
  runtime: "wx_mp"
};
