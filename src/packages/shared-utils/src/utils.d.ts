export declare function formatCurrency(amount: number, currency?: string): string;
export declare function formatDate(date: string | Date): string;
export declare function generateId(prefix?: string): string;
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function clamp(value: number, min: number, max: number): number;
export declare function slugify(text: string): string;
export declare function isEmpty(obj: any): boolean;
export declare function sleep(ms: number): Promise<void>;
//# sourceMappingURL=utils.d.ts.map