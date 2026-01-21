// Core Domain Types
export function Ok(value) {
    return { ok: true, value };
}
export function Err(error) {
    return { ok: false, error };
}
