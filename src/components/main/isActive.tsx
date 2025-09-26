import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export function IsActive({
  value,
  setValue,
}: {
  value: boolean;
  setValue: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="active-mode" checked={value} onCheckedChange={setValue} />
      <Label htmlFor="active-mode">Is Active</Label>
    </div>
  );
}
