import { Event } from "@/services/coreService";

interface EventStatusBadgeProps {
    status: Event['status'];
    size?: 'sm' | 'md' | 'lg';
}

export default function EventStatusBadge({ status, size = 'md' }: EventStatusBadgeProps) {
    const statusConfig = {
        Draft: {
            bg: 'bg-gray-500/20',
            border: 'border-gray-500/50',
            text: 'text-gray-200',
            label: 'Draft',
        },
        PendingApproval: {
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/50',
            text: 'text-yellow-200',
            label: 'Pending Approval',
        },
        Approved: {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/50',
            text: 'text-blue-200',
            label: 'Approved',
        },
        Live: {
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/50',
            text: 'text-emerald-200',
            label: 'Live',
        },
        Completed: {
            bg: 'bg-purple-500/20',
            border: 'border-purple-500/50',
            text: 'text-purple-200',
            label: 'Completed',
        },
        Cancelled: {
            bg: 'bg-red-500/20',
            border: 'border-red-500/50',
            text: 'text-red-200',
            label: 'Cancelled',
        },
    };

    const config = statusConfig[status];
    const sizeClasses = {
        sm: 'px-2 py-1 text-[10px]',
        md: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2 text-sm',
    };

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border font-bold uppercase tracking-widest ${
                sizeClasses[size]
            } ${config.bg} ${config.border} ${config.text}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {config.label}
        </span>
    );
}
