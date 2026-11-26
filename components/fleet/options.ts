/** Opciones fijas de los formularios de flota (las mismas del backend) */
const opts = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));

export const LICENSE_CATEGORIES = opts(['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'].map((c) => [c, c]));
export const FUEL_TYPES = opts([['acpm', 'ACPM / Diésel'], ['gasoline', 'Gasolina'], ['gas', 'Gas natural'], ['electric', 'Eléctrico']]);
export const TRANSMISSIONS = opts([['manual', 'Manual'], ['automatic', 'Automática']]);
export const DOCUMENT_TYPES = opts([
  ['CC', 'Cédula de ciudadanía'], ['CE', 'Cédula de extranjería'], ['NIT', 'NIT'], ['PP', 'Pasaporte'],
  ['PPT', 'Permiso por protección temporal'],
]);

/** Texto del vencimiento de un documento: "vence 2027-01-10", "vencido 2026-01-10" o "falta" */
export function expiry(doc: { date_expire: string; valid: boolean } | null, required = true) {
  if (!doc) return required ? { text: 'falta', ok: false } : { text: 'no requerida (vehículo nuevo)', ok: true };
  return { text: `${doc.valid ? 'vence' : 'vencido'} ${doc.date_expire}`, ok: doc.valid };
}
