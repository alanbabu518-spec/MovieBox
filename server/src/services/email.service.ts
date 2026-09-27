type SendVerificationEmailInput = {
  email: string;
  name: string;
  otp: string;
};

export const sendVerificationEmail = async ({
  email,
  name,
  otp,
}: SendVerificationEmailInput) => {
  console.log({
    to: email,
    name,
    otp,
  });
};