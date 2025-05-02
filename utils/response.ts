const success = (data) => {
  if (typeof data !== "object") {
    data = { data };
  }

  return { success: true, ...data };
};

const failed = (reason) => {
  return { success: false, reason };
};

const getErrorCode = (err) => {
  let code = 500;

  //mongoose validation error
  if (err.name === "ValidationError") {
    code = 400;
  }

  //axios error
  if (err.response?.status && typeof err.response.status === "number") {
    code = err.response.status;
  }

  return code;
};

export { success, failed, getErrorCode };
