import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteCategory } from "@/hooks/Category/useDeleteCategory";
// adjust this path
import { useState } from "react";


export function DeleteCategoryModal({ id }: { id: number }) {
  const { mutate } = useDeleteCategory();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    mutate(id, {
      onSuccess: () => {
        setOpen(false);
        // close modal after successful delete
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant="destructive">
          حذف
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف عنصر</DialogTitle>
          <DialogDescription>قم بتأكيد الحذف إن كنت ترغب في حذف هذا العنصر</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">{/* Optional: Extra content or message */}</div>
        <DialogFooter>
          <Button onClick={handleDelete} variant="destructive">
            تأكيد الحذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
