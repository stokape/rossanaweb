"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/CartProvider";
import { submitCheckout, getShippingCostAction } from "@/lib/actions/checkout";

const schema = z.object({
  firstName: z.string().trim().min(1, "Ingresa tus nombres"),
  lastName: z.string().trim().min(1, "Ingresa tus apellidos"),
  phone: z.string().trim().min(6, "Ingresa un celular válido"),
  email: z.string().trim().email("Ingresa un correo válido"),
  department: z.string().trim().min(1, "Ingresa el departamento"),
  province: z.string().trim().min(1, "Ingresa la provincia"),
  district: z.string().trim().min(1, "Ingresa el distrito"),
  address: z.string().trim().min(1, "Ingresa tu dirección"),
  reference: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  isGift: z.boolean().optional(),
  giftRecipientName: z.string().trim().optional(),
  giftRecipientPhone: z.string().trim().optional(),
  giftMessage: z.string().trim().optional(),
  giftSpecialPackaging: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CheckoutFormProps {
  /** Se llama justo antes de vaciar el carrito y navegar al pago —
   * evita que la página de checkout se confunda y redirija a
   * /carrito al ver el carrito recién vacío (ver page.tsx). */
  onSubmitted?: () => void;
  /** Costo de envío en vivo (Sección 27/28): se levanta al padre para
   * que CheckoutOrderSummary lo muestre junto al total, en vez de que
   * el comprador lo descubra recién en la página de pago. `attempted`
   * distingue "todavía no escribió su dirección" (cost: null,
   * attempted: false) de "ya la escribió pero no hay zona configurada
   * para ella" (cost: null, attempted: true) — este segundo caso se
   * muestra como "a coordinar", nunca como si faltara algo por llenar. */
  onShippingChange?: (shipping: { cost: number | null; loading: boolean; attempted: boolean }) => void;
}

export function CheckoutForm({ onSubmitted, onShippingChange }: CheckoutFormProps) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isGift: false, giftSpecialPackaging: false },
  });

  const isGift = useWatch({ control, name: "isGift" });
  const department = useWatch({ control, name: "department" });
  const province = useWatch({ control, name: "province" });
  const district = useWatch({ control, name: "district" });

  // Referencia al callback más reciente: así el effect de abajo no
  // necesita re-suscribirse solo porque el padre pasó una función
  // nueva en este render (evita romper el debounce a cada tecla).
  const onShippingChangeRef = useRef(onShippingChange);
  useEffect(() => {
    onShippingChangeRef.current = onShippingChange;
  }, [onShippingChange]);

  // Consulta el costo de envío apenas el comprador termina de escribir
  // su dirección (con un pequeño debounce para no llamar al servidor
  // en cada tecla). Sin departamento todavía, ni se consulta.
  useEffect(() => {
    if (!department?.trim()) {
      onShippingChangeRef.current?.({ cost: null, loading: false, attempted: false });
      return;
    }

    onShippingChangeRef.current?.({ cost: null, loading: true, attempted: false });
    const timer = setTimeout(async () => {
      const cost = await getShippingCostAction(department, province, district);
      onShippingChangeRef.current?.({ cost, loading: false, attempted: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [department, province, district]);

  async function onSubmit(values: FormValues) {
    setServerError(null);

    if (items.length === 0) {
      setServerError("Tu carrito está vacío.");
      return;
    }

    const result = await submitCheckout({
      ...values,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });

    if (!result.ok || !result.orderId) {
      setServerError(result.error ?? "No pudimos registrar tu pedido. Inténtalo nuevamente.");
      return;
    }

    onSubmitted?.();
    clear();
    router.push(`/pedido/${result.orderId}/pago`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-rossana-charcoal md:text-3xl">
          Completa tus datos para continuar
        </h1>
        <p className="mt-1 text-sm text-rossana-charcoal/60">
          No necesitas crear una cuenta.{" "}
          <Link href="/cuenta/login" className="text-rossana-red hover:underline">
            ¿Ya tienes cuenta? Iniciar sesión
          </Link>
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-rossana-charcoal">Tus datos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nombres" {...register("firstName")} error={errors.firstName?.message} />
          <Input label="Apellidos" {...register("lastName")} error={errors.lastName?.message} />
          <Input
            label="Celular / WhatsApp"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Input label="Correo" type="email" {...register("email")} error={errors.email?.message} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-rossana-charcoal">Entrega</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Departamento" {...register("department")} error={errors.department?.message} />
          <Input label="Provincia" {...register("province")} error={errors.province?.message} />
          <Input label="Distrito" {...register("district")} error={errors.district?.message} />
        </div>
        <Input label="Dirección" {...register("address")} error={errors.address?.message} />
        <Input label="Referencia (opcional)" {...register("reference")} />
        <Input label="Indicaciones (opcional)" {...register("instructions")} />
      </section>

      <section className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-rossana-charcoal">
          <input type="checkbox" className="size-4 accent-rossana-red" {...register("isGift")} />
          Este pedido es para regalo
        </label>

        {isGift && (
          <div className="grid grid-cols-1 gap-4 rounded-card border border-rossana-border p-4 sm:grid-cols-2">
            <Input label="Nombre del destinatario" {...register("giftRecipientName")} />
            <Input label="Celular del destinatario" {...register("giftRecipientPhone")} />
            <div className="sm:col-span-2">
              <Input label="Mensaje (opcional)" {...register("giftMessage")} />
            </div>
            <label className="flex items-center gap-2 text-sm text-rossana-charcoal sm:col-span-2">
              <input
                type="checkbox"
                className="size-4 accent-rossana-red"
                {...register("giftSpecialPackaging")}
              />
              Quiero presentación especial de regalo
            </label>
          </div>
        )}
      </section>

      {serverError && (
        <p className="rounded-card border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger transition-opacity duration-200 ease-[var(--ease-out)] starting:opacity-0 motion-reduce:transition-none">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full sm:w-auto">
        CONTINUAR AL PAGO
      </Button>
    </form>
  );
}
