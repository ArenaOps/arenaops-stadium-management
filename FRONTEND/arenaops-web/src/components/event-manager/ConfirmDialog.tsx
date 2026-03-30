import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message?: string;
    description?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    onOpenChange?: (open: boolean) => void;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "default" | "destructive" | "danger" | "warning" | "info";
    isLoading?: boolean;
    variant?: "default" | "destructive" | "danger" | "warning" | "info";
}

export default function ConfirmDialog({
    open,
    title,
    message,
    description,
    onConfirm,
    onCancel,
    onOpenChange,
    confirmText,
    cancelText = "Cancel",
    confirmVariant,
    variant,
    isLoading = false,
}: ConfirmDialogProps) {
    const finalDescription = description || message || "";
    const finalVariant = confirmVariant || variant || "default";
    const finalConfirmText = confirmText || (finalVariant === "danger" ? "Delete" : "Confirm");

    const handleOpenChange = (newOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        } else if (!newOpen && onCancel) {
            onCancel();
        }
    };

    const getConfirmButtonClass = () => {
        switch (finalVariant) {
            case "danger":
            case "destructive":
                return "bg-red-600 text-white hover:bg-red-700";
            case "warning":
                return "bg-yellow-600 text-white hover:bg-yellow-700";
            case "info":
            default:
                return "bg-[#10b981] text-black hover:bg-[#059669] font-bold";
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="bg-[#111827] border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white text-lg">{title}</AlertDialogTitle>
                    {finalDescription && (
                        <AlertDialogDescription className="text-gray-400">
                            {finalDescription}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isLoading}
                        className="bg-white/10 text-white hover:bg-white/20 border border-white/20"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={getConfirmButtonClass()}
                    >
                        {isLoading ? "Loading..." : finalConfirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
