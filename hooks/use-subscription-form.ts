"use client";

import { useState } from "react";
import type { SubscriptionDTO } from "@/lib/subscriptions/serializers";
import {
  subscriptionSchema,
  type SubscriptionInput,
} from "@/lib/validations/subscription";

// Los campos de catálogo se manejan como el código string (catalogId).
export interface SubscriptionFormValues {
  name: string;
  category: string;
  paymentDay: string;
  secondPaymentDay: string;
  paymentMonth: string;
  importance: string;
  price: string;
  billingCycle: string;
  status: string;
  notes: string;
  url: string;
}

const EMPTY_VALUES: SubscriptionFormValues = {
  name: "",
  category: "",
  paymentDay: "",
  secondPaymentDay: "",
  paymentMonth: "",
  importance: "MEDIA",
  price: "",
  billingCycle: "MONTHLY",
  status: "ACTIVE",
  notes: "",
  url: "",
};

function toFormValues(subscription: SubscriptionDTO): SubscriptionFormValues {
  return {
    name: subscription.name,
    category: subscription.category,
    paymentDay: String(subscription.paymentDay),
    secondPaymentDay:
      subscription.secondPaymentDay != null
        ? String(subscription.secondPaymentDay)
        : "",
    paymentMonth:
      subscription.paymentMonth != null ? String(subscription.paymentMonth) : "",
    importance: subscription.importance,
    price: String(subscription.price),
    billingCycle: subscription.billingCycle,
    status: subscription.status,
    notes: subscription.notes ?? "",
    url: subscription.url ?? "",
  };
}

type FieldErrors = Partial<Record<keyof SubscriptionFormValues, string>>;

/**
 * Controlled form state validated with the shared zod schema. `initial`
 * seeds the fields for editing; remount the consumer (via key) to switch item.
 */
export function useSubscriptionForm(options: {
  initial?: SubscriptionDTO | null;
  onSubmit: (input: SubscriptionInput) => Promise<boolean>;
}) {
  const [values, setValues] = useState<SubscriptionFormValues>(() =>
    options.initial ? toFormValues(options.initial) : EMPTY_VALUES
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Whether every required field passes validation, so the submit button can
  // stay disabled until the form is complete.
  const isValid = subscriptionSchema.safeParse(values).success;

  const setValue = <K extends keyof SubscriptionFormValues>(
    field: K,
    value: SubscriptionFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const reset = () => {
    setValues(options.initial ? toFormValues(options.initial) : EMPTY_VALUES);
    setErrors({});
  };

  /** Validate a single field on blur; sets or clears only that field's error. */
  const validateField = (field: keyof SubscriptionFormValues) => {
    const parsed = subscriptionSchema.safeParse(values);
    const message = parsed.success
      ? undefined
      : parsed.error.issues.find((issue) => issue.path[0] === field)?.message;
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = subscriptionSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof SubscriptionFormValues;
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await options.onSubmit(parsed.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    setValue,
    validateField,
    reset,
    handleSubmit,
  };
}
