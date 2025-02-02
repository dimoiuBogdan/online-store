import { generateAccessToken, paypal } from "../lib/paypal";

// test to generate access token
describe("generateAccessToken", () => {
  it("should generate an access token", async () => {
    const accessToken = await generateAccessToken();

    expect(typeof accessToken).toBe("string");

    expect(accessToken.length).toBeGreaterThan(0);
  });
});

// test to create order
describe("createOrder", () => {
  it("should create an order", async () => {
    const order = await paypal.createOrder(100);
    const price = 10.0;

    const orderResponse = await paypal.createOrder(price);

    expect(orderResponse).toHaveProperty("id");
    expect(orderResponse).toHaveProperty("status", "CREATED");
  });
});

// test to capture payment with mock order
describe("capturePayment", () => {
  it("should capture a payment", async () => {
    const orderId = "100";

    const mockCapturePayment = jest
      .spyOn(paypal, "capturePayment")
      .mockResolvedValue({
        status: "COMPLETED",
      });

    const captureResponse = await paypal.capturePayment(orderId);

    expect(captureResponse).toHaveProperty("status", "COMPLETED");

    mockCapturePayment.mockRestore();
  });
});
