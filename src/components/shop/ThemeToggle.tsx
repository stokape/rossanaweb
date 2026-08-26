"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "rossana_theme";

/**
 * Selector de tema claro/oscuro. El tema oscuro es una inversión de
 * las superficies neutras (ver globals.css) — el rojo y el dorado de
 * marca no cambian. Persiste en localStorage; el script inline en
 * layout.tsx aplica el tema guardado antes del primer paint para
 * evitar un parpadeo de tema incorrecto.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sincroniza con el atributo real del <html> (ya aplicado por el
    // script inline en layout.tsx antes del primer paint) — el
    // servidor no sabe qué tema eligió este visitante.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage no disponible (modo privado, etc.) — el tema
      // sigue funcionando para esta sesión, solo no se recuerda.
    }
    setIsDark(next === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="p-2 text-rossana-charcoal hover:text-rossana-red"
    >
      {isDark ? <Sun className="size-5 md:size-6" /> : <Moon className="size-5 md:size-6" />}
    </button>
  );
}
