const createXhrMock = () => {
  const xhrMockObj = {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
    readyState: 4,
    status,
    response: {},
  };

  return () => xhrMockObj;
};

export default createXhrMock;
