/**
 * Protocol visibility toggle group rendered in the filters section.
 * @module protocol-toggle
 */

export const PROTOCOL_PALETTES: Record<string, string[]> = {
  BB84:     ["#bfdbfe", "#60a5fa", "#2563eb", "#1e40af", "#1e3a5f"],
  SixState: ["#bbf7d0", "#4ade80", "#16a34a", "#15803d", "#14532d"],
  B92:      ["#fed7aa", "#fb923c", "#ea580c", "#c2410c", "#7c2d12"],
};

export const PROTOCOL_PRIMARY: Record<string, string> = {
  BB84: "#2563eb",
  SixState: "#16a34a",
  B92: "#ea580c",
};

let active: Set<string> = new Set();
let onChange: ((protocols: string[]) => void) | null = null;
let wrapper: HTMLElement | null = null;

export function initProtocolToggle(cb: (protocols: string[]) => void): void {
  onChange = cb;
}

export function showProtocolToggle(protocols: string[]): string[] {
  const container = document.getElementById("filters-section")!;
  hideProtocolToggle();

  active = new Set(protocols);
  wrapper = document.createElement("div");
  wrapper.id = "protocol-toggle";
  wrapper.className = "flex flex-col gap-1";

  const label = document.createElement("span");
  label.className = "text-[10px] uppercase text-slate-500 dark:text-slate-400 font-medium";
  label.textContent = "Protocols";
  wrapper.appendChild(label);

  const btnGroup = document.createElement("div");
  btnGroup.className = "flex gap-1";

  for (const p of protocols) {
    const btn = document.createElement("button");
    btn.dataset.protocol = p;
    btn.textContent = p;
    btn.className = "text-xs font-mono px-2 py-1 rounded border transition-colors";
    applyBtnStyle(btn, true);
    btn.addEventListener("click", () => {
      const isActive = active.has(p);
      if (isActive && active.size === 1) return;
      if (isActive) active.delete(p); else active.add(p);
      applyBtnStyle(btn, active.has(p));
      onChange?.(getActiveProtocols());
    });
    btnGroup.appendChild(btn);
  }

  wrapper.appendChild(btnGroup);
  container.appendChild(wrapper);
  return protocols;
}

export function hideProtocolToggle(): void {
  wrapper?.remove();
  wrapper = null;
}

export function getActiveProtocols(): string[] {
  return [...active];
}

function applyBtnStyle(btn: HTMLElement, on: boolean): void {
  const color = PROTOCOL_PRIMARY[btn.dataset.protocol!] || "#64748b";
  if (on) {
    btn.style.backgroundColor = color;
    btn.style.borderColor = color;
    btn.style.color = "#fff";
  } else {
    btn.style.backgroundColor = "transparent";
    btn.style.borderColor = "#94a3b8";
    btn.style.color = "#94a3b8";
  }
}
