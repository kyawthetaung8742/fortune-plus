import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";
import { Icons } from "../ui/icons";

interface ActionDropdownProps {
  onPofileView?: () => void;
  onDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disableEdit?: boolean;
  disableDelete?: boolean;
  customItems?: ReactNode;
}

const ActionDropdown = ({
  onPofileView,
  onDetail,
  onEdit,
  onDelete,
  disableEdit,
  disableDelete,
  customItems,
}: ActionDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline_warning">
          Actions
          <Icons.chevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onPofileView && (
          <DropdownMenuItem className="cursor-pointer" onClick={onPofileView}>
            <Icons.eye className="h-4 w-4" />
            Profile View
          </DropdownMenuItem>
        )}
        {onDetail && (
          <DropdownMenuItem className="cursor-pointer" onClick={onDetail}>
            <Icons.info className="h-4 w-4" />
            Detail
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={!disableEdit ? onEdit : undefined}
            disabled={disableEdit}
          >
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={!disableDelete ? onDelete : undefined}
            disabled={disableDelete}
          >
            <Icons.trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
        {customItems}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdown;
