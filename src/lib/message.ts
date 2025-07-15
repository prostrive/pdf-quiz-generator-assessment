"use client"
import { toast } from "sonner";

// Custom hook for standardized toast notifications
const useMessage = () => {
    return {
        notifyError: (msg: string) => toast.error(msg),
        notifySuccess: (msg: string) => toast.success(msg),
        notifyInfo: (msg: string) => toast.info(msg),
        notifyWarning: (msg: string) => toast.warning(msg),
    };
};

export { useMessage };