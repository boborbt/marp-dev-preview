const express = () => ({
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  listen: jest.fn(),
});

express.static = jest.fn();
express.text = jest.fn();
express.json = jest.fn();

export default express;
