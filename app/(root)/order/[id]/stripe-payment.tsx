import { Button } from "@/components/ui/button";
import { SERVER_URL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useTheme } from "next-themes";
import { useState } from "react";

type Props = {
  priceInCents: number;
  clientSecret: string;
  orderId: string;
};

const StripePayment = ({ priceInCents, clientSecret, orderId }: Props) => {
  const { theme, systemTheme } = useTheme();

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: theme === "dark" ? "night" : "stripe",
        },
      }}
    >
      <StripeForm
        priceInCents={priceInCents}
        onSubmit={handleSubmit}
        orderId={orderId}
      />
    </Elements>
  );
};

export default StripePayment;

const StripeForm = ({
  priceInCents,
  onSubmit,
  orderId,
}: {
  priceInCents: number;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  orderId: string;
}) => {
  const stripe = useStripe();

  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements || !email) {
      return;
    }

    setIsLoading(true);

    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${SERVER_URL}/order/${orderId}`,
        },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setError(error.message ?? "An unknown error occurred");
        } else if (error) {
          setError("An unknown error occurred");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="text-xl">Stripe Checkout</div>
      {error && <div className="text-red-500">{error}</div>}
      <PaymentElement />
      <div>
        <LinkAuthenticationElement onChange={(e) => setEmail(e.value.email)} />
      </div>
      <Button
        className="w-full"
        type="submit"
        size="lg"
        disabled={isLoading || !stripe || !elements}
      >
        {isLoading
          ? "Processing..."
          : `Pay Now ${formatCurrency(priceInCents / 100)}`}
      </Button>
    </form>
  );
};
