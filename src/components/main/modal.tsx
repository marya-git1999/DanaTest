"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Domain } from "@/interfaces/domain";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Switch } from "../ui/switch";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const domainRegex =
  /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

const formSchema = z.object({
  domain: z.string().refine((s) => domainRegex.test(s), {
    message: "Invalid domain.",
  }),
  isActive: z.boolean(),
  status: z.number(),
});

const status = [
  {
    value: 1,
    label: "Pending",
  },
  {
    value: 2,
    label: "Verified",
  },
  {
    value: 3,
    label: "Rejected",
  },
];

type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Domain | null;
  refetch: () => void;
};
async function handleUpdate(
  values: FormValues & { id: string }
): Promise<Domain> {
  const { id, ...formValues } = values;
  const res = await fetch(`https://domain-danajo.liara.run/api/Domain/${id}`, {
    method: "PUT",
    body: JSON.stringify(formValues),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("failed to update");
  return res.json();
}

async function handleCreate(values: FormValues): Promise<Domain> {
  const res = await fetch(`https://domain-danajo.liara.run/api/Domain/`, {
    method: "POST",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("failed to create");
  return res.json();
}

export function DomainModal({
  open,
  onOpenChange,
  initial = null,
  refetch,
}: Props) {
  const isEdit = !!initial?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: isEdit ? initial.domain : "",
      status: isEdit ? initial.status : 1,
      isActive: isEdit ? initial.isActive : false,
    },
  });

  const updateMutation = useMutation({
    mutationFn: handleUpdate,
    onSuccess: (d) => {
      toast.success(`${d.domain} updated successfully`);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error);
    },
  });

  const createMutation = useMutation({
    mutationFn: handleCreate,
    onSuccess: (d) => {
      toast.success(`${d.domain} created successfully`);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error);
    },
  });

  function onSubmit() {
    if (isEdit) {
      updateMutation.mutate({ id: initial.id.toString(), ...form.getValues() });
    } else {
      createMutation.mutate(form.getValues());
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            className="flex w-full flex-col gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Domain</FormLabel>

                  <FormControl>
                    <Input {...field} type="text" placeholder="Domain" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(+value)}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {status.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value.toString()}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>isActive</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">{isEdit ? "Update" : "Submit"}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
