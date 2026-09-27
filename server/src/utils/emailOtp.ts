import crypto from "node:crypto";

export const generateEmailOTP = () => {
  const code = crypto.randomInt(100000, 1000000).toString();

  const codeHash = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  return {
    code,
    codeHash,
  };
};