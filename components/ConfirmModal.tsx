import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const ConfirmModal = ({ open, onClose, onConfirm }: { open: boolean, onClose: () => void, onConfirm: () => void }) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to delete?</DialogTitle>
                </DialogHeader>

                <div className="mt-4 flex justify-end">
                    <button
                        className="mr-2 bg-gray-300 text-gray-700 px-4 py-2 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                    >
                        Delete
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmModal