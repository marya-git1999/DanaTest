import { Input } from "@/components/ui/input";

export function SearchBox({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <Input
      className="w-[200px]"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      type="text"
      placeholder="Search..."
    />
  );
}
