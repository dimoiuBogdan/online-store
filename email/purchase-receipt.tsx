import { formatCurrency, formatDateTime } from "@/lib/utils";
import { OrderType } from "@/types";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const PurchaseReceipt = ({ order }: { order: OrderType }) => {
  return (
    <Html>
      <Preview>Purchase Receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-white font-sans">
          <Container className="max-w-xl">
            <Heading className="text-xl font-bold">Purchase Receipt</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Order ID
                  </Text>
                  <Text className="mb-0 text-gray-700">
                    {order.id.toString()}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Purchase Date
                  </Text>
                  <Text className="mb-0 text-gray-700">
                    {formatDateTime(order.createdAt).dateOnly}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Price Paid
                  </Text>
                  <Text className="mb-0 text-gray-700">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {order.orderItems.map((item) => (
                <Row key={item.productId} className="mt-8">
                  <Column className="w-20">
                    <Img
                      src={
                        item.image.startsWith("/")
                          ? `${process.env.NEXT_PUBLIC_APP_URL}${item.image}`
                          : item.image
                      }
                      alt={item.name}
                      width={80}
                      className="rounded"
                    />
                  </Column>
                  <Column className="align-top">
                    <Text className="mb-0 text-gray-700">
                      {item.name} x {item.qty}
                    </Text>
                  </Column>
                  <Column align="right" className="align-top">
                    <Text className="mb-0 text-gray-700">
                      {formatCurrency(item.price)}
                    </Text>
                  </Column>
                </Row>
              ))}
              {[
                {
                  name: "Items",
                  price: order.itemsPrice,
                },
                {
                  name: "Shipping",
                  price: order.shippingPrice,
                },
                {
                  name: "Tax",
                  price: order.taxPrice,
                },
                {
                  name: "Total",
                  price: order.totalPrice,
                },
              ].map((item) => (
                <Row key={item.name}>
                  <Column className="w-20" />
                  <Column className="align-top">
                    <Text className="mb-0 text-gray-700">{item.name}</Text>
                  </Column>
                  <Column align="right" className="align-top">
                    <Text className="mb-0 text-gray-700">
                      {formatCurrency(item.price)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PurchaseReceipt;
