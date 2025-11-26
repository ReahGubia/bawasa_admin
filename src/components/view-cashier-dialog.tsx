"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CashierWithStatus } from "@/lib/cashier-service"

interface ViewCashierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cashier: CashierWithStatus
  onCashierUpdated?: () => void
}

export function ViewCashierDialog({ open, onOpenChange, cashier }: ViewCashierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cashier Details</DialogTitle>
          <DialogDescription>
            View detailed information of the selected cashier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p><strong>Full Name:</strong> {cashier.full_name}</p>
          <p><strong>Email:</strong> {cashier.email}</p>
          <p><strong>Mobile No:</strong> {cashier.phone || 'N/A'}</p>
          <p><strong>Status:</strong> {cashier.status}</p>
          <p><strong>Hire Date:</strong> {cashier.hire_date}</p>
          <p><strong>Last Login:</strong> {cashier.last_login_at || 'Never'}</p>
          <p><strong>Address:</strong> {cashier.full_address || 'N/A'}</p>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
