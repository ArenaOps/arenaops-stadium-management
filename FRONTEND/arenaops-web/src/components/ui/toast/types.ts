// toast/types.ts

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
    /** Duration in ms before auto-dismiss. Pass 0 to disable. Default: 4000 */
    duration?: number;
};

export type ToastContextValue = {
    toasts: Toast[];
    addToast: (
        message: string,
        type?: ToastType,
        options?: Partial<Pick<Toast, "title" | "duration">>
    ) => void;
    removeToast: (id: string) => void;
};
